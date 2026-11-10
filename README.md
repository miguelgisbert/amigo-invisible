# Amic invisible · Amigo invisible

Aplicació web mòbil per organitzar sortejos d'amic invisible: configuració de l'esdeveniment, participants, exclusions, sorteig robust amb enllaços privats, compte d'organitzador i enviament per WhatsApp o correu.

Inclou català i castellà, detecció automàtica de l'idioma del navegador, PWA instal·lable i importació de contactes del telèfon als navegadors que ho permeten.

## Posar-la en marxa

```bash
npm install
cp .env.example .env.local
```

Crea un projecte gratuït a [Neon](https://neon.com) (o qualsevol Postgres), copia la cadena de connexió a `DATABASE_URL` dins `.env.local` i executa:

```bash
npm run db:migrate
npm run dev
```

Obre [http://localhost:3000](http://localhost:3000). L'aplicació et redirigirà a `/ca` o `/es` segons l'idioma del navegador.

Per provar el flux complet:

1. Crea un compte a `/ca/registre` o `/es/registre`.
2. Crea el sorteig.
3. Torna-hi quan vulguis des de **Els meus sortejos** o des de l'enllaç del panell.
4. Des del panell, revisa els participants, envia missatges i marca'ls com enviats.

## Comptes i autenticació

- Registre i accés amb correu i contrasenya.
- Contrasenyes amb `scrypt` i sal aleatòria; mai es guarden en text pla.
- Sessions amb token aleatori; a la base de dades només es guarda el hash SHA-256.
- Cookie de sessió `HttpOnly`, `SameSite=Lax` i `Secure` en producció, amb 30 dies de validesa.
- Cada sorteig guarda l'usuari que l'ha creat. El panell **Els meus sortejos** mostra tots els sortejos del compte.
- L'enllaç privat del panell continua funcionant com a credencial directa, de manera que pots compartir-lo o recuperar-lo des del compte.
- No es fa servir cap servei extern d'autenticació.

Limitacions actuals de l'autenticació: no hi ha verificació de correu, recuperació de contrasenya ni rate limiting als endpoints d'accés. L'enllaç privat del panell continua donant accés directe sense login, per disseny.

## Idiomes

- El `proxy.ts` llegeix `Accept-Language` i la cookie `NEXT_LOCALE` per triar l'idioma inicial.
- El selector `CA / ES` del header canvia l'idioma sense perdre el formulari i actualitza la URL.
- El sorteig guarda l'idioma de creació. Els missatges, els enllaços privats i els calendaris generats fan servir aquest idioma.
- Les dates i els imports es formategen amb `Intl` segons l'idioma actiu.

## PWA i contactes

- `manifest.webmanifest`, icones 192/512 i icona maskable.
- Service worker només en producció (`npm run build && npm start`). No cacheja API ni pàgines privades.
- Botó d'instal·lació quan el navegador dispara `beforeinstallprompt`.
- A l'apartat de participants apareix **Importa contactes** si el navegador suporta la Contact Picker API (Chrome Android, context segur). Si no, es mostra un avís i es poden afegir a mà.
- A iOS els contactes no són accessibles des del navegador per una limitació de la plataforma.

## Seguretat

- Cada participant té un token aleatori de 24 bytes (`crypto.randomBytes`), generat al servidor.
- El panell de l'organitzador té un token separat de 32 bytes.
- L'enllaç privat és la credencial: no hi ha cap llistat públic d'emparellaments.
- Les contrasenyes es deriven amb `scrypt`; les sessions es guarden hashejades.
- Els enllaços i les dades dels sortejos no s'indexen als cercadors.
- El service worker no cacheja respostes de l'API ni pàgines amb tokens.

## Base de dades

La persistència és Postgres. L'esquema és a `db/schema.sql` i s'aplica amb:

```bash
npm run db:migrate
```

Taules principals:

- `users`: comptes d'organitzador.
- `sessions`: sessions autenticades.
- `draws`: sortejos, propietari, idioma, configuració i token del panell.
- `participants`: participants, telèfon, correu, token privat i assignació.
- `exclusions`: regles mútues entre participants.

Les integracions de Vercel Postgres/Neon poden exposar la connexió com a `POSTGRES_URL`; l'aplicació accepta qualsevol de les dues variables.

Per a producció, executa la migració contra la base de dades de producció abans del primer desplegament:

```bash
DATABASE_URL="postgresql://..." npm run db:migrate
```

## Feedback

El peu de pàgina inclou un formulari ràpid de **Suggeriments** que desa els missatges a la taula `feedback` de Postgres amb el camp `source = 'amigo-invisible'`, la pàgina, l'idioma i el correu opcional.

Si configureu `FEEDBACK_EMAIL`, s'enviarà una notificació per Resend/SMTP amb l'assumpte `[amigo-invisible] ...`. Si no, el missatge igualment queda desat a la base de dades.

Si reutilitzeu la plantilla d'EmailJS de `miguelgisbert.dev` per a la web principal, passeu-hi una variable `source` (per exemple `miguelgisbert.dev` o `amigo-invisible`) i mostreu-la al template. El límit de EmailJS és per crear plantilles; podeu reutilitzar la que ja teniu.

## Correu electrònic

El panell pot enviar el missatge automàticament si configures un proveïdor:

### Resend

```env
RESEND_API_KEY=re_...
EMAIL_FROM="Amic invisible <hola@elteudomini.cat>"
```

### SMTP

```env
SMTP_HOST=smtp.elteudomini.cat
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
EMAIL_FROM="Amic invisible <hola@elteudomini.cat>"
```

Si no hi ha cap proveïdor configurat, el panell continua funcionant: ofereix WhatsApp i un enllaç `mailto:` per obrir el client de correu de l'organitzador.

## WhatsApp

Els missatges es generen amb l'enllaç `https://wa.me/<telèfon>?text=<missatge>`. Els telèfons de 9 xifres s'interpreten com a números espanyols i s'hi afegeix el prefix `34`.

En obrir WhatsApp no es marca el missatge com enviat automàticament: el panell pregunta si realment s'ha enviat. També hi ha un control manual per canviar l'estat.

## Motor de sorteig

`src/lib/algorithm.ts` resol el sorteig com un problema de matching bipartit perfecte:

- Cada participant regala exactament a una persona i en rep exactament d'una.
- Ningú no es pot regalar a si mateix.
- Les exclusions són mútues.
- S'utilitza l'algorisme de camins augmentants de Kuhn amb ordre i llistes aleatoritzades amb `crypto.randomInt`, de manera que el resultat és impredictible i el càlcul és polinomial.

## Proves

El projecte inclou proves unitàries, d'integració i end-to-end. Les proves d'integració i E2E utilitzen una base de dades Postgres de test, mai la de producció.

### Base de dades de test

```bash
npm run test:db:up     # Postgres de test al port 5433 via Docker Compose
npm run test:db:setup  # aplica db/schema.sql i buida les taules
```

Si no tens Docker Compose, aixeca un Postgres al port `5433` amb base de dades `amigo_test`, usuari `postgres` i contrasenya `postgres`, o defineix `TEST_DATABASE_URL`.

### Executar les proves

```bash
npm run test:unit         # algorisme, format, missatges, validació, auth i i18n
npm run test:integration  # auth, sessions, sortejos, panell, reveal, redraw i enviament
npm run test:e2e          # build + test DB + Playwright (Chromium mòbil)
npm run test:coverage     # cobertura de les llibreries (necessita la test DB)
npm run test:all          # unit + integració + E2E
```

`test:coverage` executa també les proves d'integració, així que necessita la base de dades de test en marxa.

L'E2E aixeca l'aplicació en producció al port `3101`, amb la base de dades de test, i cobreix:

- registre, login, logout i portada d'autenticació;
- assistent de creació, datepicker, importació de contactes (API simulada), canvi d'idioma sense perdre dades;
- exclusions, plantilla, creació del sorteig i banner de sorteig creat;
- llistat de participants, emparellaments ocults/visibles, enviament per WhatsApp amb confirmació i marcatge manual;
- panell “Els meus sortejos”, accés per token sense sessió i pàgina privada del participant;
- PWA (manifest, icones, service worker), 404 i absència d'overflow horitzontal a 320, 390, 768 i 1440 px.

El CI de GitHub Actions executa lint, typecheck, proves unitàries, d'integració i Playwright amb un servei Postgres.

## Scripts

```bash
npm run dev              # desenvolupament
npm run build            # build de producció
npm run start            # servidor de producció
npm run db:migrate       # aplica db/schema.sql
npm run lint             # ESLint
npm run typecheck        # TypeScript
npm run test:unit        # proves unitàries
npm run test:integration # proves d'integració
npm run test:e2e         # proves end-to-end
npm run test:coverage    # cobertura (amb test DB)
npm run test:all         # totes les proves
npm run test:db:up       # arrenca la test DB
npm run test:db:setup    # migra i buida la test DB
npm run test:db:down     # atura la test DB
```

## Desplegament

### Crear el repositori a GitHub des del terminal

```bash
git add .
git commit -m "Amic invisible: cuenta, Postgres, PWA y panel de organizador"
git branch -M main

# Amb GitHub CLI
gh repo create amigo-invisible --public --source=. --remote=origin --push

# O manualment, després de crear el repositori buit a github.com
git remote add origin git@github.com:EL_TEU_USUARI/amigo-invisible.git
git push -u origin main
```

### Vercel + Neon

Vercel Hobby és gratuït per a projectes personals no comercials i permet fins a 200 projectes. Neon Free permet fins a 100 projectes, amb 1 GB d'emmagatzematge i 100 CU-hours per projecte i mes (límits de 2026; comprova’ls abans de desplegar). Per a aquesta eina gratuïta és suficient.

1. Crea un projecte a Neon i copia la connexió pooled.
2. Afig `DATABASE_URL` i `NEXT_PUBLIC_APP_URL` a Vercel.
3. Executa la migració contra la base de dades de producció.
4. Desplega:

```bash
npm i -g vercel
vercel
vercel --prod
```

Variables necessàries a Vercel:

```env
DATABASE_URL=postgresql://...
DATABASE_SSL=require
NEXT_PUBLIC_APP_URL=https://elteudomini.vercel.app
RESEND_API_KEY=...
EMAIL_FROM=...
FEEDBACK_EMAIL=...
```

Si en algun moment el projecte passa a ser comercial, Vercel Hobby no és la modalitat correcta; caldria passar a Pro.

## Estructura

```
db/
  schema.sql                 esquema Postgres
scripts/
  migrate.mjs                migració
src/
  proxy.ts                   detecció i redirecció d'idioma
  app/
    manifest.ts              manifest PWA
    global-not-found.tsx     404 global bilingüe
    [locale]/
      layout.tsx             html lang, fonts, providers i PWA
      page.tsx               landing
      crear/                 assistent de creació
      entrar/ registre/      autenticació
      sortejos/              Els meus sortejos
      admin/[adminToken]/    panell de l'organitzador
      r/[token]/             pàgina privada del participant
    api/
      auth/                  registre, login, logout i sessió
      draws/                 crear, consultar i gestionar sortejos
      reveal/[token]/        consultar un emparellament privat
  components/
    admin/ auth/ create/ i18n/ landing/ pwa/ reveal/ ui/
  lib/
    auth.ts                  contrasenyes i sessions
    db.ts                    client Postgres
    i18n/                    config i diccionaris ca/es
    algorithm.ts             matching amb exclusions
    draws.ts                 lògica de negoci i consultes
    email.ts                 Resend + SMTP
    message.ts               plantilles i placeholders
    tokens.ts                tokens criptogràfics
    validation.ts            esquemes Zod
tests/
  e2e/                       Playwright
  integration/               Vitest + Postgres
  setup-db.mjs               preparació de la base de dades de test
.github/workflows/ci.yml     CI
docker-compose.yml           Postgres de test
playwright.config.ts
vitest.config.mts
```
