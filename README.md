# Noorify

Aplicación móvil para acompañar el recuerdo de Allah (dhikr) en el día a día, con calma, constancia y sin presión.

## Filosofía

- **Constancia sin culpa:** sin rachas punitivas, sin alarmas agresivas ni comparaciones.
- **Privacidad primero:** los datos y registros se almacenan localmente en el dispositivo.
- **Diseño sereno:** interfaz limpia, espaciada y pensada para la concentración.

## Stack

- React Native + Expo (SDK 58)
- Expo Router
- TypeScript
- AsyncStorage (almacenamiento local)
- pnpm

## Estructura

```
app/          Pantallas y navegación (Expo Router)
components/   Componentes reutilizables
constants/    Colores, espaciados y tema visual
lib/          Lógica y persistencia local
assets/       Recursos estáticos
docs/         Documentación
```

## Ejecutar en local

```bash
pnpm install
pnpm expo start
pnpm tsc --noEmit
```

## Estado

Proyecto en desarrollo. Las pruebas (Jest + React Native Testing Library) están escritas y se publicarán próximamente.

## Licencia

MIT