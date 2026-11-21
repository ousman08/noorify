import PantallaEnConstruccion from '@/components/PantallaEnConstruccion';

export default function Perfil() {
  return (
    <PantallaEnConstruccion
      titulo="Perfil"
      subtitulo="Tus preferencias, más adelante."
      puntos={[
        'Aquí podrás elegir tu nombre y tus preferencias de la app.',
        'Los recordatorios serán opcionales y podrás desactivarlos.',
        'En esta fase no hay cuentas ni contraseñas.',
      ]}
    />
  );
}
