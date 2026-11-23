# Asas

App móvil para acompañar el recuerdo de Allah con calma y constancia. Expo / React Native. Prioriza patrones mobile-first, rendimiento y compatibilidad entre plataformas.

## Principios (no romper)

- Sin rachas punitivas, alarmas agresivas ni comparaciones entre usuarios.
- Privacidad primero: los datos se guardan solo en el dispositivo (AsyncStorage). No añadir servidores, analítica ni cuentas sin que se pida.
- Diseño sereno: interfaz limpia y espaciada. Colores y espaciados salen de `constants/`.

## Estructura

- `app/`: pantallas y rutas (Expo Router)
- `components/`: componentes reutilizables
- `constants/`: tema visual
- `lib/`: lógica y persistencia local
- `assets/`: recursos estáticos
- `docs/`: documentación

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch `https://docs.expo.dev/llms.txt`, an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands (this project uses pnpm)

```bash
pnpm expo install <package>   # ALWAYS use instead of pnpm add: resolves SDK-compatible versions
pnpm expo start               # start the dev server
pnpm expo lint                # lint
pnpm tsc --noEmit             # typecheck
pnpm dlx expo-doctor          # diagnose dependency and config issues
pnpm expo install --fix       # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use Expo Router for all navigation. Routes live in `app/`: every file there is a screen, and `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`). Run EAS CLI as `pnpm dlx eas-cli@latest <command>`; substitute that for bare `eas` in docs examples. Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand: configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `pnpm expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Contenido de lecciones

- Redacta lecciones únicamente a partir de fuentes incluidas en `docs/fuentes/`; comprueba su licencia antes de usarlas.
- No escribas contenido religioso de memoria ni inventes aleyas, hadices, textos árabes, atribuciones, referencias o explicaciones.
- Si no hay fuentes suficientes, utiliza `TODO: contenido pendiente de revisión` en los textos.
- Cada lección debe incluir referencias exactas en `sources` y comprobaciones pendientes en `reviewNotes`.
- Si el árabe no puede verificarse en una fuente, utiliza `arabic: { text: "TODO", ref: "TODO", verified: false }`.
- Usa español sencillo y frases cortas. Cada elemento de `body` tendrá un máximo de 120 palabras.
- Toda lección nueva empieza con `status: "draft"`. Nunca cambies a `reviewed` sin aprobación explícita de una persona con conocimiento.
- No incluyas opiniones propias ni juicios sobre otros musulmanes o grupos.
- Si `docs/fuentes/` está vacía, no completes el contenido de memoria: deja los marcadores TODO.
