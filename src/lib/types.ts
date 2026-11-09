import type { Locale } from "./i18n/config";

export type SendChannel = "whatsapp" | "email";

export type ParticipantRecord = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  token: string;
  giverOfId: string | null;
  lastSentAt: string | null;
  lastSentChannel: SendChannel | null;
};

export type ExclusionRecord = {
  aId: string;
  bId: string;
};

export type DrawRecord = {
  id: string;
  adminToken: string;
  locale: Locale;
  name: string;
  budget: number | null;
  eventDate: string | null;
  eventTime: string | null;
  location: string | null;
  template: string;
  createdAt: string;
  drawnAt: string | null;
  participants: ParticipantRecord[];
  exclusions: ExclusionRecord[];
};

export type Database = {
  version: 1;
  draws: DrawRecord[];
};

export type AssignmentView = {
  id: string;
  name: string;
};

export type AdminParticipantView = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  token: string;
  revealUrl: string;
  assignment: AssignmentView | null;
  whatsappUrl: string | null;
  message: string;
  lastSentAt: string | null;
  lastSentChannel: SendChannel | null;
};

export type AdminDrawView = {
  draw: {
    id: string;
    name: string;
    budget: number | null;
    eventDate: string | null;
    eventTime: string | null;
    location: string | null;
    template: string;
    createdAt: string;
    drawnAt: string | null;
    locale: Locale;
    participantCount: number;
    exclusionCount: number;
    adminUrl: string;
  };
  participants: AdminParticipantView[];
  email: {
    configured: boolean;
    provider: "resend" | "smtp" | "none";
  };
};

export type RevealView = {
  draw: {
    name: string;
    budget: number | null;
    eventDate: string | null;
    eventTime: string | null;
    location: string | null;
  };
  participant: {
    name: string;
  };
  receiver: {
    name: string;
  };
  message: string;
};
