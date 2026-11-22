import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/constants/theme';
import {
  ESTADOS,
  ETIQUETAS_SENTIMIENTO,
  ORACIONES,
  cargarReflexiones,
  claveDeHoy,
  crearReflexionVacia,
  formatearFechaLarga,
  guardarReflexion,
  type EstadoOracion,
  type Oracion,
  type ReflexionSalah,
  type Sentimiento,
} from '@/lib/salahReflection';

type IconName = ComponentProps<typeof Ionicons>['name'];

const ICONOS_SENTIMIENTO: Record<Sentimiento, IconName> = {
  calma: 'leaf-outline',
  cansancio: 'moon-outline',
  dificultad: 'cloudy-outline',
  gratitud: 'heart-outline',
};

const SENTIMIENTOS: Sentimiento[] = ['calma', 'cansancio', 'dificultad', 'gratitud'];

type ChipProps = {
  etiqueta: string;
  activo: boolean;
  onPress: () => void;
  icono?: IconName;
};

function Chip({ etiqueta, activo, onPress, icono }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, activo && styles.chipActivo, pressed && styles.pulsado]}>
      {icono ? (
        <Ionicons name={icono} size={14} color={activo ? colors.primary : colors.textMuted} />
      ) : null}
      <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{etiqueta}</Text>
    </Pressable>
  );
}

