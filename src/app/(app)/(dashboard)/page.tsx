import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Home' }

export default function Home() {
  return (
    <div className="container mx-auto w-full space-y-6 px-4 md:px-8">
      <h1>Hello World!</h1>
    </div>
  )
}
