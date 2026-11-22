import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import SesionDhikr from '@/app/sesion-dhikr';
import { CLAVE_SESIONES, cargarSesiones } from '@/lib/dhikrSessions';

jest.mock('expo-router', () => {
  const push = jest.fn();
  const back = jest.fn();

  return {
    router: { push, back, replace: jest.fn(), canGoBack: () => true },
  };
});

const enrutador = router as unknown as { push: jest.Mock; back: jest.Mock; replace: jest.Mock };

async function avanzar(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

beforeEach(async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 10, 22, 10, 0, 0));
  await AsyncStorage.clear();
  enrutador.push.mockClear();
  enrutador.back.mockClear();
  enrutador.replace.mockClear();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('sesión de dhikr', () => {
  test('empieza en calma con el cronómetro a cero', async () => {
    await render(<SesionDhikr />);

    expect(screen.getByText('Sesión de dhikr')).toBeTruthy();
    expect(screen.getByText('En calma')).toBeTruthy();
    expect(screen.getByLabelText('Tiempo transcurrido: 00:00')).toBeTruthy();
  });

  test('el cronómetro avanza y la pausa lo congela', async () => {
    await render(<SesionDhikr />);

    await avanzar(5000);
    expect(screen.getByLabelText('Tiempo transcurrido: 00:05')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Pausar la sesión'));
    expect(screen.getByText('En pausa')).toBeTruthy();
    expect(screen.getByLabelText('Reanudar la sesión')).toBeTruthy();

    await avanzar(10000);
    expect(screen.getByLabelText('Tiempo transcurrido: 00:05')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Reanudar la sesión'));
    await avanzar(3000);
    expect(screen.getByLabelText('Tiempo transcurrido: 00:08')).toBeTruthy();
  });

  test('cuenta los toques sin objetivo ni racha', async () => {
    await render(<SesionDhikr />);

    await fireEvent.press(screen.getByLabelText('Contar un dhikr'));
    await fireEvent.press(screen.getByLabelText('Contar un dhikr'));
    await fireEvent.press(screen.getByLabelText('Contar un dhikr'));

    expect(screen.getByText('3')).toBeTruthy();
  });

  test('finalizar guarda la sesión en el teléfono', async () => {
    await render(<SesionDhikr />);

    await avanzar(65000);
    await fireEvent.press(screen.getByLabelText('Contar un dhikr'));
    await fireEvent.press(screen.getByLabelText('Finalizar la sesión'));

    expect(screen.getByText('Finalizar sesión')).toBeTruthy();
    expect(screen.getByText('Se guardarán 1 min y 1 toques. Podrás verla en Progreso.')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Finalizar y guardar'));

    expect(await screen.findByText('Sesión guardada con calma')).toBeTruthy();

    const sesiones = await cargarSesiones();
    expect(sesiones).toHaveLength(1);
    expect(sesiones[0]).toMatchObject({
      duracionActivaSegundos: 65,
      toques: 1,
    });

    const guardado = await AsyncStorage.getItem(CLAVE_SESIONES);
    expect(JSON.parse(guardado ?? '[]')).toHaveLength(1);
  });

  test('cerrar la sesión avisa y permite salir sin guardar', async () => {
    await render(<SesionDhikr />);

    await fireEvent.press(screen.getByLabelText('Cerrar la sesión'));
    expect(screen.getByText('Salir de la sesión')).toBeTruthy();
    expect(screen.getByText('Si sales ahora, esta sesión no se guardará.')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Salir sin guardar'));

    await waitFor(() => expect(enrutador.back).toHaveBeenCalled());
    await expect(cargarSesiones()).resolves.toEqual([]);
  });
});
