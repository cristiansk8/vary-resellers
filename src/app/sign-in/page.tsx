import { SignInForm } from '@/components/auth/signInForm';
import TestSupabase from '../testSupabase';
import HomePage from '@/components/HomePage';

export default function SignIn() {

  return (
    <div className='flex justify-center items-center h-screen'>
      <SignInForm />
    </div>
  )
}