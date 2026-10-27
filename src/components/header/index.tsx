import Link from 'next/link'
import { siteConfig } from '@/lib/config'
import { Button } from '../ui/button'
import { NavLink } from '../ui/nav-link'
import { ThemeSwitcher } from '../ui/theme-switcher'

export async function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/20 backdrop-blur-md">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          className="hidden lg:flex"
          render={
            <Link href="/">
              <div className="p-1">
                <span className="block size-2 rounded-full bg-muted-foreground" />
              </div>
              <span className="sr-only">{siteConfig.name}</span>
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
              ></Button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
        </div>
      </nav>
    </header>
  )
}
