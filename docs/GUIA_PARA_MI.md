# Guía de Noorify: curso Los Tres Principios

## Probar la app en el móvil

1. Abre una terminal en la carpeta del proyecto.
2. Ejecuta `pnpm install`.
3. Inicia Expo con `pnpm expo start`.
4. Abre Expo Go en el móvil y escanea el código QR. El móvil y el ordenador deben poder comunicarse por la red.

## Añadir o editar una lección

1. Abre `content/curso-1/lecciones/`.
2. Crea un archivo como `l04.ts`, siguiendo la estructura de `l01.ts`.
3. Escribe únicamente a partir de fuentes incluidas en `docs/fuentes/`.
4. Añade la lección a `content/curso-1/index.ts`, en su unidad y orden correctos.
5. Déjala siempre en estado `draft`.

Si no hay una fuente suficiente, conserva el texto `TODO: contenido pendiente de revisión`. No rellenes huecos de memoria.

## Pasar una lección a revisión

Entrega al revisor el borrador, las fuentes y las referencias. Dile claramente que el primer borrador lo ha redactado una IA y que todavía no está aprobado.

Lista para el revisor:

- ¿Es fiel a la fuente?
- ¿La referencia es correcta?
- ¿El árabe y las aleyas son correctos?
- ¿El lenguaje es claro?
- ¿Algo puede malentenderse?

Solo se cambia `status` a `reviewed` cuando una persona con conocimiento aprueba esa lección. No cambies ese estado por el simple hecho de que el texto parezca correcto.

## Privacidad

El progreso del curso se guarda localmente en el dispositivo. No se crea una cuenta ni se envían datos a un servidor.
