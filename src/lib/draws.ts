import { AppError } from "./errors";
import { getSql } from "./db";
import { createId, createToken } from "./tokens";
import { generateAssignments } from "./algorithm";
import { buildMessage, emailSubject } from "./message";
import { buildWhatsAppUrl } from "./whatsapp";
import { getEmailStatus, sendEmail } from "./email";
import { defaultLocale, hasLocale, type Locale } from "./i18n/config";
import { getDictionary } from "./i18n/dictionaries";
import type { CreateDrawInput } from "./validation";
import type {
  AdminDrawView,
  DrawRecord,
  ExclusionRecord,
  ParticipantRecord,
  RevealView,
  SendChannel,
  UserDrawSummary,
} from "./types";

type DrawRow = {
  id: string;
  owner_id: string | null;
  admin_token: string;
  locale: string;
  name: string;
  budget: string | null;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  template: string;
  created_at: Date | string;
  drawn_at: Date | string | null;
};

type ParticipantRow = {
  id: string;
  draw_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  token: string;
  giver_of_id: string | null;
  last_sent_at: Date | string | null;
  last_sent_channel: string | null;
  created_at: Date | string;
};

type ExclusionRow = {
  a_id: string;
  b_id: string;
};

type DrawSummaryRow = DrawRow & {
  participant_count: number;
};

function iso(value: Date | string | null): string | null {
  return value ? new Date(value).toISOString() : null;
}

function mapParticipant(row: ParticipantRow): ParticipantRecord {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    token: row.token,
    giverOfId: row.giver_of_id,
    lastSentAt: iso(row.last_sent_at),
    lastSentChannel:
      row.last_sent_channel === "whatsapp" || row.last_sent_channel === "email"
        ? row.last_sent_channel
        : null,
  };
}

function mapDraw(
  row: DrawRow,
  participants: ParticipantRecord[],
  exclusions: ExclusionRecord[],
): DrawRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    adminToken: row.admin_token,
    locale: hasLocale(row.locale) ? row.locale : defaultLocale,
    name: row.name,
    budget: row.budget === null ? null : Number(row.budget),
    eventDate: row.event_date,
    eventTime: row.event_time,
    location: row.location,
    template: row.template,
    createdAt: new Date(row.created_at).toISOString(),
    drawnAt: iso(row.drawn_at),
    participants,
    exclusions,
  };
}

function mapExclusion(row: ExclusionRow): ExclusionRecord {
  return { aId: row.a_id, bId: row.b_id };
}

function messageFor(
  draw: DrawRecord,
  participant: ParticipantRecord,
  baseUrl: string,
): string {
  const receiver = participant.giverOfId
    ? draw.participants.find((candidate) => candidate.id === participant.giverOfId)
    : undefined;

  return buildMessage(draw.template, {
    locale: draw.locale,
    giverName: participant.name,
    receiverName: receiver?.name ?? participant.name,
    drawName: draw.name,
    budget: draw.budget,
    eventDate: draw.eventDate,
    eventTime: draw.eventTime,
    location: draw.location,
    link: `${baseUrl}/${draw.locale}/r/${participant.token}`,
  });
}

export async function createDraw(
  input: CreateDrawInput,
  locale: Locale,
  ownerId: string,
): Promise<DrawRecord> {
  const sql = getSql();
  const dict = getDictionary(locale);
  const participants: ParticipantRecord[] = input.participants.map((participant) => ({
    id: createId(),
    name: participant.name,
    phone: participant.phone,
    email: participant.email,
    token: createToken(),
    giverOfId: null,
    lastSentAt: null,
    lastSentChannel: null,
  }));

  const exclusions = input.exclusions.map((rule) => ({
    aId: participants[rule.a].id,
    bId: participants[rule.b].id,
  }));

  const assignments = generateAssignments(
    participants.map((participant) => participant.id),
    exclusions,
  );

  if (!assignments) {
    throw new AppError(
      dict.wizard.validation.impossible,
      422,
      "IMPOSSIBLE_DRAW",
    );
  }

  for (const participant of participants) {
    participant.giverOfId = assignments.get(participant.id) ?? null;
  }

  const now = new Date().toISOString();
  const draw: DrawRecord = {
    id: createId(),
    ownerId,
    adminToken: createToken(32),
    locale,
    name: input.name,
    budget: input.budget,
    eventDate: input.date,
    eventTime: input.time,
    location: input.location,
    template: input.template,
    createdAt: now,
    drawnAt: now,
    participants,
    exclusions,
  };

  await sql.begin(async (transaction) => {
    await transaction`
      insert into draws (
        id, owner_id, admin_token, locale, name, budget,
        event_date, event_time, location, template, created_at, drawn_at
      ) values (
        ${draw.id}, ${draw.ownerId}, ${draw.adminToken}, ${draw.locale},
        ${draw.name}, ${draw.budget}, ${draw.eventDate}, ${draw.eventTime},
        ${draw.location}, ${draw.template}, ${draw.createdAt}, ${draw.drawnAt}
      )
    `;

    const participantRows = participants.map((participant) => ({
      id: participant.id,
      draw_id: draw.id,
      name: participant.name,
      phone: participant.phone,
      email: participant.email,
      token: participant.token,
      giver_of_id: participant.giverOfId,
    }));

    await transaction`
      insert into participants ${
        transaction(
          participantRows,
          "id",
          "draw_id",
          "name",
          "phone",
          "email",
          "token",
          "giver_of_id",
        )
      }
    `;

    if (exclusions.length > 0) {
      const exclusionRows = exclusions.map((exclusion) => ({
        draw_id: draw.id,
        a_id: exclusion.aId,
        b_id: exclusion.bId,
      }));

      await transaction`
        insert into exclusions ${
          transaction(exclusionRows, "draw_id", "a_id", "b_id")
        }
      `;
    }
  });

  return draw;
}

