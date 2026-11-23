import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AvisoProvisional from '@/components/AvisoProvisional';
import { colors, radius, spacing } from '@/constants/theme';
import { cargarSesiones, formatearFecha, type SesionDhikr } from '@/lib/dhikrSessions';
import {
  cargarPreferenciaSalah,
  cargarReflexiones,
  claveDeHoy,
  guardarPreferenciaSalah,
  type ReflexionSalah,
} from '@/lib/salahReflection';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Aviso = {
  titulo: string;
  mensaje: string;
};

/** Nombre de ejemplo. Cámbialo aquí cuando exista el perfil real. */
const NOMBRE_EJEMPLO = 'Hermano';

const HABITOS_EJEMPLO: { icono: IconName; titulo: string; detalle: string }[] = [
  {
    icono: 'sparkles-outline',
    titulo: 'Dhikr',
    detalle: '5 minutos · dato de ejemplo',
  },
  {
    icono: 'book-outline',
    titulo: 'Lectura del Corán',
    detalle: '10 minutos · dato de ejemplo',
  },
  {
    icono: 'leaf-outline',
    titulo: 'Acción consciente',
    detalle: '1 gesto amable · dato de ejemplo',
  },
];

const ESTADOS_DEL_CORAZON: { etiqueta: string; icono: IconName }[] = [
  { etiqueta: 'Bien', icono: 'sunny-outline' },
  { etiqueta: 'Cansado', icono: 'cloudy-outline' },
  { etiqueta: 'Distante', icono: 'moon-outline' },
  { etiqueta: 'Agradecido', icono: 'heart-outline' },
];

