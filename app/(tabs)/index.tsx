import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/constants/theme';
import { cargarSesiones, formatearFecha, type SesionDhikr } from '@/lib/dhikrSessions';
import {
  cargarPreferenciaSalah,
  cargarReflexiones,
  claveDeHoy,
  guardarPreferenciaSalah,
  type ReflexionSalah,
} from '@/lib/salahReflection';

export default function Inicio() {
  const router = useRouter();
  const [salahActiva, setSalahActiva] = useState(false);
  const [reflexionHoy, setReflexionHoy] = useState<ReflexionSalah | null>(null);
  const [sesiones, setSesiones] = useState<SesionDhikr[]>([]);

  useFocusEffect(
    useCallback(() => {
      let montado = true;

      Promise.all([cargarSesiones(), cargarPreferenciaSalah(), cargarReflexiones()])
        .then(([datosSesiones, preferencia, reflexiones]) => {
          if (!montado) return;
          setSesiones(datosSesiones);
          setSalahActiva(preferencia);
          setReflexionHoy(reflexiones[claveDeHoy()] ?? null);
        })
        .catch(() => {
          if (!montado) return;
          setSesiones([]);
          setReflexionHoy(null);
        });

      return () => {
        montado = false;
      };
    }, []),
  );

  const alternarSalah = (valor: boolean) => {
    setSalahActiva(valor);
    void guardarPreferenciaSalah(valor).catch(() => {
      // Si falla el guardado de la preferencia, no interrumpimos al usuario.
    });
  };

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <View style={styles.encabezado}>
          <Text style={styles.overline}>ASAS</Text>
          <Text style={styles.saludo}>Assalamu Alaikum</Text>
          <Text style={styles.subtitulo}>Empieza cuando quieras, sin presión.</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Empezar una sesión de dhikr"
          onPress={() => router.push('/sesion-dhikr' as Href)}
          style={({ pressed }) => [styles.botonPrimario, pressed && styles.botonPrimarioPulsado]}>
          <Ionicons name="leaf-outline" size={20} color={colors.surface} />
          <Text style={styles.botonPrimarioTexto}>Empezar</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir el curso Los Tres Principios"
          onPress={() => router.push('/curso' as Href)}
          style={({ pressed }) => [styles.cursoCard, pressed && styles.pulsado]}>
          <View style={styles.cursoIcono}>
            <Ionicons name="book-outline" size={21} color={colors.primary} />
          </View>
          <View style={styles.textoFlexible}>
            <Text style={styles.tarjetaTitulo}>Aprender · Los Tres Principios</Text>
            <Text style={styles.tarjetaTexto}>Un recorrido de aprendizaje, paso a paso.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.inactive} />
        </Pressable>

        <View style={styles.tarjeta}>
          <View style={styles.filaEntre}>
            <View style={styles.textoFlexible}>
              <Text style={styles.tarjetaTitulo}>Reflexión de Salah</Text>
              <Text style={styles.tarjetaTexto}>
                Un espacio tranquilo para revisar tu salah, sin juicios.
              </Text>
            </View>
            <Switch
              accessibilityLabel="Mostrar la reflexión del día en Inicio"
              value={salahActiva}
              onValueChange={alternarSalah}
              trackColor={{ false: colors.border, true: colors.primarySoft }}
              thumbColor={salahActiva ? colors.primary : colors.surface}
              ios_backgroundColor={colors.border}
            />
          </View>

          <Text style={styles.nota}>
            {salahActiva
              ? 'Mostrando el estado del día en Inicio · guardado en tu teléfono.'
              : 'Mostrar en Inicio · la reflexión sigue disponible aunque esté apagado.'}
          </Text>

          {salahActiva ? (
            <Text style={styles.estadoSalah}>
              {reflexionHoy
                ? 'Reflexión de hoy guardada. Puedes cambiarla cuando quieras.'
                : 'Aún sin reflexión hoy. No hay prisa.'}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir la reflexión de Salah"
            onPress={() => router.push('/reflexion-salah' as Href)}
            style={({ pressed }) => [styles.botonEnlace, pressed && styles.pulsado]}>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            <Text style={styles.botonEnlaceTexto}>
              {reflexionHoy ? 'Revisar mi reflexión' : 'Empezar mi reflexión'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.tarjeta}>
          <View style={styles.filaEntre}>
            <Text style={styles.tarjetaTitulo}>Tu constancia</Text>
            <Ionicons name="leaf-outline" size={18} color={colors.inactive} />
          </View>
          {sesiones.length === 0 ? (
            <Text style={styles.tarjetaTexto}>
              Aún no hay sesiones guardadas. Cuando termines una, aparecerá aquí.
            </Text>
          ) : (
            <Text style={styles.tarjetaTexto}>
              {sesiones.length === 1
                ? '1 sesión guardada'
                : `${sesiones.length} sesiones guardadas`}{' '}
              · última: {formatearFecha(sesiones[0].finalizadaEn)}
            </Text>
          )}
        </View>

        <Text style={styles.pie}>
          Tu recorrido permanece en tu teléfono. Vuelve cuando quieras.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contenido: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  encabezado: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  overline: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.inactive,
  },
  saludo: {
    marginTop: spacing.sm,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    color: colors.text,
  },
  subtitulo: {
    fontSize: 16,
    lineHeight: 23,
    color: colors.textMuted,
  },
  botonPrimario: {
    minHeight: 58,
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonPrimarioPulsado: {
    backgroundColor: colors.primaryDark,
  },
  botonPrimarioTexto: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: '700',
  },
  cursoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cursoIcono: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  filaEntre: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  textoFlexible: {
    flex: 1,
  },
  tarjetaTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  tarjetaTexto: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  nota: {
    fontSize: 13,
    color: colors.inactive,
  },
  estadoSalah: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  botonEnlace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: spacing.md,
  },
  botonEnlaceTexto: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  pulsado: {
    opacity: 0.7,
  },
  pie: {
    marginTop: 'auto',
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
