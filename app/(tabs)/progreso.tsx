import PantallaEnConstruccion from '@/components/PantallaEnConstruccion';

export default function Progreso() {
  return (
    <PantallaEnConstruccion
      titulo="Progreso"
      subtitulo="Tu constancia, sin comparaciones."
      puntos={[
        'Verás tus días de constancia, sin rachas que castiguen.',
        'Volver después de una pausa contará como parte del camino.',
        'Los datos se guardarán en tu teléfono, no en un servidor.',
      ]}
    />
  );
}
