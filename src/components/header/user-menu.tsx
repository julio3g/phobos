'use client'

import { LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/db/actions/auth'
import type { Role } from '@/lib/permissions'
import { getMemberIcon } from '@/utils/get-label-and-icons'

interface UserMenuProps {
  user: {
    name: string
    email: string
    imageUrl: string | null
    role: Role
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const isAdmin = user.role === 'admin' || user.role === 'owner'

  function onSignOut() {
    startTransition(async () => {
      const { error } = await signOut()
      if (!error) router.push('/auth/sign-in')
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Abrir menu da conta"
            className="cursor-pointer rounded-full outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        }
      >
        <Avatar>
          {user.imageUrl ? (
            <AvatarImage src={user.imageUrl} alt={user.name} />
          ) : null}
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <span className="block truncate font-medium text-foreground">
              {user.name}
            </span>
            <span className="block truncate text-xs">{user.email}</span>
            <span className="block text-xs">
              {getMemberIcon(user.role).label}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {isAdmin ? (
          <DropdownMenuItem render={<Link href="/settings" />}>
            <Settings aria-hidden />
            Configurações
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          onClick={onSignOut}
        >
          <LogOut aria-hidden />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
