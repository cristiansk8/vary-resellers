'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User } from '@supabase/supabase-js'  // Importa el tipo User

export default function TestSupabase() {
  const [user, setUser] = useState<User | null>(null)  // Acepta User o null

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
  }, [])

  return (
    <div>
      <h1>Test Supabase Connection</h1>
      {user ? <pre>{JSON.stringify(user, null, 2)}</pre> : <p>No user logged in.</p>}
    </div>
  )
}