export async function getAdminDraw(
  adminToken: string,
  locale: Locale,
): Promise<DrawRecord> {
  const sql = getSql();
  const [drawRow] = await sql<DrawRow[]>`
    select *
    from draws
    where admin_token = ${adminToken}
    limit 1
  `;

  if (!drawRow) {
    throw new AppError(getDictionary(locale).errors.panelNotFound, 404);
  }

  const participantRows = await sql<ParticipantRow[]>`
    select *
    from participants
    where draw_id = ${drawRow.id}
    order by created_at asc
  `;
  const exclusionRows = await sql<ExclusionRow[]>`
    select a_id, b_id
    from exclusions
    where draw_id = ${drawRow.id}
  `;

  return mapDraw(
    drawRow,
    participantRows.map(mapParticipant),
    exclusionRows.map(mapExclusion),
  );
}

export function getAdminView(
  draw: DrawRecord,
  baseUrl: string,
  uiLocale: Locale,
): AdminDrawView {
  const email = getEmailStatus();
  const byId = new Map(
    draw.participants.map((participant) => [participant.id, participant]),
  );

  const participants = draw.participants.map((participant) => {
    const receiver = participant.giverOfId
      ? byId.get(participant.giverOfId)
      : undefined;
    const revealUrl = `${baseUrl}/${draw.locale}/r/${participant.token}`;
    const message = messageFor(draw, participant, baseUrl);

    return {
      id: participant.id,
      name: participant.name,
      phone: participant.phone,
      email: participant.email,
      token: participant.token,
      revealUrl,
      assignment: receiver ? { id: receiver.id, name: receiver.name } : null,
      whatsappUrl: buildWhatsAppUrl(participant.phone, message),
      message,
      lastSentAt: participant.lastSentAt,
      lastSentChannel: participant.lastSentChannel,
    };
  });

  return {
    draw: {
      id: draw.id,
      name: draw.name,
      budget: draw.budget,
      eventDate: draw.eventDate,
      eventTime: draw.eventTime,
      location: draw.location,
      template: draw.template,
      createdAt: draw.createdAt,
      drawnAt: draw.drawnAt,
      locale: draw.locale,
      participantCount: draw.participants.length,
      exclusionCount: draw.exclusions.length,
      adminUrl: `${baseUrl}/${uiLocale}/admin/${draw.adminToken}`,
    },
    participants,
    email,
  };
}

export async function getRevealView(
  token: string,
  baseUrl: string,
): Promise<RevealView | null> {
  const sql = getSql();
  const [row] = await sql<
    Array<{
      participant_name: string;
      participant_token: string;
      draw_name: string;
      budget: string | null;
      event_date: string | null;
      event_time: string | null;
      location: string | null;
      template: string;
      locale: string;
      receiver_name: string | null;
    }>
  >`
    select
      p.name as participant_name,
      p.token as participant_token,
      d.name as draw_name,
      d.budget,
      d.event_date,
      d.event_time,
      d.location,
      d.template,
      d.locale,
      r.name as receiver_name
    from participants p
    join draws d on d.id = p.draw_id
    left join participants r on r.id = p.giver_of_id
    where p.token = ${token}
    limit 1
  `;

  if (!row || !row.receiver_name) {
    return null;
  }

  const drawLocale = hasLocale(row.locale) ? row.locale : defaultLocale;
  const budget = row.budget === null ? null : Number(row.budget);
  const message = buildMessage(row.template, {
    locale: drawLocale,
    giverName: row.participant_name,
    receiverName: row.receiver_name,
    drawName: row.draw_name,
    budget,
    eventDate: row.event_date,
    eventTime: row.event_time,
    location: row.location,
    link: `${baseUrl}/${drawLocale}/r/${row.participant_token}`,
  });

  return {
    draw: {
      name: row.draw_name,
      budget,
      eventDate: row.event_date,
      eventTime: row.event_time,
      location: row.location,
    },
    participant: { name: row.participant_name },
    receiver: { name: row.receiver_name },
    message,
  };
}

