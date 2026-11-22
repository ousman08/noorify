cd ~/proyectos/noorify && cat << 'EOF' > README.md
# Noorify

Aplicación móvil diseñada para acompañar hábitos islámicos diarios con calma, constancia y sin presión.

## Filosofía
- **Constancia sin culpa:** Sin rachas punitivas, sin alarmas agresivas ni comparaciones.
- **Privacidad primero:** Los datos y registros se almacenan localmente en el dispositivo del usuario.
- **Diseño sereno:** Interfaz limpia, espaciada y pensada para la concentración.

## Stack Tecnológico
- **Framework:** React Native + Expo (SDK 58)
- **Enrutado:** Expo Router
- **Lenguaje:** TypeScript
- **Almacenamiento local:** AsyncStorage
- **Testing:** Jest + React Native Testing Library
- **Gestor de paquetes:** pnpm

## Estructura del proyecto
```text
app/              # Pantallas y navegación (Expo Router)
components/       # Componentes reutilizables de interfaz
constants/        # Paleta de colores, espaciados y tema visual
lib/              # Lógica de negocio y persistencia local
__tests__/        # Pruebas unitarias y de componentes
```

## Ejecución en local
```bash
# Instalar dependencias
pnpm install

# Arrancar servidor de desarrollo (Expo Go)
pnpm expo start

# Ejecutar pruebas y verificación de tipos
pnpm test
pnpm tsc --noEmit
```
EOF
