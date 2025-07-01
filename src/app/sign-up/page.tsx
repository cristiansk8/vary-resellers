import RegisterForm from '@/components/auth/registerForm';

export default function SignUp() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-xl">
        <RegisterForm />
      </div>
    </div>
  );
}
