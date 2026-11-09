type ContactInfo = {
  name?: string[];
  tel?: string[];
  email?: string[];
};

type ContactsSelectOptions = {
  multiple?: boolean;
};

interface ContactsManager {
  select(
    properties: Array<"name" | "tel" | "email" | "address" | "icon">,
    options?: ContactsSelectOptions,
  ): Promise<ContactInfo[]>;
  getProperties?(): Promise<string[]>;
}

interface Navigator {
  contacts?: ContactsManager;
}