export type ResendResult = {
  channel: SendChannel;
  whatsappUrl: string | null;
  message: string;
};

export async function resendParticipant(input: {
  adminToken: string;
  participantId: string;
  channel: SendChannel;
  baseUrl: string;
  locale: Locale;
}): Promise<ResendResult> {
  const draw = await getAdminDraw(input.adminToken, input.locale);
  const dict = getDictionary(input.locale);
  const participant = draw.participants.find(
    (candidate) => candidate.id === input.participantId,
  );

  if (!participant) {
    throw new AppError(dict.errors.participantNotFound, 404);
  }

  const message = messageFor(draw, participant, input.baseUrl);

  if (input.channel === "whatsapp") {
    if (!participant.phone) {
      throw new AppError(dict.errors.noPhone, 400);
    }

    const whatsappUrl = buildWhatsAppUrl(participant.phone, message);

    if (!whatsappUrl) {
      throw new AppError(dict.errors.invalidPhone, 400);
    }

    return { channel: "whatsapp", whatsappUrl, message };
  }

  if (!participant.email) {
    throw new AppError(dict.errors.noEmail, 400);
  }

  if (!getEmailStatus().configured) {
    throw new AppError(dict.email.errors.notConfigured, 503, "EMAIL_NOT_CONFIGURED");
  }

  const result = await sendEmail({
    to: participant.email,
    subject: emailSubject(draw.name, draw.locale),
    text: message,
    link: `${input.baseUrl}/${draw.locale}/r/${participant.token}`,
    locale: draw.locale,
  });

  if (!result.ok) {
    throw new AppError(result.error, 502, "EMAIL_FAILED");
  }

  await markParticipantSent({
    adminToken: input.adminToken,
    participantId: participant.id,
    sent: true,
    channel: "email",
    locale: input.locale,
  });

  return { channel: "email", whatsappUrl: null, message };
}

export async function markParticipantSent(input: {
  adminToken: string;
  participantId: string;
  sent: boolean;
  channel?: SendChannel;
  locale: Locale;
}): Promise<{ sent: boolean; channel: SendChannel | null }> {
  const sql = getSql();
  const dict = getDictionary(input.locale);
  const channel = input.sent ? input.channel ?? "whatsapp" : null;
  const sentAt = input.sent ? new Date() : null;

  const [row] = await sql<Array<{ id: string }>>`
    update participants
    set last_sent_at = ${sentAt}, last_sent_channel = ${channel}
    where id = ${input.participantId}
      and draw_id = (
        select id from draws where admin_token = ${input.adminToken} limit 1
      )
    returning id
  `;

  if (!row) {
    throw new AppError(dict.errors.participantNotFound, 404);
  }

  return { sent: input.sent, channel };
}

export async function redraw(
  adminToken: string,
  locale: Locale,
): Promise<DrawRecord> {
  const sql = getSql();
  const dict = getDictionary(locale);
  const draw = await getAdminDraw(adminToken, locale);
  const assignments = generateAssignments(
    draw.participants.map((participant) => participant.id),
    draw.exclusions,
  );

  if (!assignments) {
    throw new AppError(
      dict.wizard.validation.impossible,
      422,
      "IMPOSSIBLE_DRAW",
    );
  }

  const drawnAt = new Date();

  await sql.begin(async (transaction) => {
    for (const participant of draw.participants) {
      await transaction`
        update participants
        set giver_of_id = ${assignments.get(participant.id) ?? null},
            last_sent_at = null,
            last_sent_channel = null
        where id = ${participant.id}
      `;
    }

    await transaction`
      update draws
      set drawn_at = ${drawnAt}
      where id = ${draw.id}
    `;
  });

  return {
    ...draw,
    drawnAt: drawnAt.toISOString(),
    participants: draw.participants.map((participant) => ({
      ...participant,
      giverOfId: assignments.get(participant.id) ?? null,
      lastSentAt: null,
      lastSentChannel: null,
    })),
  };
}

export async function listDrawsForUser(
  userId: string,
  baseUrl: string,
  uiLocale: Locale,
): Promise<UserDrawSummary[]> {
  const sql = getSql();
  const rows = await sql<DrawSummaryRow[]>`
    select d.*, count(p.id)::int as participant_count
    from draws d
    left join participants p on p.draw_id = d.id
    where d.owner_id = ${userId}
    group by d.id
    order by d.created_at desc
  `;

  return rows.map((row) => {
    const locale = hasLocale(row.locale) ? row.locale : defaultLocale;
    return {
      id: row.id,
      name: row.name,
      locale,
      eventDate: row.event_date,
      eventTime: row.event_time,
      location: row.location,
      participantCount: Number(row.participant_count),
      createdAt: new Date(row.created_at).toISOString(),
      drawnAt: iso(row.drawn_at),
      adminUrl: `${baseUrl}/${uiLocale}/admin/${row.admin_token}`,
    };
  });
}
