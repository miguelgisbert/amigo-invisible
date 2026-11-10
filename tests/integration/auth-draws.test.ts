import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { NextRequest } from "next/server";
import postgres from "postgres";
import {
  createSession,
  createUser,
  deleteSession,
  findUserByEmail,
  getSessionUser,
  hashPassword,
  hashSessionToken,
  requireUser,
  sessionCookieName,
  verifyPassword,
} from "@/lib/auth";
import { getSql } from "@/lib/db";
import { createFeedback } from "@/lib/feedback";
import {
  createDraw,
  getAdminDraw,
  getAdminView,
  getRevealView,
  listDrawsForUser,
  markParticipantSent,
  redraw,
  resendParticipant,
} from "@/lib/draws";
import { AppError } from "@/lib/errors";
import { defaultTemplate } from "@/lib/message";
import type { CreateDrawInput } from "@/lib/validation";

const databaseUrl =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5433/amigo_test";

process.env.DATABASE_URL = databaseUrl;
process.env.DATABASE_SSL = "disable";
delete process.env.RESEND_API_KEY;
delete process.env.SMTP_HOST;
delete process.env.EMAIL_FROM;

const sql = postgres(databaseUrl, {
  ssl: false,
  max: 1,
  onnotice: () => undefined,
});
const baseUrl = "http://localhost:3101";

function createInput(overrides: Partial<CreateDrawInput> = {}): CreateDrawInput {
  return {
    name: "Amic invisible de prova",
    budget: 25,
    date: "2026-12-24",
    time: "20:30",
    location: "Barcelona",
    template: "Hola {{giver}}, regales a {{receiver}}. {{link}}",
    participants: [
      { name: "Marta", phone: "600111222", email: "marta@example.com" },
      { name: "Pau", phone: "600333444", email: null },
      { name: "Laia", phone: null, email: "laia@example.com" },
      { name: "Jordi", phone: "600555666", email: null },
    ],
    exclusions: [{ a: 0, b: 1 }],
    ...overrides,
  };
}

function sessionRequest(token: string): NextRequest {
  return new NextRequest("http://localhost:3101/api/auth/me", {
    headers: { cookie: `${sessionCookieName}=${token}` },
  });
}

beforeAll(async () => {
  const schema = await readFile(
    new URL("../../db/schema.sql", import.meta.url),
    "utf8",
  );
  await sql.unsafe(schema);
});

beforeEach(async () => {
  await sql`
    truncate table feedback, exclusions, participants, draws, sessions, users
    restart identity cascade
  `;
});

afterAll(async () => {
  await sql.end();
  await getSql().end();
});

describe("authentication", () => {
  it("creates users, hashes passwords and finds them by email", async () => {
    const passwordHash = await hashPassword("password123");
    const user = await createUser("  TEST@Example.com ", passwordHash);
    const found = await findUserByEmail("test@example.com");

    expect(user.email).toBe("test@example.com");
    expect(found?.user.id).toBe(user.id);
    expect(await verifyPassword("password123", found?.passwordHash ?? "")).toBe(
      true,
    );
    expect(await verifyPassword("wrong", found?.passwordHash ?? "")).toBe(false);
  });

  it("creates, validates and deletes sessions", async () => {
    const user = await createUser(
      "session@example.com",
      await hashPassword("password123"),
    );
    const session = await createSession(user.id);
    const request = sessionRequest(session.token);

    expect((await getSessionUser(request))?.id).toBe(user.id);
    expect((await requireUser(request, "ca")).id).toBe(user.id);

    await deleteSession(request);
    expect(await getSessionUser(request)).toBeNull();
  });

  it("rejects missing and expired sessions", async () => {
    const user = await createUser(
      "expired@example.com",
      await hashPassword("password123"),
    );
    const expiredToken = "expired-session-token";
    await sql`
      insert into sessions (token_hash, user_id, expires_at)
      values (${hashSessionToken(expiredToken)}, ${user.id}, now() - interval '1 hour')
    `;

    expect(await getSessionUser(sessionRequest(expiredToken))).toBeNull();

    await expect(
      requireUser(new NextRequest("http://localhost:3101/api/auth/me"), "ca"),
    ).rejects.toMatchObject({ status: 401, code: "AUTH_REQUIRED" });
  });
});

