import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Guardado local de las sesiones de dhikr.
 * Todo se queda en el teléfono: no hay backend ni sincronización.
 */

export const CLAVE_SESIONES = 'noorify:dhikr:sessions:v1';

const MAXIMO_SESIONES = 200;

export type SesionDhikr = {
  id: string;
  /** Fecha ISO de inicio. */
  iniciadaEn: string;
  /** Fecha ISO de fin. */
  finalizadaEn: string;
  /** Segundos con el temporizador en marcha (sin las pausas). */
  duracionActivaSegundos: number;
  /** Segundos desde el inicio hasta el final, pausas incluidas. */
  duracionTotalSegundos: number;
  /** Toques manuales del contador. */
  toques: number;
};

function esSesion(valor: unknown): valor is SesionDhikr {
  if (typeof valor !== 'object' || valor === null) return false;
  const sesion = valor as Record<string, unknown>;
  return (
    typeof sesion.id === 'string' &&
    typeof sesion.iniciadaEn === 'string' &&
    typeof sesion.finalizadaEn === 'string' &&
    typeof sesion.duracionActivaSegundos === 'number' &&
    typeof sesion.duracionTotalSegundos === 'number' &&
    typeof sesion.toques === 'number'
  );
}

/** Devuelve las sesiones guardadas, de la más reciente a la más antigua. */
export async function cargarSesiones(): Promise<SesionDhikr[]> {
  try {
    const bruto = await AsyncStorage.getItem(CLAVE_SESIONES);
    if (!bruto) return [];

    const datos: unknown = JSON.parse(bruto);
    if (!Array.isArray(datos)) return [];

    return datos
      .filter(esSesion)
      .sort((a, b) => b.finalizadaEn.localeCompare(a.finalizadaEn));
  } catch {
    // Si el contenido está corrupto, empezamos de cero sin romper la app.
    return [];
  }
}

/** Añade una sesión al principio de la lista y devuelve la lista actualizada. */
export async function guardarSesion(sesion: SesionDhikr): Promise<SesionDhikr[]> {
  const actuales = await cargarSesiones();
  const siguientes = [sesion, ...actuales].slice(0, MAXIMO_SESIONES);
  await AsyncStorage.setItem(CLAVE_SESIONES, JSON.stringify(siguientes));
  return siguientes;
}

/** Cronómetro en formato mm:ss (o h:mm:ss si pasa de una hora). */
export function formatearCronometro(segundosTotales: number): string {
  const segundos = Math.max(0, Math.floor(segundosTotales));
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const resto = segundos % 60;

  const dosDigitos = (valor: number) => String(valor).padStart(2, '0');

  if (horas > 0) {
    return `${horas}:${dosDigitos(minutos)}:${dosDigitos(resto)}`;
  }
  return `${dosDigitos(minutos)}:${dosDigitos(resto)}`;
}

/** Duración legible: "45 s", "12 min" o "1 h 05 min". */
export function formatearDuracion(segundosTotales: number): string {
  const segundos = Math.max(0, Math.round(segundosTotales));
  if (segundos < 60) return `${segundos} s`;

  const minutos = Math.round(segundos / 60);
  if (minutos < 60) return `${minutos} min`;

  const horas = Math.floor(minutos / 60);
  const restoMinutos = minutos % 60;
  return `${horas} h ${String(restoMinutos).padStart(2, '0')} min`;
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function mismoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Fecha breve en español: "hoy, 18:32", "ayer, 09:10", "12 nov, 07:45". */
export function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return 'fecha desconocida';

  const dosDigitos = (valor: number) => String(valor).padStart(2, '0');
  const hora = `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;

  const ahora = new Date();
  if (mismoDia(fecha, ahora)) return `hoy, ${hora}`;

  const ayer = new Date(ahora);
  ayer.setDate(ahora.getDate() - 1);
  if (mismoDia(fecha, ayer)) return `ayer, ${hora}`;

  return `${fecha.getDate()} ${MESES[fecha.getMonth()]}, ${hora}`;
}


/** Borrador temporal de una sesión todavía no finalizada. */
export const CLAVE_BORRADOR = 'noorify:dhikr:draft:v1';
const ANTIGUEDAD_MAXIMA_BORRADOR_MS = 24 * 60 * 60 * 1000;

export type BorradorDhikr = {
  version: 1;
  startedAtMs: number;
  activeMs: number;
  activeSinceMs: number | null;
  toques: number;
  updatedAtMs: number;
};

function esNumeroFinito(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor);
}

function esBorrador(valor: unknown, ahora: number): valor is BorradorDhikr {
  if (typeof valor !== 'object' || valor === null) return false;
  const borrador = valor as Record<string, unknown>;
  if (
    borrador.version !== 1 ||
    !esNumeroFinito(borrador.startedAtMs) ||
    !esNumeroFinito(borrador.activeMs) ||
    !esNumeroFinito(borrador.updatedAtMs) ||
    !Number.isInteger(borrador.toques) ||
    (borrador.toques as number) < 0 ||
    (borrador.toques as number) > 1_000_000
  ) return false;

  const inicio = borrador.startedAtMs;
  const actualizado = borrador.updatedAtMs;
  const activo = borrador.activeMs;
  if (
    inicio > ahora + 60_000 ||
    actualizado > ahora + 60_000 ||
    actualizado < inicio ||
    ahora - actualizado > ANTIGUEDAD_MAXIMA_BORRADOR_MS ||
    activo < 0 ||
    activo > ahora - inicio + 60_000
  ) return false;

  return borrador.activeSinceMs === null ||
    (esNumeroFinito(borrador.activeSinceMs) &&
      borrador.activeSinceMs >= inicio &&
      borrador.activeSinceMs <= ahora + 60_000);
}

export async function cargarBorrador(): Promise<BorradorDhikr | null> {
  try {
    const bruto = await AsyncStorage.getItem(CLAVE_BORRADOR);
    if (!bruto) return null;
    const datos: unknown = JSON.parse(bruto);
    if (esBorrador(datos, Date.now())) return datos;
    await AsyncStorage.removeItem(CLAVE_BORRADOR);
    return null;
  } catch {
    return null;
  }
}

export async function guardarBorrador(borrador: BorradorDhikr): Promise<void> {
  await AsyncStorage.setItem(CLAVE_BORRADOR, JSON.stringify(borrador));
}

export async function borrarBorrador(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(CLAVE_BORRADOR);
    return true;
  } catch {
    return false;
  }
}
