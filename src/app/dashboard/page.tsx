// En: src/app/dashboard/page.tsx

import LogoutButton from '@/components/auth/logoutButton';

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-2xl font-bold">Bienvenido a tu Dashboard</h1>
      <p>Este contenido solo es visible si has iniciado sesión.</p>
      <LogoutButton />
    </main>
  );
}