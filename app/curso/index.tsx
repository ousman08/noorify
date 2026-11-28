import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { courseUnits, lessonsById } from '@/content/curso-1';
import { darkColors, radius, spacing } from '@/constants/theme';
import { getCompletedLessonIds } from '@/lib/progress';

export default function CourseScreen() {
  const router = useRouter();
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  useFocusEffect(useCallback(() => {
    let active = true;
    getCompletedLessonIds().then((ids) => { if (active) setCompletedIds(ids); });
    return () => { active = false; };
  }, []));

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={darkColors.text} /><Text style={styles.backText}>Volver</Text>
        </Pressable>
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>APRENDER CON CALMA</Text>
          <Text style={styles.title}>Los Tres Principios</Text>
          <Text style={styles.subtitle}>Un recorrido organizado en pequeñas lecciones. Sin prisas y sin presión.</Text>
        </View>
        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={19} color={darkColors.primary} />
          <Text style={styles.noteText}>Las lecciones disponibles durante el desarrollo son borradores pendientes de revisión.</Text>
        </View>
        {courseUnits.map((unit) => (
          <View key={unit.id} style={styles.unit}>
            <Text style={styles.unitTitle}>{unit.title}</Text>
            <View style={styles.lessonList}>
              {unit.lessons.map((item, index) => {
                const lesson = lessonsById[item.id];
                const available = Boolean(lesson && (__DEV__ || lesson.status === 'reviewed'));
                const completed = completedIds.includes(item.id);
                return (
                  <Pressable key={item.id} accessibilityRole="button"
                    accessibilityLabel={available ? `Abrir lección ${item.title}` : `${item.title}, próximamente`}
                    accessibilityState={{ disabled: !available }} disabled={!available}
                    onPress={() => router.push((`/curso/${item.id}`) as Href)}
                    style={({ pressed }) => [styles.lessonRow, index > 0 && styles.lessonDivider, !available && styles.lessonUnavailable, pressed && available && styles.pressed]}>
                    <View style={[styles.lessonIcon, completed && styles.lessonIconCompleted]}>
                      <Ionicons name={completed ? 'checkmark' : available ? 'book-outline' : 'lock-closed-outline'}
                        size={18} color={completed ? darkColors.background : available ? darkColors.primary : darkColors.inactive} />
                    </View>
                    <View style={styles.lessonCopy}>
                      <Text style={[styles.lessonTitle, !available && styles.unavailableText]}>{item.title}</Text>
                      <Text style={styles.lessonMeta}>{completed ? 'Completada' : available ? 'Lección disponible' : 'Próximamente'}</Text>
                    </View>
                    {available ? <Ionicons name="chevron-forward" size={18} color={darkColors.textMuted} /> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
        <Text style={styles.footer}>Tu progreso se guarda únicamente en este dispositivo.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: darkColors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.xl },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'flex-start' },
  backText: { color: darkColors.text, fontSize: 15, fontWeight: '600' },
  intro: { gap: spacing.sm },
  eyebrow: { color: darkColors.primary, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  title: { color: darkColors.text, fontSize: 30, lineHeight: 38, fontWeight: '700' },
  subtitle: { color: darkColors.textMuted, fontSize: 16, lineHeight: 24 },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: radius.card, backgroundColor: darkColors.surfaceAlt },
  noteText: { flex: 1, color: darkColors.textMuted, fontSize: 13, lineHeight: 19 },
  unit: { gap: spacing.md },
  unitTitle: { color: darkColors.text, fontSize: 18, fontWeight: '700' },
  lessonList: { overflow: 'hidden', borderRadius: radius.card, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface },
  lessonRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  lessonDivider: { borderTopWidth: 1, borderTopColor: darkColors.border },
  lessonUnavailable: { opacity: 0.48 },
  pressed: { opacity: 0.72 },
  lessonIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: darkColors.primarySoft },
  lessonIconCompleted: { backgroundColor: darkColors.primary },
  lessonCopy: { flex: 1, gap: 3 },
  lessonTitle: { color: darkColors.text, fontSize: 15, fontWeight: '600' },
  unavailableText: { color: darkColors.textMuted },
  lessonMeta: { color: darkColors.textMuted, fontSize: 12 },
  footer: { color: darkColors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
