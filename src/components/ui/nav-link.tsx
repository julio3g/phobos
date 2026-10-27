'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'

export type NavLinkProps = ComponentProps<typeof Link>

export function NavLink(props: NavLinkProps) {
  return (
    <Button
      render={<Link {...props} prefetch={false} />}
      variant="ghost"
      nativeButton={false}
      data-current={usePathname() === props.href}
      className={cn(
        'gap-1.5 px-2 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-primary data-[current=true]:bg-muted data-[current=true]:text-primary',
        props.className
      )}
    />
  )
}
