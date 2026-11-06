import { Gem } from 'lucide-react'
import Link from 'next/link'
import { getProfile } from '@/db/queries/users'
import { siteConfig } from '@/lib/config'
import { Button } from '../ui/button'
import { NavLink } from '../ui/nav-link'
import { ThemeSwitcher } from '../ui/theme-switcher'
import { UserMenu } from './user-menu'

export async function Header() {
  const profile = await getProfile()

  return (
    <header className="sticky top-0 z-10 border-b bg-background/20 backdrop-blur-md">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          className="gap-2 px-2"
          render={
            <Link href="/">
              <Gem className="size-5 text-primary" aria-hidden />
              <span className="font-semibold text-base">{siteConfig.name}</span>
            </Link>
          }
        />
        <div className="flex gap-2">
          {siteConfig.navItems.map((item, i) => (
            <div key={String(i)} className="hidden gap-4 lg:flex">
              <Button
                nativeButton={false}
                render={
                  <NavLink href={item.href}>
                    <span>{item.label}</span>
                    <span className="sr-only">{item.label}</span>
                  </NavLink>
                }
                variant="ghost"
                size="sm"
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {profile ? <UserMenu user={profile} /> : null}
        </div>
      </nav>
    </header>
  )
}
