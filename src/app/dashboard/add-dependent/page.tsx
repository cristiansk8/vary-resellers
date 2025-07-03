import DashboardHeader from '@/components/auth/DashboardHeader';
import AddDependentForm from '@/components/auth/AddDependentForm';

export default function AddDependentPage() {
  return (
    <>
      <DashboardHeader />
      <main className="min-h-screen flex flex-col items-center justify-start p-8 bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100">
        <div className="w-full max-w-2xl">
          <AddDependentForm />
        </div>
      </main>
    </>
  );
}
