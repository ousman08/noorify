import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  CLAVE_SESIONES,
  cargarSesiones,
  formatearCronometro,
  formatearDuracion,
  formatearFecha,
  guardarSesion,
  type SesionDhikr,
} from '@/lib/dhikrSessions';

function crearSesion(parcial: Partial<SesionDhikr> = {}): SesionDhikr {
  return {
    id: `sesion-${Math.random().toString(36).slice(2, 8)}`,
    iniciadaEn: '2026-11-22T10:00:00.000Z',
    finalizadaEn: '2026-11-22T10:05:00.000Z',
    duracionActivaSegundos: 300,
    duracionTotalSegundos: 300,
    toques: 12,
    ...parcial,
  };
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('formatearCronometro', () => {
  test('muestra minutos y segundos con dos dígitos', () => {
    expect(formatearCronometro(0)).toBe('00:00');
    expect(formatearCronometro(5)).toBe('00:05');
    expect(formatearCronometro(65)).toBe('01:05');
  });

  test('añade las horas cuando hace falta', () => {
    expect(formatearCronometro(3600)).toBe('1:00:00');
    expect(formatearCronometro(3661)).toBe('1:01:01');
  });
});

describe('formatearDuracion', () => {
  test('usa segundos, minutos y horas', () => {
    expect(formatearDuracion(0)).toBe('0 s');
    expect(formatearDuracion(45)).toBe('45 s');
    expect(formatearDuracion(60)).toBe('1 min');
    expect(formatearDuracion(3600)).toBe('1 h 00 min');
    expect(formatearDuracion(3900)).toBe('1 h 05 min');
  });
});

describe('formatearFecha', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 10, 22, 12, 0, 0));
  });

  test('reconoce hoy y ayer', () => {
    expect(formatearFecha(new Date(2026, 10, 22, 10, 30).toISOString())).toBe('hoy, 10:30');
    expect(formatearFecha(new Date(2026, 10, 21, 9, 5).toISOString())).toBe('ayer, 09:05');
  });

  test('usa una fecha corta para días anteriores', () => {
    expect(formatearFecha(new Date(2026, 10, 12, 7, 45).toISOString())).toBe('12 nov, 07:45');
  });

  test('no rompe con una fecha inválida', () => {
    expect(formatearFecha('no-es-una-fecha')).toBe('fecha desconocida');
  });
});

describe('almacenamiento de sesiones', () => {
  test('empieza vacío', async () => {
    await expect(cargarSesiones()).resolves.toEqual([]);
  });

  test('guarda y devuelve las sesiones de la más reciente a la más antigua', async () => {
    await guardarSesion(crearSesion({ finalizadaEn: '2026-11-20T08:00:00.000Z' }));
    await guardarSesion(crearSesion({ finalizadaEn: '2026-11-22T08:00:00.000Z' }));
    await guardarSesion(crearSesion({ finalizadaEn: '2026-11-21T08:00:00.000Z' }));

    const sesiones = await cargarSesiones();

    expect(sesiones).toHaveLength(3);
    expect(sesiones.map((sesion) => sesion.finalizadaEn)).toEqual([
      '2026-11-22T08:00:00.000Z',
      '2026-11-21T08:00:00.000Z',
      '2026-11-20T08:00:00.000Z',
    ]);
  });

  test('ignora contenido corrupto sin romper la app', async () => {
    await AsyncStorage.setItem(CLAVE_SESIONES, 'esto no es json');

    await expect(cargarSesiones()).resolves.toEqual([]);
  });

  test('descarta registros con forma incorrecta', async () => {
    await AsyncStorage.setItem(
      CLAVE_SESIONES,
      JSON.stringify([
        crearSesion({ id: 'valida' }),
        { id: 'sin-fechas' },
        { ...crearSesion(), toques: 'muchos' },
      ]),
    );

    const sesiones = await cargarSesiones();

    expect(sesiones).toHaveLength(1);
    expect(sesiones[0].id).toBe('valida');
  });

  test('conserva como máximo 200 sesiones', async () => {
    for (let indice = 0; indice < 205; indice += 1) {
      await guardarSesion(
        crearSesion({
          id: `sesion-${indice}`,
          finalizadaEn: new Date(2026, 0, 1, 0, indice).toISOString(),
        }),
      );
    }

    const sesiones = await cargarSesiones();

    expect(sesiones).toHaveLength(200);
    expect(sesiones[0].id).toBe('sesion-204');
  });
});
