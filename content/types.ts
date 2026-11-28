export type LessonStatus = 'draft' | 'reviewed';
export type Lesson = {
  id: string; title: string; idea: string; body: string[]; story?: string; keyPhrase: string;
  quiz: { question: string; options: { text: string; correct: boolean; explanation: string }[] };
  sources: { title: string; ref: string }[]; reviewNotes: string[];
  arabic?: { text: string; ref: string; verified: boolean }; status: LessonStatus;
};
export type CourseLessonSummary = { id: string; title: string };
export type CourseUnit = { id: string; title: string; lessons: CourseLessonSummary[] };
