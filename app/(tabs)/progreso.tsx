import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/constants/theme';
import {
  cargarSesiones,
  formatearDuracion,
  formatearFecha,
  type SesionDhikr,
} from '@/lib/dhikrSessions';
import {
  ETIQUETAS_SENTIMIENTO,
  cargarReflexiones,
  formatearFechaCorta,
  type ReflexionSalah,
} from '@/lib/salahReflection';

export default function Progreso() {
  const [sesiones, setSesiones] = useState<SesionDhikr[]>([]);
  const [reflexiones, setReflexiones] = useState<ReflexionSalah[]>([]);
  const [cargando, setCargando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let montado = true;

      Promise.all([cargarSesiones(), cargarReflexiones()])
        .then(([datosSesiones, mapaReflexiones]) => {
          if (!montado) return;
          setSesiones(datosSesiones);
          setReflexiones(
            Object.values(mapaReflexiones).sort((a, b) => b.fecha.localeCompare(a.fecha)),
          );
          setCargando(false);
        })
        .catch(() => {
          if (!montado) return;
          setSesiones([]);
          setReflexiones([]);
          setCargando(false);
        });

      return () => {
        montado = false;
      };
    }, []),
  );

  const totalSegundos = sesiones.reduce((suma, sesion) => suma + sesion.duracionActivaSegundos, 0);
  const ultimas = sesiones.slice(0, 5);
  const ultimasReflexiones = reflexiones.slice(0, 3);

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Text style={styles.overline}>NOORIFY</Text>
        <Text style={styles.titulo}>Progreso</Text>
        <Text style={styles.subtitulo}>Tu constancia, sin comparaciones.</Text>

        <View style={styles.resumen}>
          <View style={styles.resumenDato}>
            <Text style={styles.resumenNumero}>{sesiones.length}</Text>
            <Text style={styles.resumenEtiqueta}>
              {sesiones.length === 1 ? 'sesión guardada' : 'sesiones guardadas'}
            </Text>
          </View>

          <View style={styles.resumenSeparador} />

          <View style={styles.resumenDato}>
            <Text style={styles.resumenNumero}>
              {totalSegundos > 0 ? formatearDuracion(totalSegundos) : '—'}
            </Text>
            <Text style={styles.resumenEtiqueta}>tiempo en calma</Text>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Últimas sesiones</Text>

          {cargando ? (
            <View style={styles.tarjeta}>
              <Text style={styles.tarjetaTexto}>Cargando…</Text>
            </View>
          ) : ultimas.length === 0 ? (
            <View style={styles.tarjeta}>
              <Text style={styles.tarjetaTexto}>
                Todavía no hay sesiones guardadas. Cuando termines una en Inicio, aparecerá aquí.
              </Text>
            </View>
          ) : (
            <View style={styles.lista}>
              {ultimas.map((sesion, indice) => (
                <View
                  key={sesion.id}
                  style={[styles.filaSesion, indice > 0 && styles.filaSesionBorde]}>
                  <View style={styles.iconoSesion}>
                    <Ionicons name="leaf-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.sesionTexto}>
                    <Text style={styles.sesionFecha}>{formatearFecha(sesion.finalizadaEn)}</Text>
                    <Text style={styles.sesionDetalle}>
                      {formatearDuracion(sesion.duracionActivaSegundos)}
                      {sesion.toques > 0 ? ` · ${sesion.toques} toques` : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Reflexión de Salah</Text>

          {reflexiones.length === 0 ? (
            <View style={styles.tarjeta}>
              <Text style={styles.tarjetaTexto}>
                Todavía no hay reflexiones guardadas. Puedes anotar tu día desde Inicio, sin prisa.
              </Text>
            </View>
          ) : (
            <View style={styles.lista}>
              {ultimasReflexiones.map((reflexion, indice) => (
                <View
                  key={reflexion.fecha}
                  style={[styles.filaSesion, indice > 0 && styles.filaSesionBorde]}>
                  <View style={styles.iconoSesion}>
                    <Ionicons name="moon-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.sesionTexto}>
                    <Text style={styles.sesionFecha}>{formatearFechaCorta(reflexion.fecha)}</Text>
                    <Text style={styles.sesionDetalle}>
                      {reflexion.sentimiento
                        ? ETIQUETAS_SENTIMIENTO[reflexion.sentimiento]
                        : 'Sin sentimiento anotado'}
                    </Text>
                  </View>
                </View>
              ))}
              <View style={[styles.filaSesion, styles.filaSesionBorde]}>
                <Text style={styles.sesionDetalle}>
                  {reflexiones.length === 1
                    ? '1 día anotado en total'
                    : `${reflexiones.length} días anotados en total`}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.tarjeta}>
          <View style={styles.aviso}>
            <Ionicons name="construct-outline" size={16} color={colors.example} />
            <Text style={styles.avisoTexto}>Pantalla en construcción</Text>
          </View>
          <Text style={styles.tarjetaTexto}>
            Más adelante verás aquí tus días de constancia y la lectura del Corán. Sin rachas que
            castiguen ni comparaciones.
          </Text>
        </View>

        <Text style={styles.pie}>
          Estos datos se guardan solo en tu teléfono. Si desinstalas la app, se borran.
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
  resumen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  resumenDato: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  resumenNumero: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  resumenEtiqueta: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  resumenSeparador: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
  },
  seccion: {
    gap: spacing.md,
  },
  seccionTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  lista: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  filaSesion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  filaSesionBorde: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  iconoSesion: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sesionTexto: {
    flex: 1,
  },
  sesionFecha: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  sesionDetalle: {
    fontSize: 13,
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
  tarjetaTexto: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
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
  pie: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
