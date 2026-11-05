import { CalendarDays } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { SignUpForm } from './sign-up-form'

export const metadata: Metadata = {
  title: 'Criar conta',
}

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center py-8">
      <div className="mx-auto flex w-full max-w-80 flex-col justify-center space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <CalendarDays size={40} />
          <h1 className="font-bold text-2xl tracking-tight">
            Criar conta no Phobos
          </h1>
        </div>
        <SignUpForm />
        <p className="text-center text-muted-foreground text-sm">
          Já tem conta?{' '}
          <Link href="/auth/sign-in" className="underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
