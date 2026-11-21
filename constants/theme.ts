/**
 * Paleta y medidas de Noorify.
 * Tonos verdes suaves y crema, pensados para una lectura tranquila.
 */
export const colors = {
  background: '#F4F8F5',
  surface: '#FFFFFF',
  surfaceAlt: '#FBF7EF',

  primary: '#3B7A5E',
  primaryDark: '#2E6049',
  primarySoft: '#DCEBE2',

  inactive: '#8FA89B',

  text: '#1F2D26',
  textMuted: '#5F7268',

  border: '#DDE7E0',
  borderStrong: '#C3D6CA',

  example: '#8A6D3B',
  exampleBg: '#FBF3E2',

  error: '#A6534A',
  errorBg: '#F9ECE9',
} as const;

export const radius = {
  card: 16,
  button: 14,
  chip: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;
