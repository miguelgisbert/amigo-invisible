# Amic invisible · Amigo invisible

Aplicació web mòbil per organitzar sortejos d'amic invisible: configuració de l'esdeveniment, participants, exclusions, sorteig robust amb enllaços privats i enviament per WhatsApp o correu.

Inclou català i castellà, detecció automàtica de l'idioma del navegador, PWA instal·lable i importació de contactes del telèfon als navegadors que ho permeten.

## Posar-la en marxa

```bash
npm install
cp .env.example .env.local
npm run dev
```

Obre [http://localhost:3000](http://localhost:3000). L'aplicació et redirigirà a `/ca` o `/es` segons l'idioma del navegador.

Per provar el flux complet:

1. Crea un sorteig a `/ca/crear` o `/es/crear`.
2. Guarda l'enllaç del panell d'organitzador que es mostra en crear-lo.
3. Des del panell, revisa els participants, envia missatges i marca'ls com enviats.

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
- Els fitxers de dades es guarden amb permisos `0600` dins d'una carpeta `0700`.
- Els enllaços i les dades dels sortejos no s'indexen als cercadors.
- El service worker no cacheja respostes de l'API ni pàgines amb tokens.

## Emmagatzematge

Les dades es guarden a `data/draws.json` (configurable amb `AMIGO_DATA_DIR`). El repositori inclou una capa d'accés serialitzada per evitar escriptures concurrents i fa servir escriptures atòmiques amb `rename`.

Per a un desplegament amb més volum, substitueix `src/lib/store.ts` per una base de dades real (Postgres, SQLite, Redis, etc.) mantenint la mateixa interfície `readDatabase` / `writeDatabase`.

> **Important per a Vercel:** el sistema de fitxers de Vercel és efímer. Aquesta versió amb JSON funciona en local, VPS o plataformes amb disc persistent, però a Vercel les dades es perdran entre desplegaments i instàncies. Per a Vercel cal migrar a una base de dades gestionada (Neon/Vercel Postgres, Turso/libSQL o Redis).

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

## Scripts

```bash
npm run dev        # desenvolupament
npm run build      # build de producció
npm run start      # servidor de producció
npm run lint       # ESLint
npm run typecheck  # TypeScript
```

## Desplegament

### Crear el repositori a GitHub des del terminal

```bash
git add .
git commit -m "Amic invisible: app bilingüe, PWA i panell d'organitzador"
git branch -M main

# Amb GitHub CLI
gh repo create amic-invisible --public --source=. --remote=origin --push

# O manualment, després de crear el repositori buit a github.com
git remote add origin git@github.com:EL_TEU_USUARI/amic-invisible.git
git push -u origin main
```

### Vercel

Es pot importar el repositori des del dashboard de Vercel o amb:

```bash
npm i -g vercel
vercel
vercel --prod
```

Variables necessàries a Vercel:

```env
NEXT_PUBLIC_APP_URL=https://elteudomini.vercel.app
RESEND_API_KEY=...
EMAIL_FROM=...
```

**Recomanació:** per a aquesta versió amb emmagatzematge JSON, desplega a Railway, Render, Fly.io o un VPS amb un disc persistent. Si vols Vercel, primer cal migrar `src/lib/store.ts` a Neon/Vercel Postgres, Turso o Redis; si no, els sortejos no sobreviuran als desplegaments.

## Estructura

```
src/
  proxy.ts                   detecció i redirecció d'idioma
  app/
    manifest.ts              manifest PWA
    global-not-found.tsx     404 global bilingüe
    [locale]/
      layout.tsx             html lang, fonts, provider i PWA
      page.tsx               landing
      crear/                 assistent de creació
      admin/[adminToken]/    panell de l'organitzador
      r/[token]/             pàgina privada del participant
    api/
      draws/                 crear sorteig i consultar-lo
      draws/[adminToken]/    reenviar, marcar i tornar a sortejar
      reveal/[token]/        consultar un emparellament privat
  components/
    admin/ create/ i18n/ landing/ pwa/ reveal/ ui/
  lib/
    i18n/                    config i diccionaris ca/es
    algorithm.ts             matching amb exclusions
    draws.ts                 lògica de negoci
    store.ts                 persistència atòmica
    email.ts                 Resend + SMTP
    message.ts               plantilles i placeholders
    tokens.ts                tokens criptogràfics
    validation.ts            esquemes Zod
```
