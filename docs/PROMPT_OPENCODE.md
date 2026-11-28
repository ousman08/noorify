# Prompt para OpenCode

Lee primero `AGENTS.md` y respeta la arquitectura actual de Noorify.

## Objetivo

Redactar las lecciones `l04` a `l12` del curso «Los Tres Principios», siguiendo exactamente el tipo `Lesson` de `content/types.ts` y utilizando `content/curso-1/lecciones/l01.ts`, `l02.ts` y `l03.ts` como modelo.

Añade cada nueva lección a `content/curso-1/index.ts` y conserva el orden y los títulos ya definidos.

## Reglas de contenido obligatorias

- Utiliza exclusivamente documentos y referencias disponibles en `docs/fuentes/`. Comprueba la licencia de cada fuente antes de utilizarla.
- No redactes contenido religioso de memoria ni inventes aleyas, hadices, textos árabes, atribuciones, referencias ni explicaciones.
- Si no hay fuentes suficientes, deja el texto como `TODO: contenido pendiente de revisión`.
- Si una lección necesita árabe y la fuente no permite verificarlo, usa `arabic: { text: "TODO", ref: "TODO", verified: false }`.
- Escribe en español sencillo y con frases cortas. Cada elemento de `body` debe tener como máximo 120 palabras.
- Incluye referencias exactas en `sources` y dudas concretas en `reviewNotes`.
- Todas las lecciones nuevas deben tener `status: "draft"`. No cambies ningún estado a `reviewed`.
- Pide al usuario que una persona con conocimiento revise cada lección antes de aprobarla.
- No incluyas opiniones propias ni juicios sobre otros musulmanes o grupos.

## Implementación y comprobación

1. Revisa el código existente antes de modificarlo.
2. No añadas dependencias ni pruebas nuevas.
3. Ejecuta `pnpm tsc --noEmit`.
4. Informa de los errores y de cualquier comprobación que no se haya podido ejecutar.
5. Antes de cambiar cualquier estado, detente y pide una revisión humana explícita.
