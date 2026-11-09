import { AppError } from "./errors";
import { readDatabase, writeDatabase } from "./store";
import { createId, createToken } from "./tokens";
import { generateAssignments } from "./algorithm";
import { buildMessage, emailSubject } from "./message";
import { buildWhatsAppUrl } from "./whatsapp";
import { getEmailStatus, sendEmail } from "./email";
import type { Locale } from "./i18n/config";
import { getDictionary } from "./i18n/dictionaries";
import type { CreateDrawInput } from "./validation";
import type {
  AdminDrawView,
  Database,
  DrawRecord,
  ParticipantRecord,
  RevealView,
  SendChannel,
} from "./types";

function findDraw(database: Database, adminToken: string): DrawRecord | undefined {
  return database.draws.find((draw) => draw.adminToken === adminToken);
}

function requireDraw(
  database: Database,
  adminToken: string,
  locale: Locale,
): DrawRecord {
  const draw = findDraw(database, adminToken);

  if (!draw) {
    throw new AppError(getDictionary(locale).errors.panelNotFound, 404);
  }

  return draw;
}

function participantMap(draw: DrawRecord): Map<string, ParticipantRecord> {
  return new Map(draw.participants.map((participant) => [participant.id, participant]));
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
): Promise<DrawRecord> {
  const now = new Date().toISOString();
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

  const draw: DrawRecord = {
    id: createId(),
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

  await writeDatabase((database) => {
    database.draws.push(draw);
  });

  return draw;
}

export function getAdminView(
  draw: DrawRecord,
  baseUrl: string,
  uiLocale: Locale,
): AdminDrawView {
  const email = getEmailStatus();
  const byId = participantMap(draw);

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

export async function getAdminDraw(
  adminToken: string,
  locale: Locale,
): Promise<DrawRecord> {
  return readDatabase((database) => requireDraw(database, adminToken, locale));
}

export async function getRevealView(
  token: string,
  baseUrl: string,
): Promise<RevealView | null> {
  return readDatabase((database) => {
    for (const draw of database.draws) {
      const participant = draw.participants.find((candidate) => candidate.token === token);

      if (!participant) {
        continue;
      }

      const receiver = participant.giverOfId
        ? draw.participants.find((candidate) => candidate.id === participant.giverOfId)
        : undefined;

      if (!receiver) {
        return null;
      }

      return {
        draw: {
          name: draw.name,
          budget: draw.budget,
          eventDate: draw.eventDate,
          eventTime: draw.eventTime,
          location: draw.location,
        },
        participant: { name: participant.name },
        receiver: { name: receiver.name },
        message: messageFor(draw, participant, baseUrl),
      };
    }

    return null;
  });
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
  const dict = getDictionary(input.locale);

  return writeDatabase((database) => {
    const draw = requireDraw(database, input.adminToken, input.locale);
    const participant = draw.participants.find(
      (candidate) => candidate.id === input.participantId,
    );

    if (!participant) {
      throw new AppError(dict.errors.participantNotFound, 404);
    }

    if (input.sent) {
      const channel = input.channel ?? participant.lastSentChannel ?? "whatsapp";
      participant.lastSentAt = new Date().toISOString();
      participant.lastSentChannel = channel;
      return { sent: true, channel };
    }

    participant.lastSentAt = null;
    participant.lastSentChannel = null;
    return { sent: false, channel: null };
  });
}

export async function redraw(
  adminToken: string,
  locale: Locale,
): Promise<DrawRecord> {
  const dict = getDictionary(locale);

  return writeDatabase((database) => {
    const draw = requireDraw(database, adminToken, locale);
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

    for (const participant of draw.participants) {
      participant.giverOfId = assignments.get(participant.id) ?? null;
      participant.lastSentAt = null;
      participant.lastSentChannel = null;
    }

    draw.drawnAt = new Date().toISOString();
    return draw;
  });
}
