import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { siteConfig } from '@/lib/config'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: { template: `%s - ${siteConfig.name}`, absolute: siteConfig.name },
  description: siteConfig.description,
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${poppins.className} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