export default function ReflexionSalahPantalla() {
  const [reflexion, setReflexion] = useState<ReflexionSalah>(() =>
    crearReflexionVacia(claveDeHoy()),
  );
  const [cargando, setCargando] = useState(true);
  const [estadoGuardado, setEstadoGuardado] = useState<
    'inactivo' | 'guardando' | 'guardado' | 'error'
  >('inactivo');

  // Cola sencilla: si tocas varios chips seguidos, se guardan en orden.
  const pendiente = useRef<ReflexionSalah | null>(null);
  const ocupado = useRef(false);

  useEffect(() => {
    let montado = true;

    cargarReflexiones()
      .then((mapa) => {
        if (!montado) return;
        const hoy = claveDeHoy();
        setReflexion(mapa[hoy] ?? crearReflexionVacia(hoy));
        setCargando(false);
      })
      .catch(() => {
        if (montado) setCargando(false);
      });

    return () => {
      montado = false;
    };
  }, []);

  const guardarEnCola = async (siguiente: ReflexionSalah) => {
    pendiente.current = siguiente;
    if (ocupado.current) return;

    ocupado.current = true;
    setEstadoGuardado('guardando');

    try {
      while (pendiente.current !== null) {
        const aGuardar = pendiente.current;
        pendiente.current = null;
        await guardarReflexion(aGuardar);
      }
      setEstadoGuardado('guardado');
    } catch {
      setEstadoGuardado('error');
    } finally {
      ocupado.current = false;
    }
  };

  const aplicar = (cambios: Partial<Pick<ReflexionSalah, 'oraciones' | 'sentimiento'>>) => {
    const siguiente: ReflexionSalah = {
      ...reflexion,
      ...cambios,
      actualizadoEn: new Date().toISOString(),
    };
    setReflexion(siguiente);
    void guardarEnCola(siguiente);
  };

  const cambiarOracion = (oracion: Oracion, estado: EstadoOracion) => {
    aplicar({ oraciones: { ...reflexion.oraciones, [oracion]: estado } });
  };

  const cambiarSentimiento = (sentimiento: Sentimiento) => {
    const nuevo = reflexion.sentimiento === sentimiento ? undefined : sentimiento;
    aplicar({ sentimiento: nuevo });
  };

  const cerrar = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
      <View style={styles.cabecera}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar la reflexión"
          onPress={cerrar}
          hitSlop={12}
          style={({ pressed }) => [styles.botonCerrar, pressed && styles.pulsado]}>
          <Ionicons name="close" size={22} color={colors.textMuted} />
        </Pressable>
        <Text style={styles.cabeceraTitulo}>Reflexión de Salah</Text>
        <View style={styles.cabeceraHueco} />
      </View>

      {cargando ? (
        <View style={styles.cargando}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.cargandoTexto}>Cargando tu reflexión…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.contenido}
          showsVerticalScrollIndicator={false}>
          <View>
            <Text style={styles.fecha}>{formatearFechaLarga(reflexion.fecha)}</Text>
            <Text style={styles.subtitulo}>Sin prisa. Puedes dejarlo y volver cuando quieras.</Text>
          </View>

          <View style={styles.tarjeta}>
            <Text style={styles.tarjetaTitulo}>Tus oraciones de hoy</Text>
            <Text style={styles.tarjetaTexto}>
              Anota solo lo que quieras. “Sin anotar” no es un fallo: es simplemente no anotarlo.
            </Text>

            {ORACIONES.map((oracion, indice) => (
              <View
                key={oracion.clave}
                style={[styles.filaOracion, indice > 0 && styles.filaOracionBorde]}>
                <Text style={styles.oracionNombre}>{oracion.etiqueta}</Text>
                <View style={styles.filaChips}>
                  {ESTADOS.map((estado) => (
                    <Chip
                      key={estado.clave}
                      etiqueta={estado.etiqueta}
                      activo={reflexion.oraciones[oracion.clave] === estado.clave}
                      onPress={() => cambiarOracion(oracion.clave, estado.clave)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>

          <View style={styles.tarjeta}>
            <Text style={styles.tarjetaTitulo}>¿Cómo te sentiste?</Text>
            <Text style={styles.tarjetaTexto}>Opcional. Puedes volver a tocarlo para quitarlo.</Text>

            <View style={styles.filaChips}>
              {SENTIMIENTOS.map((sentimiento) => (
                <Chip
                  key={sentimiento}
                  etiqueta={ETIQUETAS_SENTIMIENTO[sentimiento]}
                  icono={ICONOS_SENTIMIENTO[sentimiento]}
                  activo={reflexion.sentimiento === sentimiento}
                  onPress={() => cambiarSentimiento(sentimiento)}
                />
              ))}
            </View>
          </View>

          <View style={styles.marcadorContenido}>
            <Ionicons name="leaf-outline" size={22} color={colors.inactive} />
            <Text style={styles.marcadorTexto}>Contenido pendiente de revisión</Text>
          </View>

          <View style={styles.estadoGuardado}>
            <Ionicons
              name={
                estadoGuardado === 'error'
                  ? 'alert-circle-outline'
                  : estadoGuardado === 'guardado'
                    ? 'checkmark-circle-outline'
                    : 'cloud-upload-outline'
              }
              size={16}
              color={estadoGuardado === 'error' ? colors.error : colors.inactive}
            />
            <Text
              style={[styles.estadoTexto, estadoGuardado === 'error' && styles.estadoTextoError]}>
              {estadoGuardado === 'guardando'
                ? 'Guardando…'
                : estadoGuardado === 'guardado'
                  ? 'Guardado en tu teléfono'
                  : estadoGuardado === 'error'
                    ? 'No se pudo guardar. Inténtalo otra vez.'
                    : 'Se guarda automáticamente en tu teléfono.'}
            </Text>
          </View>

          <Text style={styles.pie}>
            Solo se guardan los estados y la fecha, en tu teléfono. Nada se envía a ningún sitio.
          </Text>
        </ScrollView>
      )}
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
  cargando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  cargandoTexto: {
    fontSize: 14,
    color: colors.textMuted,
  },
  contenido: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  fecha: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'capitalize',
  },
  subtitulo: {
    marginTop: spacing.xs,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  tarjetaTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  tarjetaTexto: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  filaOracion: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filaOracionBorde: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  oracionNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  filaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActivo: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  chipTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipTextoActivo: {
    color: colors.primary,
  },
  pulsado: {
    opacity: 0.7,
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
  estadoGuardado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  estadoTexto: {
    fontSize: 13,
    color: colors.textMuted,
  },
  estadoTextoError: {
    color: colors.error,
  },
  pie: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
