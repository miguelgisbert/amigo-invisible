import type { Locale } from "./config";

const ca = {
  meta: {
    title: "Amic invisible · Sortejos sense embolics",
    titleTemplate: "%s · Amic invisible",
    description:
      "Organitza l'amic invisible en tres minuts. Reparteix els noms per WhatsApp o correu amb enllaços privats, exclusions per a parelles i un panell per reenviar missatges.",
    socialDescription:
      "Sortejos d'amic invisible per a grups de veritat. Enllaços privats, WhatsApp i correu, tot des del mòbil.",
  },
  common: {
    appName: "Amic invisible",
    home: "Inici",
    back: "Enrere",
    next: "Continua",
    cancel: "Cancel·la",
    close: "Tanca",
    copy: "Copia",
    copied: "Copiat",
    save: "Guarda",
    optional: "Opcional",
    loading: "Carregant…",
    retry: "Torna-ho a provar",
    send: "Envia",
    markSent: "Marca com enviat",
    markPending: "Marca com pendent",
    language: "Idioma",
    catalan: "Català",
    spanish: "Castellà",
    yes: "Sí",
    install: "Instal·la l'app",
    whatsapp: "WhatsApp",
    email: "Correu",
    copyLink: "Copia l'enllaç",
    copyMessage: "Copia el missatge",
    openEmail: "Obre al correu",
    participant: "participant",
    participants: "participants",
    participantCount: (count: number) =>
      `${count} ${count === 1 ? "participant" : "participants"}`,
    exclusionCount: (count: number) =>
      `${count} ${count === 1 ? "regla" : "regles"} d'exclusió`,
    noExclusions: "Sense exclusions",
    pending: "Pendent",
    sent: "Enviat",
    sentWhatsApp: "Enviat per WhatsApp",
    sentEmail: "Enviat per correu",
    budgetPending: "A concretar",
    datePending: "Data per confirmar",
    shortDatePending: "Per confirmar",
    timePending: "Hora per confirmar",
    locationPending: "Lloc per confirmar",
  },
  auth: {
    loginMetaTitle: "Inicia sessió",
    registerMetaTitle: "Crea un compte",
    dashboardMetaTitle: "Els meus sortejos",
    loginTitle: "Inicia sessió",
    loginBody: "Entra per tornar als teus sortejos quan vulguis.",
    registerTitle: "Crea un compte",
    registerBody: "Així podràs tornar a qualsevol sorteig que facis.",
    email: "Correu electrònic",
    password: "Contrasenya",
    passwordHint: "Mínim 8 caràcters.",
    loginCta: "Entra",
    registerCta: "Crea el compte",
    working: "Un moment…",
    noAccount: "Encara no tens compte?",
    hasAccount: "Ja tens compte?",
    goRegister: "Crea'n un",
    goLogin: "Inicia sessió",
    gateTitle: "Inicia sessió per crear el sorteig",
    gateBody: "Així podràs tornar-hi quan vulguis i veure els teus sortejos.",
    dashboardGateTitle: "Inicia sessió per veure els teus sortejos",
    dashboardGateBody: "Així podràs tornar a qualsevol sorteig que hagis creat.",
    registerGate: "Crea un compte",
    myDraws: "Els meus sortejos",
    myDrawsShort: "Sortejos",
    loginLink: "Inicia sessió",
    loginShort: "Entra",
    logout: "Tanca la sessió",
    logoutShort: "Surt",
    dashboardTitle: "Els meus sortejos",
    dashboardBody: "Torna a qualsevol sorteig que hagis creat.",
    emptyTitle: "Encara no has creat cap sorteig.",
    emptyBody: "Comença'n un i el tindràs aquí per tornar-hi.",
    newDraw: "Crea un sorteig",
    openPanel: "Obre el panell",
    backHome: "Torna a l'inici",
    loadError: "No s'han pogut carregar els teus sortejos.",
  },
  footer: {
    madeBy: "Fet per",
    copyright: "© 2026 MGO",
    linkLabel: "Miguel Gisbert",
    serverNote: "Les dades dels sortejos es queden al teu servidor.",
  },
  landing: {
    toolLabel: "Gratis",
    plainTitle: "Organitza l'amic invisible sense embolics.",
    plainBody:
      "Crea el sorteig, reparteix els enllaços privats i deixa que cadascú descobreixi qui li toca. Gratis, amb un compte senzill per tornar-hi quan vulguis.",
    startTitle: "Comença un sorteig",
    startBody:
      "Només cal el nom del sorteig i la llista de participants.",
    startCta: "Crea el sorteig",
    facts: ["Gratis", "Compte senzill", "Enllaços privats"],
    howPlainTitle: "Com funciona",
    howPlainSteps: [
      "Omple els detalls i la llista de participants.",
      "Reparteix els enllaços per WhatsApp o correu.",
      "Cadascú descobreix qui li toca.",
    ],
    existingLink:
      "Si t'han enviat un enllaç, obre'l directament al xat.",
    privacy:
      "Els enllaços són privats i les dades es queden al teu servidor.",
    recent: "Torna al teu darrer sorteig",
  },

  datePicker: {
    placeholder: "Tria una data",
    dialogLabel: "Tria la data de l'entrega",
    previousMonth: "Mes anterior",
    nextMonth: "Mes següent",
    today: "Avui",
    clear: "Esborra",
    selectDay: (date: string) => `Selecciona ${date}`,
  },
  wizard: {
    metaTitle: "Organitza el teu amic invisible",
    metaDescription:
      "Configura el sorteig, afegeix participants, posa exclusions i personalitza el missatge en tres minuts.",
    header: "Nou sorteig",
    stepOf: (step: number, total: number) => `Pas ${step} de ${total}`,
    steps: ["Detalls", "Participants", "Exclusions", "Missatge"],
    titles: [
      "Detalls del sorteig",
      "Participants",
      "Exclusions",
      "Missatge",
    ],
    descriptions: [
      "Les dades que sortiran als missatges i a la pàgina privada.",
      "Afegeix noms i un telèfon o correu per avisar-los.",
      "Opcional. Si dues persones no es poden regalar, afegeix-ho aquí.",
      "Personalitza el missatge que rebran.",
    ],
    continue: "Continua",
    create: "Crea el sorteig",
    creating: "Fent el sorteig…",
    event: {
      nameLabel: "Nom del sorteig",
      namePlaceholder: "Amic invisible de la família",
      budgetLabel: "Pressupost màxim",
      budgetPlaceholder: "25",
      locationLabel: "Lloc de l'entrega",
      locationPlaceholder: "Casa de l'àvia",
      dateLabel: "Data",
      timeLabel: "Hora",
      hint: "Les dades buides apareixeran com a «per confirmar» als missatges. El nom del sorteig és l'únic camp obligatori.",
    },
    participants: {
      participantLabel: "Participant",
      nameLabel: "Nom",
      namePlaceholder: "Nom i cognom",
      phoneLabel: "Telèfon (WhatsApp)",
      phonePlaceholder: "+34 600 000 000",
      emailLabel: "Correu electrònic",
      emailPlaceholder: "nom@correu.cat",
      add: "Afegeix participant",
      hint: "Cal un telèfon o un correu per participant. Pots posar els dos: el telèfon serveix per WhatsApp i el correu per enviar el missatge automàticament.",
      importContacts: "Importa contactes",
      importUnsupported:
        "La importació de contactes només està disponible en alguns navegadors mòbils. Pots afegir-los a mà.",
      importEmpty: "No s'ha importat cap contacte amb telèfon o correu.",
      importError:
        "No s'han pogut llegir els contactes. Torna-ho a provar.",
      importSuccess: (count: number) =>
        `S'ha${count === 1 ? "" : "n"} importat ${count} ${count === 1 ? "contacte" : "contactes"}.`,
      importNoName: "Contacte sense nom",
      contactPickerLabel: "Selecciona contactes del telèfon",
      remove: (name: string) => `Treu ${name}`,
    },
    exclusions: {
      info: "Les regles són mútues: si la Marta i en Pau no es poden regalar, tampoc no es podran regalar en sentit invers. El sorteig les respectarà totes.",
      emptyTitle: "Encara no hi ha cap exclusió.",
      emptyBody: "La majoria de sortejos no en necessiten.",
      rule: (index: number) => `Regla ${index}`,
      cannotGift: "no pot regalar a",
      summary: (a: string, b: string) =>
        `${a} i ${b} no es podran regalar.`,
      add: "Afegeix una exclusió",
      remove: (index: number) => `Treu la regla ${index}`,
      tooFew:
        "Afegeix com a mínim dos participants per crear exclusions.",
      onlyTwo:
        "Amb només dos participants no es pot excloure cap parella: no hi hauria cap combinació possible. Afegeix algú més o treu les regles.",
      fallbackName: (index: number) => `Participant ${index}`,
    },
    template: {
      label: "Missatge per als participants",
      restore: "Restaura",
      helper: "Els camps entre dobles claus s'omplen sols.",
      insertTitle: "Insereix una dada",
      emojis: "Emoticones",
      previewTitle: "Així es veurà al xat",
      previewNote:
        "L'enllaç de la vista prèvia és només un exemple. Cada participant rebrà el seu enllaç privat.",
    },
    validation: {
      nameRequired: "Posa un nom al sorteig.",
      budgetInvalid: "El pressupost no és vàlid.",
      minParticipants: "Calen com a mínim dos participants.",
      participantName: "Cada participant necessita un nom.",
      contactFor: (name: string) =>
        `Afegeix un telèfon o un correu per a ${name}.`,
      phoneFor: (name: string) =>
        `El telèfon de ${name} no sembla vàlid.`,
      emailFor: (name: string) => `El correu de ${name} no sembla vàlid.`,
      duplicateName: (name: string) =>
        `Hi ha dos participants que es diuen «${name}». Afegeix un cognom o un àlies.`,
      ruleNeedsTwo: "Cada regla necessita dos participants.",
      selfExclusion: "Una persona no es pot excloure d'ella mateixa.",
      duplicateRule: "Hi ha una regla duplicada.",
      messageShort: "El missatge és massa curt.",
      impossible:
        "Amb aquestes exclusions no es pot tancar el sorteig. Prova de treure'n alguna o afegeix més participants.",
      createFailed:
        "No s'ha pogut crear el sorteig. Torna-ho a provar.",
      serverFields: {
        nameTooLong: "El nom del sorteig és massa llarg.",
        participantNameTooLong: "El nom del participant és massa llarg.",
        phoneTooLong: "El telèfon és massa llarg.",
        phoneInvalid: "El telèfon no sembla vàlid.",
        phoneDigits: "El telèfon ha de tenir com a mínim 6 xifres.",
        emailTooLong: "El correu és massa llarg.",
        emailInvalid: "El correu no sembla vàlid.",
        dateInvalid: "La data no és vàlida.",
        timeInvalid: "L'hora no és vàlida.",
        budgetInvalid: "El pressupost no és vàlid.",
        budgetNegative: "El pressupost no pot ser negatiu.",
        budgetTooHigh: "El pressupost és massa alt.",
        messageTooShort: "El missatge ha de tenir una mica més de text.",
        messageTooLong: "El missatge és massa llarg.",
        locationTooLong: "El lloc és massa llarg.",
        maxParticipants: "El sorteig admet com a màxim 200 participants.",
        exclusionInvalid: "Hi ha una regla d'exclusió que no és vàlida.",
      },
    },
  },
  admin: {
    metaTitle: "Panell de l'organitzador",
    private: "Panell privat",
    copyAdmin: "Copia l'enllaç",
    copyAdminShort: "Copia",
    createdTitle: "Sorteig creat.",
    createdBody:
      "Ara envia el missatge a cadascú. Ho tens sempre a «Els meus sortejos» quan iniciïs sessió.",
    createdAction: "Envia els missatges",
    createdSecondary: "Els meus sortejos",
    summaryLabel: "El teu sorteig",
    sorted: "Sortejat",
    when: "Quan",
    where: "On",
    budget: "Pressupost",
    people: "Persones",
    panelLink: "Enllaç del panell",
    sectionSendTitle: "Participants",
    sectionSendBody:
      "Envia a cadascú el seu enllaç privat i el nom de qui li toca.",
    showAssignments: "Mostra els emparellaments",
    hideAssignments: "Amaga",
    hiddenNote:
      "Els emparellaments estan ocults per si algú mira la pantalla.",
    hiddenPerParticipant:
      "Emparellament ocult. El missatge ja inclou qui li toca.",
    assignment: (name: string) => `Li toca regalar a ${name}.`,
    emailNotConfiguredTitle: "El correu automàtic no està configurat.",
    emailNotConfiguredBody:
      "Pots enviar per WhatsApp o obrir el teu client de correu. Per activar Resend o SMTP, consulta el fitxer README.md.",
    sendWhatsApp: "Envia WhatsApp",
    sendEmail: "Envia correu",
    sentConfirmTitle: "Has enviat el missatge?",
    sentConfirmBody:
      "Marca'l com a enviat per saber qui ja l'ha rebut.",
    sentConfirmYes: "Sí, marca'l com enviat",
    sentConfirmNo: "Encara no",
    markSent: "Marca com enviat",
    markPending: "Marca com pendent",
    toastWhatsAppOpened: (name: string) =>
      `WhatsApp obert per a ${name}.`,
    toastEmailSent: (name: string) => `Correu enviat a ${name}.`,
    toastMailOpened: (name: string) =>
      `S'obre el client de correu per a ${name}.`,
    toastMarkedSent: (name: string) =>
      `Missatge marcat com enviat per a ${name}.`,
    toastMarkedPending: (name: string) =>
      `Missatge marcat com pendent per a ${name}.`,
    toastCopied: (label: string) => `${label} copiat.`,
    toastCopyError:
      "No s'ha pogut copiar. Selecciona el text manualment.",
    redrawTitle: "Torna a sortejar",
    redrawBody:
      "Genera una combinació nova per a tothom. Si ja has enviat missatges, quedaran desactualitzats.",
    redrawButton: "Torna a sortejar",
    redrawConfirm:
      "Tornar a sortejar canviarà tots els emparellaments. Els missatges que ja has enviat quedaran desactualitzats. Vols continuar?",
    redrawSuccess:
      "S'ha fet un sorteig nou. Revisa els emparellaments.",
    redrawError: "No s'ha pogut tornar a sortejar.",
    loadErrorTitle: "No s'ha pogut obrir el panell.",
    notFoundTitle: "Aquest panell no existeix.",
    notFoundBody:
      "Comprova que hagis obert l'enllaç complet de l'organitzador.",
    footerNote:
      "Comparteix només l'enllaç privat de cada participant. El panell és per a tu.",
    pendingFallback: "Pendent",
  },
  reveal: {
    metaTitle: "El teu amic invisible",
    private: "Enllaç privat",
    greeting: (name: string) => `Hola, ${name}.`,
    toGive: "Et toca regalar a",
    budget: "Pressupost",
    when: "Quan",
    where: "On",
    messageTitle: "El missatge del sorteig",
    saveLink: "Guarda l'enllaç",
    copied: "Enllaç copiat",
    addCalendar: "Afegeix al calendari",
    privacy:
      "Aquest enllaç és només per a tu. No el comparteixis: qui el tingui veurà el teu emparellament.",
    lostLink:
      "Si perds l'enllaç, demana'l a l'organitzador.",
    invalidTitle: "Aquest enllaç no és vàlid.",
    invalidBody:
      "Aquest enllaç no és vàlid o el sorteig ja no existeix.",
    loading: "Obrint el teu enllaç…",
  },
  notFound: {
    title: "Aquesta pàgina no existeix.",
    body: "Potser l'enllaç està incomplet o el sorteig ja no existeix. Comprova el missatge original o torna a començar.",
    home: "Torna a l'inici",
    create: "Organitza un sorteig",
  },
  email: {
    senderName: "Amic invisible",
    subject: (drawName: string) => `🎁 El teu amic invisible: ${drawName}`,
    openLink: "Obrir el meu enllaç privat",
    footer:
      "Aquest correu és privat. L'enllaç mostra el teu emparellament i no l'has de compartir.",
    errors: {
      notConfigured:
        "El correu automàtic no està configurat. Afegeix RESEND_API_KEY i EMAIL_FROM, o les variables SMTP.",
      resendRejected: (details: string) =>
        `Resend ha rebutjat l'enviament. ${details}`,
      resendConnection:
        "No s'ha pogut connectar amb Resend. Torna-ho a provar.",
      smtpFailed: (message: string) =>
        `El servidor SMTP ha fallat: ${message}`,
      noProvider: "No hi ha cap servei de correu configurat.",
    },
  },
  calendar: {
    title: (drawName: string) => `Amic invisible: ${drawName}`,
    details: (budget: string) => `Pressupost: ${budget}`,
    fallbackDetails: "Sorteig d'amic invisible",
  },
  errors: {
    panelNotFound:
      "Aquest panell no existeix o l'enllaç no és vàlid.",
    participantNotFound: "Aquest participant no existeix.",
    noPhone: "Aquest participant no té telèfon.",
    invalidPhone: "El telèfon d'aquest participant no és vàlid.",
    noEmail: "Aquest participant no té correu electrònic.",
    revealNotFound:
      "Aquest enllaç no és vàlid o el sorteig ja no existeix.",
    invalidRequest: "No s'ha pogut llegir la petició.",
    unexpected: "Ha passat un error inesperat. Torna-ho a provar.",
    loadFailed: "No s'ha pogut carregar el panell.",
    createFailed: "No s'ha pogut crear el sorteig.",
    markFailed: "No s'ha pogut actualitzar l'estat del missatge.",
    authRequired: "Inicia sessió per continuar.",
    invalidCredentials: "El correu o la contrasenya no són correctes.",
    emailTaken: "Aquest correu ja té un compte.",
    passwordTooShort: "La contrasenya ha de tenir com a mínim 8 caràcters.",
    passwordTooLong: "La contrasenya és massa llarga.",
    emailInvalid: "El correu no sembla vàlid.",
    authFailed: "No s'ha pogut completar l'operació. Torna-ho a provar.",
  },
  templates: {
    default: `Hola {{giver}}! 🎁

Ja tenim el sorteig d'amic invisible de "{{draw}}" fet.

🎁 Li has de regalar a: {{receiver}}
💶 Pressupost: {{budget}}
📅 Quan: {{date}} a les {{time}}
📍 Lloc: {{location}}

👉 Guarda el teu enllaç privat: {{link}}

Que comenci el joc! 🎁✨`,
    tokens: [
      { token: "{{giver}}", label: "Qui regala" },
      { token: "{{receiver}}", label: "Qui rep" },
      { token: "{{draw}}", label: "Nom del sorteig" },
      { token: "{{budget}}", label: "Pressupost" },
      { token: "{{date}}", label: "Data" },
      { token: "{{time}}", label: "Hora" },
      { token: "{{location}}", label: "Lloc" },
      { token: "{{link}}", label: "Enllaç privat" },
    ],
  },
};

