import { Building2, ShieldCheck, Users } from 'lucide-react'
import { NavLink } from '@/components/ui/nav-link'

const items = [
  { icon: Building2, label: 'Empresa', href: '/settings' },
  { icon: Users, label: 'Usuários', href: '/settings/users' },
  { icon: ShieldCheck, label: 'Permissões', href: '/settings/permissions' },
]

export function SidebarMenu() {
  return (
    <aside className="h-fit min-w-0 rounded-xl border p-2 text-card-foreground sm:p-4 xl:min-w-48">
      <ul className="grid w-full grid-cols-3 gap-1 xl:grid-cols-1">
        {items.map(({ icon: Icon, label, href }) => (
          <li key={href} className="min-w-0">
            <NavLink
              href={href}
              className="h-auto w-full flex-col justify-center gap-1 px-1 py-1.5 text-xs sm:flex-row sm:gap-1.5 sm:px-2 sm:text-sm xl:justify-start"
            >
              <Icon aria-hidden="true" className="size-4" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  )
}
