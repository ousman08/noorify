import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState, BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AvisoProvisional from '@/components/AvisoProvisional';
import { colors, radius, spacing } from '@/constants/theme';
import {
  borrarBorrador,
  cargarBorrador,
  formatearCronometro,
  formatearDuracion,
  guardarBorrador,
  guardarSesion,
  type BorradorDhikr,
  type SesionDhikr,
} from '@/lib/dhikrSessions';

type Estado = 'activa' | 'pausada';

export default function SesionDhikr() {
  const [iniciadaEn, setIniciadaEn] = useState(() => Date.now());
  const [estado, setEstado] = useState<Estado>('activa');
  const [acumuladoMs, setAcumuladoMs] = useState(0);
  const [inicioTramo, setInicioTramo] = useState(() => Date.now());
  const [ahora, setAhora] = useState(() => Date.now());

  const [toques, setToques] = useState(0);
  const [confirmarFinal, setConfirmarFinal] = useState(false);
  const [confirmarSalida, setConfirmarSalida] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardada, setGuardada] = useState<SesionDhikr | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sesionLista, setSesionLista] = useState(false);
  const [borradorPendiente, setBorradorPendiente] = useState<BorradorDhikr | null>(null);

  useEffect(() => {
    let montado = true;
    cargarBorrador()
      .then((borrador) => {
        if (!montado) return;
        if (borrador) setBorradorPendiente(borrador);
        else setSesionLista(true);
      })
      .catch(() => {
        if (montado) setSesionLista(true);
      });
    return () => { montado = false; };
  }, []);

  const continuarBorrador = () => {
    if (!borradorPendiente) return;
    const momento = Date.now();
    setIniciadaEn(borradorPendiente.startedAtMs);
    setAcumuladoMs(borradorPendiente.activeMs);
    setToques(borradorPendiente.toques);
    setEstado(borradorPendiente.activeSinceMs === null ? 'pausada' : 'activa');
    setInicioTramo(borradorPendiente.activeSinceMs ?? momento);
    setAhora(momento);
    setBorradorPendiente(null);
    setSesionLista(true);
  };

  const empezarDeCero = async () => {
    const borrado = await borrarBorrador();
    if (!borrado) {
      setError('No se pudo borrar el borrador anterior. Inténtalo otra vez.');
      return;
    }
    const momento = Date.now();
    setIniciadaEn(momento);
    setEstado('activa');
    setAcumuladoMs(0);
    setInicioTramo(momento);
    setAhora(momento);
    setToques(0);
    setBorradorPendiente(null);
    setSesionLista(true);
    setError(null);
  };

  const guardarBorradorActual = useCallback(async () => {
    const momento = Date.now();
    const activoActual = acumuladoMs +
      (estado === 'activa' ? Math.max(0, momento - inicioTramo) : 0);
    await guardarBorrador({
      version: 1,
      startedAtMs: iniciadaEn,
      activeMs: activoActual,
      activeSinceMs: estado === 'activa' ? momento : null,
      toques,
      updatedAtMs: momento,
    });
  }, [acumuladoMs, estado, inicioTramo, iniciadaEn, toques]);

  // El cronómetro se apoya en marcas de tiempo reales, no en contar ticks.
  useEffect(() => {
    if (!sesionLista || estado !== 'activa' || guardada !== null) return;
    const intervalo = setInterval(() => setAhora(Date.now()), 250);
    return () => clearInterval(intervalo);
  }, [estado, guardada, sesionLista]);

  const activoMs =
    guardada !== null
      ? guardada.duracionActivaSegundos * 1000
      : acumuladoMs + (estado === 'activa' ? Math.max(0, ahora - inicioTramo) : 0);

  const segundosActivos = Math.floor(activoMs / 1000);
  useEffect(() => {
    if (!sesionLista || borradorPendiente !== null || guardada !== null || guardando) return;
    const temporizador = setTimeout(() => {
      void guardarBorradorActual().catch(() => {
        setError('No se pudo guardar el borrador en el teléfono.');
      });
    }, 1000);
    return () => clearTimeout(temporizador);
  }, [sesionLista, borradorPendiente, guardada, guardando, estado, acumuladoMs, inicioTramo, iniciadaEn, toques, guardarBorradorActual]);

  useEffect(() => {
    if (!sesionLista || borradorPendiente !== null || guardada !== null) return;
    const suscripcion = AppState.addEventListener('change', (siguienteEstado) => {
      if (siguienteEstado === 'background' || siguienteEstado === 'inactive') {
        void guardarBorradorActual().catch(() => {
          setError('No se pudo guardar el borrador en el teléfono.');
        });
      }
    });
    return () => suscripcion.remove();
  }, [sesionLista, borradorPendiente, guardada, estado, acumuladoMs, inicioTramo, iniciadaEn, toques]);

  useEffect(() => {
    const suscripcion = BackHandler.addEventListener('hardwareBackPress', () => {
      if (guardada !== null) return false;
      if (!sesionLista) return true;
      setConfirmarSalida(true);
      return true;
    });
    return () => suscripcion.remove();
  }, [sesionLista, guardada]);


  const pausar = () => {
    const momento = Date.now();
    setAcumuladoMs((previo) => previo + Math.max(0, momento - inicioTramo));
    setAhora(momento);
    setEstado('pausada');
  };

  const reanudar = () => {
    const momento = Date.now();
    setInicioTramo(momento);
    setAhora(momento);
    setEstado('activa');
  };

  const finalizar = async () => {
    if (guardando || guardada !== null) return;

    setGuardando(true);
    setError(null);

    const fin = Date.now();
    const activoFinal =
      acumuladoMs + (estado === 'activa' ? Math.max(0, fin - inicioTramo) : 0);

    const sesion: SesionDhikr = {
      id: `${fin}-${Math.random().toString(36).slice(2, 8)}`,
      iniciadaEn: new Date(iniciadaEn).toISOString(),
      finalizadaEn: new Date(fin).toISOString(),
      duracionActivaSegundos: Math.max(0, Math.round(activoFinal / 1000)),
      duracionTotalSegundos: Math.max(0, Math.round((fin - iniciadaEn) / 1000)),
      toques,
    };

    try {
      await guardarSesion(sesion);
      const borradorEliminado = await borrarBorrador();
      if (!borradorEliminado) setError('La sesión se guardó, pero no se pudo borrar el borrador anterior.');
      setGuardada(sesion);
      setConfirmarFinal(false);
    } catch {
      setError('No se pudo guardar en el teléfono. Inténtalo otra vez.');
      setConfirmarFinal(false);
    } finally {
      setGuardando(false);
    }
  };

  const cerrarPantalla = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  };

  const salirSinGuardar = async () => {
    setGuardando(true);
    const borrado = await borrarBorrador();
    if (!borrado) {
      setError('No se pudo descartar el borrador. La sesión permanece abierta.');
      setGuardando(false);
      setConfirmarSalida(false);
      return;
    }
    setConfirmarSalida(false);
    cerrarPantalla();
  };

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <View style={styles.cabecera}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={guardada !== null ? 'Volver al inicio' : 'Cerrar la sesión'}
          onPress={() => (guardada !== null ? cerrarPantalla() : setConfirmarSalida(true))}
          hitSlop={12}
          style={({ pressed }) => [styles.botonCerrar, pressed && styles.pulsado]}>
          <Ionicons name="close" size={22} color={colors.textMuted} />
        </Pressable>
        <Text style={styles.cabeceraTitulo}>Sesión de dhikr</Text>
        <View style={styles.cabeceraHueco} />
      </View>

      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}>
        {!sesionLista ? (
          <View style={styles.cierre}>
            <Text style={styles.cierreTexto}>Preparando tu sesión…</Text>
            {error !== null ? <Text style={styles.errorTexto}>{error}</Text> : null}
          </View>
        ) : guardada !== null ? (
          <View style={styles.cierre}>
            <View style={styles.cierreIcono}>
              <Ionicons name="checkmark" size={34} color={colors.primary} />
            </View>
            <Text style={styles.cierreTitulo}>Sesión guardada con calma</Text>
            <Text style={styles.cierreTexto}>
              {formatearDuracion(guardada.duracionActivaSegundos)}
              {guardada.toques > 0 ? ` · ${guardada.toques} toques` : ''}
            </Text>
            <Text style={styles.cierreNota}>
              Se ha guardado solo en tu teléfono. Puedes verla en Progreso.
            </Text>
            {error !== null ? <Text style={styles.errorTexto}>{error}</Text> : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Volver al inicio"
              onPress={cerrarPantalla}
              style={({ pressed }) => [styles.botonPrincipal, pressed && styles.botonPrincipalPulsado]}>
              <Text style={styles.botonPrincipalTexto}>Volver al inicio</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.cronometroBloque}>
              <Text style={styles.estado}>
                {estado === 'activa' ? 'En calma' : 'En pausa'}
              </Text>
              <Text
                accessibilityLabel={`Tiempo transcurrido: ${formatearCronometro(segundosActivos)}`}
                style={styles.cronometro}>
                {formatearCronometro(segundosActivos)}
              </Text>
              <Text style={styles.cronometroNota}>El tiempo cuenta solo mientras está en marcha.</Text>
            </View>

            <View style={styles.marcadorContenido}>
              <Ionicons name="leaf-outline" size={22} color={colors.inactive} />
              <Text style={styles.marcadorTexto}>Contenido / frase pendiente de revisión</Text>
            </View>

            <View style={styles.contadorBloque}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Contar un dhikr"
                onPress={() => setToques((previo) => previo + 1)}
                style={({ pressed }) => [styles.contador, pressed && styles.contadorPulsado]}>
                <Text style={styles.contadorNumero}>{toques}</Text>
                <Text style={styles.contadorEtiqueta}>toques</Text>
              </Pressable>
              <Text style={styles.contadorAyuda}>
                Toca el círculo con calma. No hay objetivo ni racha que cumplir.
              </Text>
            </View>

            <View style={styles.filaControles}>
              {estado === 'activa' ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Pausar la sesión"
                  onPress={pausar}
                  style={({ pressed }) => [styles.botonSecundario, pressed && styles.pulsado]}>
                  <Ionicons name="pause" size={18} color={colors.primary} />
                  <Text style={styles.botonSecundarioTexto}>Pausar</Text>
                </Pressable>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Reanudar la sesión"
                  onPress={reanudar}
                  style={({ pressed }) => [styles.botonSecundario, pressed && styles.pulsado]}>
                  <Ionicons name="play" size={18} color={colors.primary} />
                  <Text style={styles.botonSecundarioTexto}>Reanudar</Text>
                </Pressable>
              )}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Finalizar la sesión"
                onPress={() => setConfirmarFinal(true)}
                style={({ pressed }) => [styles.botonPrincipal, pressed && styles.botonPrincipalPulsado]}>
                <Text style={styles.botonPrincipalTexto}>Finalizar</Text>
              </Pressable>
            </View>

            {error !== null ? (
              <View style={styles.error}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
                <Text style={styles.errorTexto}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.pie}>Se guarda solo en tu teléfono. Nada se envía a ningún sitio.</Text>
          </>
        )}
      </ScrollView>

      <AvisoProvisional
        visible={borradorPendiente !== null}
        enLinea
        onClose={() => {}}
        titulo="Hay una sesión sin terminar"
        mensaje="Puedes continuar donde lo dejaste o empezar una sesión nueva."
        etiquetaPrincipal="Continuar sesión"
        onPrincipal={continuarBorrador}
        accionSecundaria={{ etiqueta: 'Empezar de cero', onPress: () => void empezarDeCero() }}
      />

      <AvisoProvisional
        visible={confirmarFinal}
        enLinea
        onClose={() => setConfirmarFinal(false)}
        titulo="Finalizar sesión"
        mensaje={`Se guardarán ${formatearDuracion(segundosActivos)}${
          toques > 0 ? ` y ${toques} toques` : ''
        }. Podrás verla en Progreso.`}
        etiquetaPrincipal={guardando ? 'Guardando…' : 'Finalizar y guardar'}
        onPrincipal={finalizar}
        accionSecundaria={{ etiqueta: 'Seguir', onPress: () => setConfirmarFinal(false) }}
      />

      <AvisoProvisional
        visible={confirmarSalida}
        enLinea
        onClose={() => setConfirmarSalida(false)}
        titulo="Salir de la sesión"
        mensaje="Si sales ahora, esta sesión no se guardará."
        etiquetaPrincipal="Seguir aquí"
        accionSecundaria={{ etiqueta: 'Salir sin guardar', onPress: salirSinGuardar }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  botonCerrar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cabeceraTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
  cabeceraHueco: {
    width: 36,
  },
  contenido: {
    flexGrow: 1,
    padding: spacing.xl,
    gap: spacing.xl,
    justifyContent: 'center',
  },
  cronometroBloque: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  estado: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.inactive,
  },
  cronometro: {
    fontSize: 64,
    fontWeight: '300',
    color: colors.text,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  cronometroNota: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  marcadorContenido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.lg,
  },
  marcadorTexto: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  contadorBloque: {
    alignItems: 'center',
    gap: spacing.md,
  },
  contador: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  contadorPulsado: {
    backgroundColor: colors.primarySoft,
  },
  contadorNumero: {
    fontSize: 40,
    fontWeight: '600',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  contadorEtiqueta: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  contadorAyuda: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  filaControles: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  botonPrincipal: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonPrincipalPulsado: {
    backgroundColor: colors.primaryDark,
  },
  botonPrincipalTexto: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  botonSecundario: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonSecundarioTexto: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  pulsado: {
    opacity: 0.7,
  },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.errorBg,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  errorTexto: {
    flex: 1,
    fontSize: 14,
    color: colors.error,
  },
  pie: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    textAlign: 'center',
  },
  cierre: {
    alignItems: 'center',
    gap: spacing.md,
  },
  cierreIcono: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cierreTitulo: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  cierreTexto: {
    fontSize: 16,
    color: colors.textMuted,
  },
  cierreNota: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 300,
  },
});
