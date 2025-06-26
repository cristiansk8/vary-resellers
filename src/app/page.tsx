// En: src/app/page.tsx  (¡El archivo principal en la raíz de /app!)

import HomePageComponent from '@/components/HomePage';

export default function PublicHomePage() {
  // Esta es tu página pública de bienvenida.
  // No necesita lógica de sesión aquí.
  return (
    <HomePageComponent />
  );
}