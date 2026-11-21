import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  titulo?: string;
  mensaje?: string;
  etiquetaPrincipal?: string;
  onPrincipal?: () => void;
  accionSecundaria?: {
    etiqueta: string;
    onPress: () => void;
  };
  /**
   * Dibuja el aviso como capa dentro de la pantalla en lugar de un Modal nativo.
   * Útil dentro de pantallas que ya se presentan como modal (iOS).
   */
  enLinea?: boolean;
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
  etiquetaPrincipal = 'Entendido',
  onPrincipal,
  accionSecundaria,
  enLinea = false,
}: Props) {
  if (!visible) return null;

  const contenido = (
    <View style={styles.fondo}>
      <View style={styles.tarjeta}>
        <View style={styles.etiqueta}>
          <Text style={styles.etiquetaTexto}>Provisional</Text>
        </View>

        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.mensaje}>{mensaje}</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={etiquetaPrincipal}
          onPress={onPrincipal ?? onClose}
          style={({ pressed }) => [styles.boton, pressed && styles.botonPulsado]}>
          <Text style={styles.botonTexto}>{etiquetaPrincipal}</Text>
        </Pressable>

        {accionSecundaria ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={accionSecundaria.etiqueta}
            onPress={accionSecundaria.onPress}
            style={({ pressed }) => [styles.botonSecundario, pressed && styles.botonSecundarioPulsado]}>
            <Text style={styles.botonSecundarioTexto}>{accionSecundaria.etiqueta}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  if (enLinea) {
    return <View style={[StyleSheet.absoluteFill, styles.capaEnLinea]}>{contenido}</View>;
  }

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      {contenido}
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
  capaEnLinea: {
    zIndex: 100,
    elevation: 100,
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
  botonSecundario: {
    backgroundColor: colors.surface,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  botonSecundarioPulsado: {
    backgroundColor: colors.primarySoft,
  },
  botonSecundarioTexto: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
