import PantallaEnConstruccion from '@/components/PantallaEnConstruccion';

export default function Comunidad() {
  return (
    <PantallaEnConstruccion
      titulo="Comunidad"
      subtitulo="Círculos de constancia: acompañamiento sin competición."
      puntos={[
        'Círculos privados y silenciosos, sin rankings ni tablas de posiciones.',
        'Nadie verá tu progreso salvo que tú decidas compartirlo.',
        'Solo cuando tú quieras unirte, y podrás salir cuando quieras.',
      ]}
    />
  );
}
