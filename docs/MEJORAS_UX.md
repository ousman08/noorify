mkdir -p docs && cat << 'EOF' > docs/MEJORAS_UX.md
# Mejoras de Usabilidad (UX) - Noorify

Documento de seguimiento para mejoras detectadas probando la app en iPhone.

---

## 1. Reflexión de Salah: Botones más limpios
- **Estado actual:** Muestra 3 opciones por oración (`hecha`, `todavía no`, `sin anotar`).
- **Mejora:**
  - Eliminar la opción visible "sin anotar".
  - Dejar solo **2 botones claros** por oración (Fajr, Dhuhr, Asr, Maghrib, Isha): **"Sí"** y **"Todavía no"**.
  - Al empezar el día ambos están desmarcados (neutros). Si se toca uno se marca; si se vuelve a tocar el mismo, se desmarca.

---

## 2. Sesión de Dhikr: Evitar cierre accidental en iPhone
- **Estado actual:** Al deslizar el dedo hacia abajo en iOS, la pantalla modal se cierra sola y se pierde la cuenta.
- **Mejora:**
  - Configurar `gestureEnabled: false` en `app/_layout.tsx` para la ruta `sesion-dhikr`.
  - La única forma de salir sin guardar debe ser pulsando la cruz (`X`) arriba, pidiendo siempre confirmación (*"¿Seguro que quieres salir sin guardar?"*) si hay progreso activo.

---

## 3. Sesión de Dhikr: Rondas seguidas (Tasbih completo)
- **Estado actual:** Al terminar una tanda (ej. 33 toques) y pulsar guardar, saca al usuario a la pantalla de Inicio y obliga a volver a entrar desde cero.
- **Mejora:**
  - Añadir el botón **"Guardar ronda"** (activo cuando el contador actual > 0).
  - Al pulsarlo, suma esa tanda a un listado visible dentro de la misma pantalla (ej. *Ronda 1: 33 toques · Ronda 2: 33 toques*) junto con el **Total acumulado**, y reinicia el contador actual a `0` sin salir de la pantalla.
  - Al terminar todo el Dhikr, pulsar **"Finalizar y salir"**: guarda el total acumulado en `AsyncStorage`, muestra el mensaje de cierre sereno y vuelve a Inicio.
  - La próxima vez que el usuario entre a una sesión nueva, empieza limpio desde `0`.
  - *(Nota: Mantener etiquetas neutras como "Ronda 1, Ronda 2..." o marcador pendiente de revisión hasta validar textos religiosos).*

---

## Prompt listo para ejecutar en OpenCode (Modo Plan)
Cuando vayas a implementar estas mejoras, abre OpenCode en modo **Plan** y dile:

> Lee el archivo `docs/MEJORAS_UX.md`. Vamos a implementar los 3 puntos descritos ahí, manteniendo la arquitectura actual (`constants/theme.ts` y `AsyncStorage`), actualizando los tests en `__tests__/` y verificando con `pnpm tsc --noEmit` y `pnpm test`. Muéstrame primero el plan de archivos antes de modificar nada.
EOF
