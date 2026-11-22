import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import Inicio from '@/app/(tabs)/index';
import { CLAVE_SESIONES, type SesionDhikr } from '@/lib/dhikrSessions';

jest.mock('expo-router', () => {
  const push = jest.fn();

  return {
    useRouter: () => ({ push }),
    // En los tests no hay navegación real: el efecto de foco se ejecuta al montar.
    useFocusEffect: (callback: () => void | (() => void)) => {
      const { useEffect } = require('react');
      useEffect(callback, [callback]);
    },
    router: { push, back: jest.fn(), replace: jest.fn(), canGoBack: () => true },
  };
});

const sesionGuardada: SesionDhikr = {
  id: 'sesion-1',
  iniciadaEn: '2026-11-22T10:00:00.000Z',
  finalizadaEn: '2026-11-22T10:05:00.000Z',
  duracionActivaSegundos: 300,
  duracionTotalSegundos: 300,
  toques: 12,
};

function pushMock(): jest.Mock {
  const { push } = useRouter();
  return push as unknown as jest.Mock;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  pushMock().mockClear();
});

describe('pantalla de Inicio', () => {
  test('saluda y muestra el aviso de que no hay prisa', async () => {
    await render(<Inicio />);

    expect(screen.getByText('Assalamu Alaikum, Hermano')).toBeTruthy();
    expect(screen.getByText('Empieza cuando quieras, sin presión.')).toBeTruthy();
    await waitFor(() =>
      expect(
        screen.getByText('Aún no hay sesiones guardadas. Cuando termines una, aparecerá aquí.'),
      ).toBeTruthy(),
    );
  });

  test('el botón Empezar abre la sesión de dhikr', async () => {
    await render(<Inicio />);

    await fireEvent.press(screen.getByLabelText('Empezar una sesión de dhikr'));

    expect(pushMock()).toHaveBeenCalledWith('/sesion-dhikr');
  });

  test('Tómate una pausa muestra un mensaje amable sin culpa', async () => {
    await render(<Inicio />);

    await fireEvent.press(screen.getByLabelText('Tómate una pausa'));

    expect(screen.getAllByText('Tómate una pausa')).toHaveLength(2);
    expect(
      screen.getByText('No hay rachas que romper ni nada que perder. Vuelve cuando quieras.'),
    ).toBeTruthy();
  });

  test('muestra la sesión guardada en lugar del estado vacío', async () => {
    await AsyncStorage.setItem(CLAVE_SESIONES, JSON.stringify([sesionGuardada]));

    await render(<Inicio />);

    await waitFor(() => expect(screen.getByText(/1 sesión guardada/)).toBeTruthy());
  });
});
