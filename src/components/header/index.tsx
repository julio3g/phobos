import { Gem } from 'lucide-react'
import Link from 'next/link'
import { getProfile } from '@/db/queries/users'
import { siteConfig } from '@/lib/config'
import { Button } from '../ui/button'
import { NavLink } from '../ui/nav-link'
import { ThemeSwitcher } from '../ui/theme-switcher'
import { MobileNav } from './mobile-nav'
import { UserMenu } from './user-menu'

export async function Header() {
  const profile = await getProfile()

  return (
    <header className="sticky top-0 z-10 border-b bg-background/20 backdrop-blur-md">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <MobileNav items={siteConfig.navItems} title={siteConfig.name} />
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          className="gap-2 px-2"
          render={
            <Link href="/">
              <span className="flex size-7 items-center justify-center rounded-lg bg-linear-to-br from-primary to-chart-5 text-primary-foreground shadow-sm">
                <Gem className="size-4" aria-hidden />
              </span>
              <span className="bg-linear-to-r from-primary to-chart-5 bg-clip-text font-semibold text-base text-transparent">
                {siteConfig.name}
              </span>
            </Link>
          }
        />
        <div className="hidden gap-2 lg:flex">
          {siteConfig.navItems.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
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
