import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Reflexión de Salah: un registro tranquilo por día.
 * Todo se queda en el teléfono, sin backend y sin cifrar.
 * Por eso solo guardamos estados y fechas, nunca texto libre.
 */

export const CLAVE_REFLEXIONES = 'noorify:salah:reflections:v1';
export const CLAVE_PREFERENCIA = 'noorify:salah:enabled:v1';

const MAXIMO_DIAS = 400;

export type Oracion = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type EstadoOracion = 'hecha' | 'todavia_no' | 'sin_anotar';
export type Sentimiento = 'calma' | 'cansancio' | 'dificultad' | 'gratitud';

export type ReflexionSalah = {
  /** Día local en formato "AAAA-MM-DD". */
  fecha: string;
  oraciones: Record<Oracion, EstadoOracion>;
  sentimiento?: Sentimiento;
  /** Fecha ISO de la última edición. */
  actualizadoEn: string;
};

export type MapaReflexiones = Record<string, ReflexionSalah>;

export const ORACIONES: { clave: Oracion; etiqueta: string }[] = [
  { clave: 'fajr', etiqueta: 'Fajr' },
  { clave: 'dhuhr', etiqueta: 'Dhuhr' },
  { clave: 'asr', etiqueta: 'Asr' },
  { clave: 'maghrib', etiqueta: 'Maghrib' },
  { clave: 'isha', etiqueta: 'Isha' },
];

export const ESTADOS: { clave: EstadoOracion; etiqueta: string }[] = [
  { clave: 'hecha', etiqueta: 'Hecha' },
  { clave: 'todavia_no', etiqueta: 'Todavía no' },
  { clave: 'sin_anotar', etiqueta: 'Sin anotar' },
];

export const ETIQUETAS_SENTIMIENTO: Record<Sentimiento, string> = {
  calma: 'Calma',
  cansancio: 'Cansancio',
  dificultad: 'Dificultad',
  gratitud: 'Gratitud',
};

/** Día local actual como "AAAA-MM-DD" (sin depender de zonas horarias). */
export function claveDeHoy(fecha: Date = new Date()): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export function crearReflexionVacia(fecha: string): ReflexionSalah {
  return {
    fecha,
    oraciones: {
      fajr: 'sin_anotar',
      dhuhr: 'sin_anotar',
      asr: 'sin_anotar',
      maghrib: 'sin_anotar',
      isha: 'sin_anotar',
    },
    actualizadoEn: new Date().toISOString(),
  };
}

function esEstadoOracion(valor: unknown): valor is EstadoOracion {
  return valor === 'hecha' || valor === 'todavia_no' || valor === 'sin_anotar';
}

function esReflexion(valor: unknown): valor is ReflexionSalah {
  if (typeof valor !== 'object' || valor === null) return false;
  const reflexion = valor as Record<string, unknown>;

  if (typeof reflexion.fecha !== 'string') return false;
  if (typeof reflexion.actualizadoEn !== 'string') return false;
  if (typeof reflexion.oraciones !== 'object' || reflexion.oraciones === null) return false;

  const oraciones = reflexion.oraciones as Record<string, unknown>;
  return ORACIONES.every(({ clave }) => esEstadoOracion(oraciones[clave]));
}

export async function cargarReflexiones(): Promise<MapaReflexiones> {
  try {
    const bruto = await AsyncStorage.getItem(CLAVE_REFLEXIONES);
    if (!bruto) return {};

    const datos: unknown = JSON.parse(bruto);
    if (typeof datos !== 'object' || datos === null || Array.isArray(datos)) return {};

    const mapa: MapaReflexiones = {};
    for (const [fecha, valor] of Object.entries(datos as Record<string, unknown>)) {
      if (esReflexion(valor)) mapa[fecha] = valor;
    }
    return mapa;
  } catch {
    return {};
  }
}

export async function guardarReflexion(reflexion: ReflexionSalah): Promise<MapaReflexiones> {
  const mapa = await cargarReflexiones();
  mapa[reflexion.fecha] = reflexion;

  // Conservamos solo los días más recientes para no crecer sin límite.
  const fechas = Object.keys(mapa)
    .sort()
    .reverse()
    .slice(0, MAXIMO_DIAS);

  const recortado: MapaReflexiones = {};
  for (const fecha of fechas) {
    const valor = mapa[fecha];
    if (valor) recortado[fecha] = valor;
  }

  await AsyncStorage.setItem(CLAVE_REFLEXIONES, JSON.stringify(recortado));
  return recortado;
}

/** Preferencia del interruptor: mostrar la reflexión del día en Inicio. */
export async function cargarPreferenciaSalah(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLAVE_PREFERENCIA)) === 'true';
  } catch {
    return false;
  }
}

export async function guardarPreferenciaSalah(activa: boolean): Promise<void> {
  await AsyncStorage.setItem(CLAVE_PREFERENCIA, activa ? 'true' : 'false');
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const MESES_LARGOS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const MESES_CORTOS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

function fechaDesdeClave(clave: string): Date | null {
  const partes = clave.split('-').map(Number);
  const [anio, mes, dia] = partes;
  if (!anio || !mes || !dia) return null;

  const fecha = new Date(anio, mes - 1, dia);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/** "domingo, 22 de noviembre". */
export function formatearFechaLarga(clave: string): string {
  const fecha = fechaDesdeClave(clave);
  if (!fecha) return clave;
  return `${DIAS[fecha.getDay()]}, ${fecha.getDate()} de ${MESES_LARGOS[fecha.getMonth()]}`;
}

/** "22 nov". */
export function formatearFechaCorta(clave: string): string {
  const fecha = fechaDesdeClave(clave);
  if (!fecha) return clave;
  return `${fecha.getDate()} ${MESES_CORTOS[fecha.getMonth()]}`;
}
