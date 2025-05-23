'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'

export default function CreateTestUser() {
  const supabase = createClientComponentClient()
  const [message, setMessage] = useState('')

  const createUser = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'TestPassword123',
    })

    if (error) {
      setMessage(`❌ Error: ${error.message}`)
    } else {
      setMessage(`✅ Usuario creado: ${data.user?.email}`)
    }
  }

  return (
    <div className="p-4">
      <Button onClick={createUser}>Crear usuario de prueba</Button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  )
}
