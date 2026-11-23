# Mejoras de Usabilidad (UX) - Noorify

Seguimiento de mejoras detectadas al probar la app.

## 1. Reflexión de Salah: botones más limpios
- [ ] Eliminar la opción visible «sin anotar».
- [ ] Dejar dos opciones neutras por oración: «Sí» y «Todavía no».
- [ ] Permitir desmarcar una opción tocándola de nuevo.

**Estado:** pendiente. Esta fase no modifica la pantalla ni el almacenamiento de la reflexión de Salah.

## 2. Sesión de Dhikr: evitar cierres y pérdida de progreso
- [x] Desactivar el gesto de cierre de la ruta de dhikr en iOS mediante `gestureEnabled: false`.
- [x] Interceptar el botón atrás de Android y mostrar la confirmación para salir sin guardar.
- [x] Guardar un borrador local con toques y tiempo activo, con escritura diferida y al pasar a segundo plano.
- [x] Ofrecer continuar el borrador reciente o empezar de cero.
- [x] Eliminar el borrador al guardar o descartar la sesión.

**Notas:** los borradores tienen una antigüedad máxima de 24 horas y se validan antes de restaurarlos. Las sesiones finalizadas mantienen su formato y la clave `noorify:dhikr:sessions:v1`.

## 3. Sesión de Dhikr: rondas seguidas
- [ ] Añadir «Guardar ronda» para acumular varias tandas sin salir.
- [ ] Mostrar el total acumulado y permitir finalizar la sesión completa.

**Estado:** pendiente; no se ha implementado en esta fase.

## 4. Limpieza de Inicio y pestañas
- [x] Retirar Comunidad y Sadaqah de la barra de pestañas y eliminar sus archivos de ruta.
- [x] Mantener Perfil sin cambios; sigue siendo una pantalla en construcción.
- [x] Limpiar Inicio de hábitos de ejemplo, estado emocional temporal, momento del día provisional, aviso de pausa y marcador de ilustración.
- [x] Mantener el acceso a dhikr, reflexión de Salah y «Aprender · Los Tres Principios».

