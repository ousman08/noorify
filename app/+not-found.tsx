import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Pantalla no encontrada' }} />
      <View style={styles.pantalla}>
        <Text style={styles.overline}>NOORIFY</Text>
        <Text style={styles.titulo}>Esta pantalla no existe</Text>
        <Text style={styles.texto}>
          Puede que el enlace esté mal escrito o que la sección ya no esté disponible.
        </Text>

        <Link href="/" style={styles.enlace}>
          <Text style={styles.enlaceTexto}>Volver al inicio</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  overline: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.inactive,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  texto: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 300,
  },
  enlace: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  enlaceTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
});
