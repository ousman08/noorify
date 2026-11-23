import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/constants/theme';

type Props = {
  titulo: string;
  subtitulo: string;
  puntos: string[];
};

/**
 * Base común de las pestañas que todavía no tienen funciones reales.
 * No muestra datos inventados ni simula guardar información.
 */
export default function PantallaEnConstruccion({ titulo, subtitulo, puntos }: Props) {
  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Text style={styles.overline}>ASAS</Text>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.subtitulo}>{subtitulo}</Text>

        <View style={styles.marcador}>
          <Ionicons name="leaf-outline" size={30} color={colors.inactive} />
          <Text style={styles.marcadorTexto}>Ilustración pendiente de revisión</Text>
        </View>

        <View style={styles.tarjeta}>
          <View style={styles.aviso}>
            <Ionicons name="construct-outline" size={16} color={colors.example} />
            <Text style={styles.avisoTexto}>Pantalla en construcción</Text>
          </View>

          {puntos.map((punto) => (
            <View key={punto} style={styles.punto}>
              <View style={styles.puntoMarca} />
              <Text style={styles.puntoTexto}>{punto}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.pie}>Nada de lo que ves aquí guarda datos todavía.</Text>
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
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  overline: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.inactive,
  },
  titulo: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  subtitulo: {
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
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.exampleBg,
    borderRadius: radius.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  avisoTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.example,
  },
  punto: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  puntoMarca: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    backgroundColor: colors.primary,
  },
  puntoTexto: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  pie: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
