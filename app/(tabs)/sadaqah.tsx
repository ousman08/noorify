import PantallaEnConstruccion from '@/components/PantallaEnConstruccion';

export default function Sadaqah() {
  return (
    <PantallaEnConstruccion
      titulo="Sadaqah"
      subtitulo="Registro manual, sin procesar pagos."
      puntos={[
        'Anotarás lo que des, cuando quieras y en privado.',
        'La app no procesa pagos ni conecta cuentas bancarias.',
        'Nadie más verá tu registro.',
      ]}
    />
  );
}
