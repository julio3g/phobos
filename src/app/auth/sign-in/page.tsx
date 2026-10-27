import { CalendarDays } from 'lucide-react'
import type { Metadata } from 'next'
import { SignInForm } from './sign-in-form'

export const metadata: Metadata = {
  title: 'Entrar',
}

export default async function SignInPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full max-w-80 flex-col justify-center space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <CalendarDays size={40} />
          <h1 className="font-bold text-2xl tracking-tight">
            Entrar no Phobos
          </h1>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}