export default function Inicio() {
  const router = useRouter();
  const [salahActiva, setSalahActiva] = useState(false);
  const [reflexionHoy, setReflexionHoy] = useState<ReflexionSalah | null>(null);
  const [corazon, setCorazon] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [sesiones, setSesiones] = useState<SesionDhikr[]>([]);

  // Al volver a Inicio se relee el almacenamiento local.
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

  const mostrarAviso = (titulo: string, mensaje: string) => {
    setAviso({ titulo, mensaje });
  };

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}>

        {/* Saludo */}
        <View>
          <Text style={styles.overline}>NOORIFY</Text>
          <Text style={styles.saludo}>Assalamu Alaikum, {NOMBRE_EJEMPLO}</Text>
          <Text style={styles.subtitulo}>Empieza cuando quieras, sin presión.</Text>
        </View>

        {/* Marcador de ilustración */}
        <View style={styles.marcador}>
          <Ionicons name="leaf-outline" size={30} color={colors.inactive} />
          <Text style={styles.marcadorTexto}>Ilustración pendiente de revisión</Text>
        </View>

        {/* Acciones principales */}
        <View style={styles.filaBotones}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Empezar una sesión de dhikr"
            onPress={() => router.push('/sesion-dhikr' as Href)}
            style={({ pressed }) => [styles.botonPrimario, pressed && styles.botonPrimarioPulsado]}>
            <Text style={styles.botonPrimarioTexto}>Empezar</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tómate una pausa"
            onPress={() =>
              mostrarAviso(
                'Tómate una pausa',
                'No hay rachas que romper ni nada que perder. Vuelve cuando quieras.',
              )
            }
            style={({ pressed }) => [styles.botonSecundario, pressed && styles.botonSecundarioPulsado]}>
            <Text style={styles.botonSecundarioTexto}>Tómate una pausa</Text>
          </Pressable>
        </View>

        {/* Curso */}
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

        {/* Reflexión de Salah */}
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

        {/* Momento del día */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir Momento del día"
          onPress={() =>
            mostrarAviso(
              'Momento del día',
              'El contenido se añadirá cuando esté revisado. No inventamos aleyas, hadices ni du‘as.',
            )
          }
          style={({ pressed }) => [styles.tarjeta, styles.tarjetaPulsable, pressed && styles.pulsado]}>
          <View style={styles.filaEntre}>
            <Text style={styles.overline}>MOMENTO DEL DÍA</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.inactive} />
          </View>
          <Text style={styles.tarjetaTitulo}>Contenido pendiente de revisión</Text>
          <Text style={styles.tarjetaTexto}>
            Aquí aparecerá una reflexión breve cuando el material esté verificado.
          </Text>
        </Pressable>

        {/* ¿Cómo está tu corazón? */}
        <View style={styles.tarjeta}>
          <Text style={styles.tarjetaTitulo}>¿Cómo está tu corazón?</Text>
          <Text style={styles.tarjetaTexto}>
            Un check-in rápido. Elige lo que más se acerque, sin obligación.
          </Text>

          <View style={styles.filaChips}>
            {ESTADOS_DEL_CORAZON.map((estado) => {
              const activo = corazon === estado.etiqueta;
              return (
                <Pressable
                  key={estado.etiqueta}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activo }}
                  onPress={() => {
                    setCorazon(estado.etiqueta);
                    mostrarAviso(
                      '¿Cómo está tu corazón?',
                      'El check-in emocional llegará más adelante. Tu elección no se guarda.',
                    );
                  }}
                  style={({ pressed }) => [
                    styles.chip,
                    activo && styles.chipActivo,
                    pressed && styles.pulsado,
                  ]}>
                  <Ionicons
                    name={estado.icono}
                    size={16}
                    color={activo ? colors.primary : colors.textMuted}
                  />
                  <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>
                    {estado.etiqueta}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Hábitos diarios */}
        <View style={styles.seccion}>
          <View style={styles.filaEntre}>
            <Text style={styles.seccionTitulo}>Hábitos diarios</Text>
            <View style={styles.etiquetaEjemplo}>
              <Text style={styles.etiquetaEjemploTexto}>Ejemplo</Text>
            </View>
          </View>

          <View style={styles.tarjetaSinRelleno}>
            {HABITOS_EJEMPLO.map((habito, indice) => (
              <Pressable
                key={habito.titulo}
                accessibilityRole="button"
                accessibilityLabel={`${habito.titulo}, dato de ejemplo`}
                onPress={() =>
                  mostrarAviso(
                    habito.titulo,
                    'El seguimiento de hábitos llegará en la siguiente fase. Nada se guarda todavía.',
                  )
                }
                style={({ pressed }) => [
                  styles.filaHabito,
                  indice > 0 && styles.filaHabitoBorde,
                  pressed && styles.pulsado,
                ]}>
                <View style={styles.iconoHabito}>
                  <Ionicons name={habito.icono} size={18} color={colors.primary} />
                </View>
                <View style={styles.textoFlexible}>
                  <Text style={styles.habitoTitulo}>{habito.titulo}</Text>
                  <Text style={styles.habitoDetalle}>{habito.detalle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.inactive} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Constancia guardada */}
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
          El dhikr y la reflexión de Salah se guardan solo en tu teléfono. El resto de la pantalla
          sigue siendo provisional.
        </Text>
      </ScrollView>

      <AvisoProvisional
        visible={aviso !== null}
        onClose={() => setAviso(null)}
        titulo={aviso?.titulo}
        mensaje={aviso?.mensaje}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contenido: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  overline: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.inactive,
  },
  saludo: {
    marginTop: spacing.sm,
    fontSize: 26,
    lineHeight: 33,
    fontWeight: '700',
    color: colors.text,
  },
  subtitulo: {
    marginTop: spacing.xs,
    fontSize: 16,
    lineHeight: 23,
    color: colors.textMuted,
  },
  marcador: {
    height: 104,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  marcadorTexto: {
    fontSize: 13,
    color: colors.textMuted,
  },
  filaBotones: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  botonPrimario: {
    flex: 1,
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
    fontSize: 16,
    fontWeight: '700',
  },
  botonSecundario: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonSecundarioPulsado: {
    backgroundColor: colors.primarySoft,
  },
  botonSecundarioTexto: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
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
  tarjetaPulsable: {
    gap: spacing.xs,
  },
  tarjetaSinRelleno: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipTextoActivo: {
    color: colors.primary,
  },
  seccion: {
    gap: spacing.md,
  },
  seccionTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  etiquetaEjemplo: {
    backgroundColor: colors.exampleBg,
    borderRadius: radius.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  etiquetaEjemploTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.example,
  },
  filaHabito: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  filaHabitoBorde: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  iconoHabito: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  habitoDetalle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  pie: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
