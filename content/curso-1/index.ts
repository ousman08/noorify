import type { CourseUnit, Lesson } from '../types';
import l01 from './lecciones/l01';
import l02 from './lecciones/l02';
import l03 from './lecciones/l03';
export const courseUnits: CourseUnit[] = [
  { id: 'introduccion', title: 'Introducción', lessons: [{ id: 'l01', title: 'Por qué aprender primero' }] },
  { id: 'principio-1', title: 'Principio 1 · Conocer a tu Señor', lessons: [
    { id: 'l02', title: 'Quién es Allah' }, { id: 'l03', title: 'Sus signos en la creación' },
    { id: 'l04', title: 'Para qué fuimos creados' }, { id: 'l05', title: 'El Tawhid en simple' },
  ] },
  { id: 'principio-2', title: 'Principio 2 · Conocer tu religión', lessons: [
    { id: 'l06', title: 'La shahada' }, { id: 'l07', title: 'Islam, Iman e Ihsan' },
    { id: 'l08', title: 'Los cinco pilares del Islam' }, { id: 'l09', title: 'Los pilares del Iman' },
    { id: 'l10', title: 'El wudu y la oración' },
  ] },
  { id: 'principio-3', title: 'Principio 3 · Conocer al Profeta ﷺ', lessons: [
    { id: 'l11', title: 'Quién es y su mensaje' }, { id: 'l12', title: 'Su vida en relatos cortos' },
  ] },
];
export const lessonsById: Record<string, Lesson> = { l01, l02, l03 };