const es: typeof ca = {
  meta: {
    title: "Amigo invisible · Sorteos sin complicaciones",
    titleTemplate: "%s · Amigo invisible",
    description:
      "Organiza el amigo invisible en tres minutos. Reparte los nombres por WhatsApp o correo con enlaces privados, exclusiones para parejas y un panel para reenviar mensajes.",
    socialDescription:
      "Sorteos de amigo invisible para grupos de verdad. Enlaces privados, WhatsApp y correo, todo desde el móvil.",
  },
  common: {
    appName: "Amigo invisible",
    home: "Inicio",
    back: "Atrás",
    next: "Continuar",
    cancel: "Cancelar",
    close: "Cerrar",
    copy: "Copiar",
    copied: "Copiado",
    save: "Guardar",
    optional: "Opcional",
    loading: "Cargando…",
    retry: "Volver a intentarlo",
    send: "Enviar",
    markSent: "Marcar como enviado",
    markPending: "Marcar como pendiente",
    language: "Idioma",
    catalan: "Catalán",
    spanish: "Castellano",
    yes: "Sí",
    install: "Instala la app",
    whatsapp: "WhatsApp",
    email: "Correo",
    copyLink: "Copiar el enlace",
    copyMessage: "Copiar el mensaje",
    openEmail: "Abrir en el correo",
    participant: "participante",
    participants: "participantes",
    participantCount: (count: number) =>
      `${count} ${count === 1 ? "participante" : "participantes"}`,
    exclusionCount: (count: number) =>
      `${count} ${count === 1 ? "regla" : "reglas"} de exclusión`,
    noExclusions: "Sin exclusiones",
    pending: "Pendiente",
    sent: "Enviado",
    sentWhatsApp: "Enviado por WhatsApp",
    sentEmail: "Enviado por correo",
    budgetPending: "Por concretar",
    datePending: "Fecha por confirmar",
    shortDatePending: "Por confirmar",
    timePending: "Hora por confirmar",
    locationPending: "Lugar por confirmar",
  },
  auth: {
    loginMetaTitle: "Inicia sesión",
    registerMetaTitle: "Crea una cuenta",
    dashboardMetaTitle: "Mis sorteos",
    loginTitle: "Inicia sesión",
    loginBody: "Entra para volver a tus sorteos cuando quieras.",
    registerTitle: "Crea una cuenta",
    registerBody: "Así podrás volver a cualquier sorteo que hagas.",
    email: "Correo electrónico",
    password: "Contraseña",
    passwordHint: "Mínimo 8 caracteres.",
    loginCta: "Entrar",
    registerCta: "Crear la cuenta",
    working: "Un momento…",
    noAccount: "¿Todavía no tienes cuenta?",
    hasAccount: "¿Ya tienes cuenta?",
    goRegister: "Crea una",
    goLogin: "Inicia sesión",
    gateTitle: "Inicia sesión para crear el sorteo",
    gateBody: "Así podrás volver cuando quieras y ver tus sorteos.",
    dashboardGateTitle: "Inicia sesión para ver tus sorteos",
    dashboardGateBody: "Así podrás volver a cualquier sorteo que hayas creado.",
    registerGate: "Crear una cuenta",
    myDraws: "Mis sorteos",
    myDrawsShort: "Sorteos",
    loginLink: "Inicia sesión",
    loginShort: "Entrar",
    logout: "Cerrar sesión",
    logoutShort: "Salir",
    dashboardTitle: "Mis sorteos",
    dashboardBody: "Vuelve a cualquier sorteo que hayas creado.",
    emptyTitle: "Todavía no has creado ningún sorteo.",
    emptyBody: "Empieza uno y lo tendrás aquí para volver.",
    newDraw: "Crear un sorteo",
    openPanel: "Abrir el panel",
    backHome: "Volver al inicio",
    loadError: "No se han podido cargar tus sorteos.",
  },
  footer: {
    madeBy: "Hecho por",
    copyright: "© 2026 MGO",
    linkLabel: "Miguel Gisbert",
    serverNote: "Los datos de los sorteos se quedan en tu servidor.",
  },
  landing: {
    toolLabel: "Gratis",
    plainTitle: "Organiza el amigo invisible sin complicaciones.",
    plainBody:
      "Crea el sorteo, reparte los enlaces privados y deja que cada uno descubra a quién le toca. Gratis, con una cuenta sencilla para volver cuando quieras.",
    startTitle: "Empieza un sorteo",
    startBody: "Solo necesitas el nombre del sorteo y la lista de participantes.",
    startCta: "Crear el sorteo",
    facts: ["Gratis", "Cuenta sencilla", "Enlaces privados"],
    howPlainTitle: "Cómo funciona",
    howPlainSteps: [
      "Rellena los detalles y la lista de participantes.",
      "Reparte los enlaces por WhatsApp o correo.",
      "Cada uno descubre a quién le toca.",
    ],
    existingLink: "Si te han enviado un enlace, ábrelo directamente en el chat.",
    privacy: "Los enlaces son privados y los datos se quedan en tu servidor.",
    recent: "Vuelve a tu último sorteo",
  },

  datePicker: {
    placeholder: "Elige una fecha",
    dialogLabel: "Elige la fecha de la entrega",
    previousMonth: "Mes anterior",
    nextMonth: "Mes siguiente",
    today: "Hoy",
    clear: "Borrar",
    selectDay: (date: string) => `Selecciona ${date}`,
  },
  wizard: {
    metaTitle: "Organiza tu amigo invisible",
    metaDescription:
      "Configura el sorteo, añade participantes, pon exclusiones y personaliza el mensaje en tres minutos.",
    header: "Nuevo sorteo",
    stepOf: (step: number, total: number) => `Paso ${step} de ${total}`,
    steps: ["Detalles", "Participantes", "Exclusiones", "Mensaje"],
    titles: [
      "Detalles del sorteo",
      "Participantes",
      "Exclusiones",
      "Mensaje",
    ],
    descriptions: [
      "Los datos que aparecerán en los mensajes y en la página privada.",
      "Añade nombres y un teléfono o correo para avisarles.",
      "Opcional. Si dos personas no pueden regalarse, añádelo aquí.",
      "Personaliza el mensaje que recibirán.",
    ],
    continue: "Continuar",
    create: "Crear el sorteo",
    creating: "Haciendo el sorteo…",
    event: {
      nameLabel: "Nombre del sorteo",
      namePlaceholder: "Amigo invisible de la familia",
      budgetLabel: "Presupuesto máximo",
      budgetPlaceholder: "25",
      locationLabel: "Lugar de la entrega",
      locationPlaceholder: "Casa de la abuela",
      dateLabel: "Fecha",
      timeLabel: "Hora",
      hint: "Los datos vacíos aparecerán como «por confirmar» en los mensajes. El nombre del sorteo es el único campo obligatorio.",
    },
    participants: {
      participantLabel: "Participante",
      nameLabel: "Nombre",
      namePlaceholder: "Nombre y apellidos",
      phoneLabel: "Teléfono (WhatsApp)",
      phonePlaceholder: "+34 600 000 000",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "nombre@correo.es",
      add: "Añadir participante",
      hint: "Hace falta un teléfono o un correo por participante. Puedes poner los dos: el teléfono sirve para WhatsApp y el correo para enviar el mensaje automáticamente.",
      importContacts: "Importar contactos",
      importUnsupported:
        "La importación de contactos solo está disponible en algunos navegadores móviles. Puedes añadirlos a mano.",
      importEmpty: "No se ha importado ningún contacto con teléfono o correo.",
      importError:
        "No se han podido leer los contactos. Vuelve a intentarlo.",
      importSuccess: (count: number) =>
        `Se ${count === 1 ? "ha" : "han"} importado ${count} ${count === 1 ? "contacto" : "contactos"}.`,
      importNoName: "Contacto sin nombre",
      contactPickerLabel: "Selecciona contactos del teléfono",
      remove: (name: string) => `Quita a ${name}`,
    },
    exclusions: {
      info: "Las reglas son mutuas: si Marta y Pau no pueden regalarse, tampoco podrán regalarse en sentido inverso. El sorteo las respetará todas.",
      emptyTitle: "Todavía no hay ninguna exclusión.",
      emptyBody: "La mayoría de sorteos no las necesitan.",
      rule: (index: number) => `Regla ${index}`,
      cannotGift: "no puede regalar a",
      summary: (a: string, b: string) =>
        `${a} y ${b} no podrán regalarse.`,
      add: "Añadir una exclusión",
      remove: (index: number) => `Quita la regla ${index}`,
      tooFew:
        "Añade al menos dos participantes para crear exclusiones.",
      onlyTwo:
        "Con solo dos participantes no se puede excluir ninguna pareja: no habría ninguna combinación posible. Añade a alguien más o quita las reglas.",
      fallbackName: (index: number) => `Participante ${index}`,
    },
    template: {
      label: "Mensaje para los participantes",
      restore: "Restaurar",
      helper: "Los campos entre dobles llaves se rellenan solos.",
      insertTitle: "Inserta un dato",
      emojis: "Emoticonos",
      previewTitle: "Así se verá en el chat",
      previewNote:
        "El enlace de la vista previa es solo un ejemplo. Cada participante recibirá su enlace privado.",
    },
    validation: {
      nameRequired: "Pon un nombre al sorteo.",
      budgetInvalid: "El presupuesto no es válido.",
      minParticipants: "Hacen falta al menos dos participantes.",
      participantName: "Cada participante necesita un nombre.",
      contactFor: (name: string) =>
        `Añade un teléfono o un correo para ${name}.`,
      phoneFor: (name: string) =>
        `El teléfono de ${name} no parece válido.`,
      emailFor: (name: string) => `El correo de ${name} no parece válido.`,
      duplicateName: (name: string) =>
        `Hay dos participantes que se llaman «${name}». Añade un apellido o un alias.`,
      ruleNeedsTwo: "Cada regla necesita dos participantes.",
      selfExclusion: "Una persona no puede excluirse a sí misma.",
      duplicateRule: "Hay una regla duplicada.",
      messageShort: "El mensaje es demasiado corto.",
      impossible:
        "Con estas exclusiones no se puede cerrar el sorteo. Prueba a quitar alguna o añade más participantes.",
      createFailed: "No se ha podido crear el sorteo. Vuelve a intentarlo.",
      serverFields: {
        nameTooLong: "El nombre del sorteo es demasiado largo.",
        participantNameTooLong: "El nombre del participante es demasiado largo.",
        phoneTooLong: "El teléfono es demasiado largo.",
        phoneInvalid: "El teléfono no parece válido.",
        phoneDigits: "El teléfono debe tener al menos 6 dígitos.",
        emailTooLong: "El correo es demasiado largo.",
        emailInvalid: "El correo no parece válido.",
        dateInvalid: "La fecha no es válida.",
        timeInvalid: "La hora no es válida.",
        budgetInvalid: "El presupuesto no es válido.",
        budgetNegative: "El presupuesto no puede ser negativo.",
        budgetTooHigh: "El presupuesto es demasiado alto.",
        messageTooShort: "El mensaje debe tener algo más de texto.",
        messageTooLong: "El mensaje es demasiado largo.",
        locationTooLong: "El lugar es demasiado largo.",
        maxParticipants: "El sorteo admite como máximo 200 participantes.",
        exclusionInvalid: "Hay una regla de exclusión que no es válida.",
      },
    },
  },
  admin: {
    metaTitle: "Panel del organizador",
    private: "Panel privado",
    copyAdmin: "Copiar el enlace",
    copyAdminShort: "Copiar",
    createdTitle: "Sorteo creado.",
    createdBody:
      "Ahora envía el mensaje a cada uno. Lo tienes siempre en «Mis sorteos» cuando inicies sesión.",
    createdAction: "Envía los mensajes",
    createdSecondary: "Mis sorteos",
    summaryLabel: "Tu sorteo",
    sorted: "Sorteado",
    when: "Cuándo",
    where: "Dónde",
    budget: "Presupuesto",
    people: "Personas",
    panelLink: "Enlace del panel",
    sectionSendTitle: "Participantes",
    sectionSendBody:
      "Envía a cada uno su enlace privado y el nombre de quién le toca.",
    showAssignments: "Mostrar los emparejamientos",
    hideAssignments: "Ocultar",
    hiddenNote:
      "Los emparejamientos están ocultos por si alguien mira la pantalla.",
    hiddenPerParticipant:
      "Emparejamiento oculto. El mensaje ya incluye a quién le toca.",
    assignment: (name: string) => `Le toca regalar a ${name}.`,
    emailNotConfiguredTitle: "El correo automático no está configurado.",
    emailNotConfiguredBody:
      "Puedes enviar por WhatsApp o abrir tu cliente de correo. Para activar Resend o SMTP, consulta el archivo README.md.",
    sendWhatsApp: "Enviar WhatsApp",
    sendEmail: "Enviar correo",
    sentConfirmTitle: "¿Has enviado el mensaje?",
    sentConfirmBody:
      "Márcalo como enviado para saber quién ya lo ha recibido.",
    sentConfirmYes: "Sí, márcalo como enviado",
    sentConfirmNo: "Todavía no",
    markSent: "Marcar como enviado",
    markPending: "Marcar como pendiente",
    toastWhatsAppOpened: (name: string) =>
      `WhatsApp abierto para ${name}.`,
    toastEmailSent: (name: string) => `Correo enviado a ${name}.`,
    toastMailOpened: (name: string) =>
      `Se abre el cliente de correo para ${name}.`,
    toastMarkedSent: (name: string) =>
      `Mensaje marcado como enviado para ${name}.`,
    toastMarkedPending: (name: string) =>
      `Mensaje marcado como pendiente para ${name}.`,
    toastCopied: (label: string) => `${label} copiado.`,
    toastCopyError:
      "No se ha podido copiar. Selecciona el texto manualmente.",
    redrawTitle: "Volver a sortear",
    redrawBody:
      "Genera una combinación nueva para todos. Si ya has enviado mensajes, quedarán desactualizados.",
    redrawButton: "Volver a sortear",
    redrawConfirm:
      "Volver a sortear cambiará todos los emparejamientos. Los mensajes que ya has enviado quedarán desactualizados. ¿Quieres continuar?",
    redrawSuccess:
      "Se ha hecho un sorteo nuevo. Revisa los emparejamientos.",
    redrawError: "No se ha podido volver a sortear.",
    loadErrorTitle: "No se ha podido abrir el panel.",
    notFoundTitle: "Este panel no existe.",
    notFoundBody:
      "Comprueba que hayas abierto el enlace completo del organizador.",
    footerNote:
      "Comparte solo el enlace privado de cada participante. El panel es para ti.",
    pendingFallback: "Pendiente",
  },
  reveal: {
    metaTitle: "Tu amigo invisible",
    private: "Enlace privado",
    greeting: (name: string) => `Hola, ${name}.`,
    toGive: "Te toca regalar a",
    budget: "Presupuesto",
    when: "Cuándo",
    where: "Dónde",
    messageTitle: "El mensaje del sorteo",
    saveLink: "Guardar el enlace",
    copied: "Enlace copiado",
    addCalendar: "Añadir al calendario",
    privacy:
      "Este enlace es solo para ti. No lo compartas: quien lo tenga verá tu emparejamiento.",
    lostLink: "Si pierdes el enlace, pídeselo al organizador.",
    invalidTitle: "Este enlace no es válido.",
    invalidBody: "Este enlace no es válido o el sorteo ya no existe.",
    loading: "Abriendo tu enlace…",
  },
  notFound: {
    title: "Esta página no existe.",
    body: "Quizá el enlace esté incompleto o el sorteo ya no existe. Comprueba el mensaje original o vuelve a empezar.",
    home: "Volver al inicio",
    create: "Organiza un sorteo",
  },
  email: {
    senderName: "Amigo invisible",
    subject: (drawName: string) => `🎁 Tu amigo invisible: ${drawName}`,
    openLink: "Abrir mi enlace privado",
    footer:
      "Este correo es privado. El enlace muestra tu emparejamiento y no debes compartirlo.",
    errors: {
      notConfigured:
        "El correo automático no está configurado. Añade RESEND_API_KEY y EMAIL_FROM, o las variables SMTP.",
      resendRejected: (details: string) =>
        `Resend ha rechazado el envío. ${details}`,
      resendConnection:
        "No se ha podido conectar con Resend. Vuelve a intentarlo.",
      smtpFailed: (message: string) =>
        `El servidor SMTP ha fallado: ${message}`,
      noProvider: "No hay ningún servicio de correo configurado.",
    },
  },
  calendar: {
    title: (drawName: string) => `Amigo invisible: ${drawName}`,
    details: (budget: string) => `Presupuesto: ${budget}`,
    fallbackDetails: "Sorteo de amigo invisible",
  },
  errors: {
    panelNotFound: "Este panel no existe o el enlace no es válido.",
    participantNotFound: "Este participante no existe.",
    noPhone: "Este participante no tiene teléfono.",
    invalidPhone: "El teléfono de este participante no es válido.",
    noEmail: "Este participante no tiene correo electrónico.",
    revealNotFound: "Este enlace no es válido o el sorteo ya no existe.",
    invalidRequest: "No se ha podido leer la petición.",
    unexpected: "Ha ocurrido un error inesperado. Vuelve a intentarlo.",
    loadFailed: "No se ha podido cargar el panel.",
    createFailed: "No se ha podido crear el sorteo.",
    markFailed: "No se ha podido actualizar el estado del mensaje.",
    authRequired: "Inicia sesión para continuar.",
    invalidCredentials: "El correo o la contraseña no son correctos.",
    emailTaken: "Este correo ya tiene una cuenta.",
    passwordTooShort: "La contraseña debe tener al menos 8 caracteres.",
    passwordTooLong: "La contraseña es demasiado larga.",
    emailInvalid: "El correo no parece válido.",
    authFailed: "No se ha podido completar la operación. Vuelve a intentarlo.",
  },
  templates: {
    default: `¡Hola {{giver}}! 🎁

Ya tenemos el sorteo de amigo invisible de "{{draw}}".

🎁 Te toca regalar a: {{receiver}}
💶 Presupuesto: {{budget}}
📅 Cuándo: {{date}} a las {{time}}
📍 Lugar: {{location}}

👉 Guarda tu enlace privado: {{link}}

¡Que empiece el juego! 🎁✨`,
    tokens: [
      { token: "{{giver}}", label: "Quién regala" },
      { token: "{{receiver}}", label: "Quién recibe" },
      { token: "{{draw}}", label: "Nombre del sorteo" },
      { token: "{{budget}}", label: "Presupuesto" },
      { token: "{{date}}", label: "Fecha" },
      { token: "{{time}}", label: "Hora" },
      { token: "{{location}}", label: "Lugar" },
      { token: "{{link}}", label: "Enlace privado" },
    ],
  },
};

export const dictionaries = { ca, es };

export type Dictionary = typeof ca;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function getDefaultTemplate(locale: Locale): string {
  return dictionaries[locale].templates.default;
}
