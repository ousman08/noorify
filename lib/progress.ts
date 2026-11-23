import AsyncStorage from '@react-native-async-storage/async-storage';
// Prefijo histórico: se conserva para no perder el progreso guardado localmente.
const PROGRESS_KEY = 'noorify:progress:v1';
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}
export async function getCompletedLessonIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!isStringArray(parsed)) return [];
    return [...new Set(parsed)];
  } catch { return []; }
}
export async function markLessonCompleted(id: string): Promise<boolean> {
  try {
    const current = await getCompletedLessonIds();
    const next = current.includes(id) ? current : [...current, id];
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
    return true;
  } catch { return false; }
}
