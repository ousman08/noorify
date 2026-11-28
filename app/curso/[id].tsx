import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { courseUnits, lessonsById } from '@/content/curso-1';
import { darkColors, radius, spacing } from '@/constants/theme';
import { getCompletedLessonIds, markLessonCompleted } from '@/lib/progress';

export default function LessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = Array.isArray(id) ? id[0] : id;
  const lesson = lessonId ? lessonsById[lessonId] : undefined;
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getCompletedLessonIds().then((ids) => { if (active) setCompletedIds(ids); });
    return () => { active = false; };
  }, []);

  const nextLesson = useMemo(() => {
    if (!lesson) return undefined;
    const ordered = courseUnits.flatMap((unit) => unit.lessons);
    const currentIndex = ordered.findIndex((item) => item.id === lesson.id);
    return ordered.slice(currentIndex + 1).find((item) => {
      const candidate = lessonsById[item.id];
      return candidate && (__DEV__ || candidate.status === 'reviewed');
    });
  }, [lesson]);

  const canRead = Boolean(lesson && (__DEV__ || lesson.status === 'reviewed'));
  const completed = lesson ? completedIds.includes(lesson.id) : false;

  const completeLesson = async () => {
    if (!lesson || saving) return;
    setSaving(true);
    const saved = await markLessonCompleted(lesson.id);
    setSaving(false);
    if (!saved) {
      Alert.alert('No se ha podido guardar', 'Comprueba el almacenamiento del dispositivo e inténtalo de nuevo.');
      return;
    }
    setCompletedIds((current) => current.includes(lesson.id) ? current : [...current, lesson.id]);
    if (nextLesson) {
      Alert.alert('Lección completada', 'Tu progreso se ha guardado en este dispositivo.', [
        { text: 'Volver al curso', onPress: () => router.replace('/curso' as Href) },
        { text: 'Siguiente lección', onPress: () => router.push((`/curso/${nextLesson.id}`) as Href) },
      ]);
    } else {
      Alert.alert('Lección completada', 'Tu progreso se ha guardado en este dispositivo.');
    }
  };

  if (!lesson || !canRead) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.emptyState}>
          <Ionicons name="lock-closed-outline" size={28} color={darkColors.primary} />
          <Text style={styles.title}>Lección próximamente</Text>
          <Text style={styles.body}>Esta lección todavía no está disponible.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.replace('/curso' as Href)} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Volver al curso</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver al curso" onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={darkColors.text} /><Text style={styles.backText}>Curso</Text>
        </Pressable>
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>LOS TRES PRINCIPIOS · {lesson.id.toUpperCase()}</Text>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.idea}>{lesson.idea}</Text>
        </View>
        {lesson.body.map((paragraph, index) => <Text key={index} style={styles.body}>{paragraph}</Text>)}
        {lesson.story ? <View style={styles.card}><Text style={styles.cardLabel}>RELATO</Text><Text style={styles.body}>{lesson.story}</Text></View> : null}
        <View style={styles.phraseCard}>
          <Text style={styles.cardLabel}>PARA RECORDAR</Text><Text style={styles.phrase}>{lesson.keyPhrase}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Comprueba lo aprendido</Text>
          <Text style={styles.body}>{lesson.quiz.question}</Text>
          {lesson.quiz.options.map((option, index) => (
            <Pressable key={index} accessibilityRole="button" accessibilityState={{ selected: selectedOption === index }}
              onPress={() => setSelectedOption(index)} style={[styles.option, selectedOption === index && styles.optionSelected]}>
              <Text style={styles.optionText}>{option.text}</Text>
            </Pressable>
          ))}
          {selectedOption !== null ? <Text style={styles.explanation}>{lesson.quiz.options[selectedOption]?.explanation ?? 'TODO: explicación pendiente de revisión.'}</Text> : null}
          <Text style={styles.helper}>Puedes responder de nuevo. No hay penalizaciones.</Text>
        </View>
        <View style={styles.sources}>
          <Text style={styles.cardLabel}>FUENTES Y REVISIÓN</Text>
          {lesson.sources.map((source, index) => <Text key={index} style={styles.sourceText}>{source.title}: {source.ref}</Text>)}
          {lesson.reviewNotes.map((note, index) => <Text key={index} style={styles.sourceText}>{note}</Text>)}
          <Text style={styles.draftNotice}>Borrador pendiente de revisión humana. No es contenido religioso aprobado.</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: completed || saving }}
          disabled={completed || saving} onPress={completeLesson} style={[styles.primaryButton, (completed || saving) && styles.buttonDisabled]}>
          <Text style={styles.primaryButtonText}>{saving ? 'Guardando…' : completed ? 'Lección completada' : 'Marcar como completada'}</Text>
        </Pressable>
        <Text style={styles.footer}>El progreso se guarda solo en este dispositivo.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: darkColors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'flex-start' },
  backText: { color: darkColors.text, fontSize: 15, fontWeight: '600' },
  intro: { gap: spacing.sm, marginTop: spacing.md },
  eyebrow: { color: darkColors.primary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: darkColors.text, fontSize: 29, lineHeight: 37, fontWeight: '700' },
  idea: { color: darkColors.primary, fontSize: 19, lineHeight: 28, fontWeight: '600' },
  body: { color: darkColors.textMuted, fontSize: 16, lineHeight: 26 },
  card: { padding: spacing.lg, gap: spacing.md, borderRadius: radius.card, borderWidth: 1, borderColor: darkColors.border, backgroundColor: darkColors.surface },
  cardLabel: { color: darkColors.primary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  sectionTitle: { color: darkColors.text, fontSize: 19, fontWeight: '700' },
  phraseCard: { padding: spacing.lg, gap: spacing.sm, borderRadius: radius.card, backgroundColor: darkColors.primarySoft, borderWidth: 1, borderColor: darkColors.borderStrong },
  phrase: { color: darkColors.text, fontSize: 19, lineHeight: 28, fontWeight: '600' },
  option: { borderWidth: 1, borderColor: darkColors.borderStrong, borderRadius: radius.button, padding: spacing.md },
  optionSelected: { borderColor: darkColors.primary, backgroundColor: darkColors.primarySoft },
  optionText: { color: darkColors.text, fontSize: 15, lineHeight: 22 },
  explanation: { color: darkColors.primary, fontSize: 14, lineHeight: 21 },
  helper: { color: darkColors.textMuted, fontSize: 12 },
  sources: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.card, backgroundColor: darkColors.surfaceAlt },
  sourceText: { color: darkColors.textMuted, fontSize: 12, lineHeight: 18 },
  draftNotice: { color: darkColors.error, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  primaryButton: { alignItems: 'center', justifyContent: 'center', minHeight: 54, paddingHorizontal: spacing.lg, borderRadius: radius.button, backgroundColor: darkColors.primary },
  primaryButtonText: { color: darkColors.background, fontSize: 15, fontWeight: '700' },
  buttonDisabled: { opacity: 0.5 },
  footer: { color: darkColors.textMuted, fontSize: 12, textAlign: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
});
