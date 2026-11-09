export type EventDraft = {
  name: string;
  budget: string;
  date: string;
  time: string;
  location: string;
};

export type ParticipantDraft = {
  key: string;
  name: string;
  phone: string;
  email: string;
};

export type ExclusionDraft = {
  key: string;
  a: string;
  b: string;
};
