import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  CLAVE_PREFERENCIA,
  CLAVE_REFLEXIONES,
  cargarPreferenciaSalah,
  cargarReflexiones,
  claveDeHoy,
  crearReflexionVacia,
  formatearFechaCorta,
  formatearFechaLarga,
  guardarPreferenciaSalah,
  guardarReflexion,
  type ReflexionSalah,
} from '@/lib/salahReflection';

function crearReflexion(parcial: Partial<ReflexionSalah> = {}): ReflexionSalah {
  return {
    ...crearReflexionVacia('2026-11-22'),
    ...parcial,
  };
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('claveDeHoy', () => {
  test('usa el día local con mes y día de dos dígitos', () => {
    expect(claveDeHoy(new Date(2026, 10, 5))).toBe('2026-11-05');
    expect(claveDeHoy(new Date(2027, 0, 1))).toBe('2027-01-01');
  });
});

describe('crearReflexionVacia', () => {
  test('empieza sin anotar y sin sentimiento', () => {
    const reflexion = crearReflexionVacia('2026-11-22');

    expect(reflexion.fecha).toBe('2026-11-22');
    expect(reflexion.sentimiento).toBeUndefined();
    expect(Object.values(reflexion.oraciones)).toEqual([
      'sin_anotar',
      'sin_anotar',
      'sin_anotar',
      'sin_anotar',
      'sin_anotar',
    ]);
  });
});

describe('formato de fechas', () => {
  test('escribe el día largo en español', () => {
    expect(formatearFechaLarga('2026-11-22')).toBe('domingo, 22 de noviembre');
  });

  test('escribe el día corto en español', () => {
    expect(formatearFechaCorta('2026-11-22')).toBe('22 nov');
    expect(formatearFechaCorta('2026-01-03')).toBe('3 ene');
  });

  test('devuelve la clave tal cual si no es una fecha válida', () => {
    expect(formatearFechaLarga('sin-fecha')).toBe('sin-fecha');
    expect(formatearFechaCorta('')).toBe('');
  });
});

describe('almacenamiento de reflexiones', () => {
  test('empieza vacío', async () => {
    await expect(cargarReflexiones()).resolves.toEqual({});
  });

  test('guarda y recupera la reflexión del día', async () => {
    const reflexion = crearReflexion({
      fecha: '2026-11-22',
      oraciones: {
        fajr: 'hecha',
        dhuhr: 'todavia_no',
        asr: 'sin_anotar',
        maghrib: 'sin_anotar',
        isha: 'sin_anotar',
      },
      sentimiento: 'calma',
    });

    await guardarReflexion(reflexion);

    const reflexiones = await cargarReflexiones();
    expect(reflexiones['2026-11-22']).toMatchObject({
      fecha: '2026-11-22',
      sentimiento: 'calma',
      oraciones: { fajr: 'hecha', dhuhr: 'todavia_no' },
    });
  });

  test('actualiza el mismo día sin duplicarlo', async () => {
    await guardarReflexion(crearReflexion({ fecha: '2026-11-22', sentimiento: 'calma' }));
    await guardarReflexion(crearReflexion({ fecha: '2026-11-22', sentimiento: 'gratitud' }));

    const reflexiones = await cargarReflexiones();
    expect(Object.keys(reflexiones)).toEqual(['2026-11-22']);
    expect(reflexiones['2026-11-22'].sentimiento).toBe('gratitud');
  });

  test('ignora contenido corrupto sin romper la app', async () => {
    await AsyncStorage.setItem(CLAVE_REFLEXIONES, 'esto no es json');

    await expect(cargarReflexiones()).resolves.toEqual({});
  });

  test('descarta registros con forma incorrecta', async () => {
    await AsyncStorage.setItem(
      CLAVE_REFLEXIONES,
      JSON.stringify({
        '2026-11-22': crearReflexion({ fecha: '2026-11-22' }),
        '2026-11-21': { fecha: '2026-11-21' },
        '2026-11-20': { ...crearReflexion({ fecha: '2026-11-20' }), oraciones: { fajr: 'hecha' } },
      }),
    );

    const reflexiones = await cargarReflexiones();
    expect(Object.keys(reflexiones)).toEqual(['2026-11-22']);
  });
});

describe('preferencia de Inicio', () => {
  test('viene apagada por defecto', async () => {
    await expect(cargarPreferenciaSalah()).resolves.toBe(false);
  });

  test('guarda el valor activado y lo lee de vuelta', async () => {
    await guardarPreferenciaSalah(true);
    await expect(cargarPreferenciaSalah()).resolves.toBe(true);

    await guardarPreferenciaSalah(false);
    await expect(cargarPreferenciaSalah()).resolves.toBe(false);

    expect(await AsyncStorage.getItem(CLAVE_PREFERENCIA)).toBe('false');
  });
});
