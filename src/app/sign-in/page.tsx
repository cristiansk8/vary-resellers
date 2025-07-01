import LoginForm from '@/components/auth/loginForm';

export default function SignIn() {
  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='w-full max-w-md'>
        <LoginForm />
      </div>
    </div>
  )
}