describe("draws", () => {
  it("creates a draw, links its owner and exposes the admin view", async () => {
    const user = await createUser(
      "owner@example.com",
      await hashPassword("password123"),
    );
    const draw = await createDraw(createInput(), "ca", user.id);

    expect(draw.ownerId).toBe(user.id);
    expect(draw.participants).toHaveLength(4);
    expect(draw.exclusions).toHaveLength(1);

    const adminDraw = await getAdminDraw(draw.adminToken, "ca");
    expect(adminDraw.name).toBe("Amic invisible de prova");
    expect(adminDraw.participants).toHaveLength(4);

    const view = getAdminView(adminDraw, baseUrl, "ca");
    expect(view.draw.participantCount).toBe(4);
    expect(view.draw.exclusionCount).toBe(1);
    expect(view.draw.adminUrl).toBe(
      `${baseUrl}/ca/admin/${draw.adminToken}`,
    );
    expect(view.participants[0].revealUrl).toContain("/ca/r/");
    expect(view.participants[0].message).toContain("regales a");
    expect(view.participants[0].whatsappUrl).toContain("https://wa.me/");

    const receivers = new Set(
      view.participants.map((participant) => participant.assignment?.name),
    );
    expect(receivers.size).toBe(4);

    const first = adminDraw.participants[0];
    const receiver = adminDraw.participants.find(
      (participant) => participant.id === first.giverOfId,
    );
    const reveal = await getRevealView(first.token, baseUrl);
    expect(reveal?.receiver.name).toBe(receiver?.name);
    expect(reveal?.message).toContain(receiver?.name ?? "");
  });

  it("lists only the current user's draws", async () => {
    const owner = await createUser(
      "owner-list@example.com",
      await hashPassword("password123"),
    );
    const other = await createUser(
      "other@example.com",
      await hashPassword("password123"),
    );
    const draw = await createDraw(createInput(), "ca", owner.id);
    await createDraw(createInput({ name: "Altre sorteig" }), "es", other.id);

    const ownerDraws = await listDrawsForUser(owner.id, baseUrl, "ca");
    const otherDraws = await listDrawsForUser(other.id, baseUrl, "ca");

    expect(ownerDraws).toHaveLength(1);
    expect(ownerDraws[0].id).toBe(draw.id);
    expect(ownerDraws[0].adminUrl).toContain(draw.adminToken);
    expect(otherDraws).toHaveLength(1);
    expect(otherDraws[0].name).toBe("Altre sorteig");
    expect(otherDraws[0].locale).toBe("es");
  });

  it("refuses impossible draws", async () => {
    const user = await createUser(
      "impossible@example.com",
      await hashPassword("password123"),
    );

    await expect(
      createDraw(
        createInput({
          participants: [
            { name: "A", phone: "600000001", email: null },
            { name: "B", phone: "600000002", email: null },
          ],
          exclusions: [{ a: 0, b: 1 }],
        }),
        "ca",
        user.id,
      ),
    ).rejects.toMatchObject({ status: 422, code: "IMPOSSIBLE_DRAW" });
  });

  it("marks messages as sent and pending", async () => {
    const user = await createUser(
      "mark@example.com",
      await hashPassword("password123"),
    );
    const draw = await createDraw(createInput(), "ca", user.id);
    const participant = draw.participants[0];

    expect(
      await markParticipantSent({
        adminToken: draw.adminToken,
        participantId: participant.id,
        sent: true,
        channel: "email",
        locale: "ca",
      }),
    ).toEqual({ sent: true, channel: "email" });

    let adminDraw = await getAdminDraw(draw.adminToken, "ca");
    expect(adminDraw.participants[0].lastSentChannel).toBe("email");
    expect(adminDraw.participants[0].lastSentAt).not.toBeNull();

    await markParticipantSent({
      adminToken: draw.adminToken,
      participantId: participant.id,
      sent: false,
      locale: "ca",
    });

    adminDraw = await getAdminDraw(draw.adminToken, "ca");
    expect(adminDraw.participants[0].lastSentAt).toBeNull();
    expect(adminDraw.participants[0].lastSentChannel).toBeNull();
  });

  it("redraws respecting exclusions and resets sent status", async () => {
    const user = await createUser(
      "redraw@example.com",
      await hashPassword("password123"),
    );
    const draw = await createDraw(createInput(), "ca", user.id);
    const first = draw.participants[0];
    await markParticipantSent({
      adminToken: draw.adminToken,
      participantId: first.id,
      sent: true,
      channel: "whatsapp",
      locale: "ca",
    });

    const before = draw.participants
      .map((participant) => `${participant.id}:${participant.giverOfId}`)
      .sort()
      .join("|");
    let updated = await redraw(draw.adminToken, "ca");
    let after = updated.participants
      .map((participant) => `${participant.id}:${participant.giverOfId}`)
      .sort()
      .join("|");

    for (let attempt = 0; attempt < 5 && before === after; attempt += 1) {
      updated = await redraw(draw.adminToken, "ca");
      after = updated.participants
        .map((participant) => `${participant.id}:${participant.giverOfId}`)
        .sort()
        .join("|");
    }

    expect(after).not.toBe(before);
    expect(
      updated.participants.every((participant) => participant.lastSentAt === null),
    ).toBe(true);
    expect(
      updated.participants.every(
        (participant) => participant.giverOfId !== participant.id,
      ),
    ).toBe(true);

    const marta = updated.participants.find(
      (participant) => participant.name === "Marta",
    );
    const pau = updated.participants.find(
      (participant) => participant.name === "Pau",
    );
    expect(marta?.giverOfId).not.toBe(pau?.id);
    expect(pau?.giverOfId).not.toBe(marta?.id);
  });

  it("returns WhatsApp links without marking them as sent", async () => {
    const user = await createUser(
      "whatsapp@example.com",
      await hashPassword("password123"),
    );
    const draw = await createDraw(createInput(), "ca", user.id);
    const participant = draw.participants[0];

    const result = await resendParticipant({
      adminToken: draw.adminToken,
      participantId: participant.id,
      channel: "whatsapp",
      baseUrl,
      locale: "ca",
    });

    expect(result.channel).toBe("whatsapp");
    expect(result.whatsappUrl).toContain("https://wa.me/");

    const adminDraw = await getAdminDraw(draw.adminToken, "ca");
    expect(adminDraw.participants[0].lastSentAt).toBeNull();
  });

  it("refuses email when no provider is configured", async () => {
    const user = await createUser(
      "email@example.com",
      await hashPassword("password123"),
    );
    const draw = await createDraw(createInput(), "ca", user.id);

    await expect(
      resendParticipant({
        adminToken: draw.adminToken,
        participantId: draw.participants[0].id,
        channel: "email",
        baseUrl,
        locale: "ca",
      }),
    ).rejects.toMatchObject({
      status: 503,
      code: "EMAIL_NOT_CONFIGURED",
    });
  });

  it("returns null for unknown reveal tokens and rejects unknown admin tokens", async () => {
    expect(await getRevealView("unknown-token", baseUrl)).toBeNull();
    await expect(getAdminDraw("unknown-admin-token", "ca")).rejects.toBeInstanceOf(
      AppError,
    );
  });

  it("stores feedback with source metadata", async () => {
    const id = await createFeedback({
      kind: "suggestion",
      message: "M'agrada molt l'eina, però voldria poder eliminar un sorteig.",
      email: "feedback@example.com",
      page: "/ca/sortejos",
      locale: "ca",
    });

    const [row] = await sql<
      Array<{
        source: string;
        kind: string;
        message: string;
        email: string;
        page: string;
        locale: string;
      }>
    >`select source, kind, message, email, page, locale from feedback where id = ${id}`;

    expect(row.source).toBe("amigo-invisible");
    expect(row.kind).toBe("suggestion");
    expect(row.email).toBe("feedback@example.com");
    expect(row.page).toBe("/ca/sortejos");
    expect(row.locale).toBe("ca");
    expect(row.message).toContain("eliminar");
  });

  it("localizes messages according to the draw locale", async () => {
    const user = await createUser(
      "spanish@example.com",
      await hashPassword("password123"),
    );
    const draw = await createDraw(
      createInput({
        name: "Amigo invisible oficina",
        template: defaultTemplate("es"),
      }),
      "es",
      user.id,
    );
    const view = getAdminView(draw, baseUrl, "es");

    expect(view.participants[0].message).toContain("Te toca regalar a");
    expect(view.participants[0].revealUrl).toContain("/es/r/");
    expect(view.draw.adminUrl).toContain("/es/admin/");
  });
});
