import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  titulo?: string;
  mensaje?: string;
};

/**
 * Aviso reutilizable para dejar claro que una acción es provisional
 * y que no se está guardando ningún dato.
 */
export default function AvisoProvisional({
  visible,
  onClose,
  titulo = 'Vista provisional',
  mensaje = 'Esta pantalla es una vista provisional y no guarda datos reales.',
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.fondo}>
        <View style={styles.tarjeta}>
          <View style={styles.etiqueta}>
            <Text style={styles.etiquetaTexto}>Provisional</Text>
          </View>

          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.mensaje}>{mensaje}</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Entendido"
            onPress={onClose}
            style={({ pressed }) => [styles.boton, pressed && styles.botonPulsado]}>
            <Text style={styles.botonTexto}>Entendido</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(31, 45, 38, 0.45)',
  },
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  etiqueta: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  etiquetaTexto: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  titulo: {
    marginTop: spacing.sm,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  mensaje: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  boton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.button,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  botonPulsado: {
    backgroundColor: colors.primaryDark,
  },
  botonTexto: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
