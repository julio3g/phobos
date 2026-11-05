'use client'

import { cn } from 'cn'
import * as React from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useMediaQuery } from '@/hooks/use-media-query'

export type RootProps = React.ComponentPropsWithoutRef<typeof Dialog>

const Ctx = React.createContext<{ isDesktop: boolean } | null>(null)
const useModalCtx = () => {
  const ctx = React.useContext(Ctx)
  if (!ctx)
    throw new Error('Sub components must be used within <DialogDrawer>')
  return ctx
}

// Escolhe o componente do Dialog (desktop) ou do Drawer (mobile) pelo contexto.
function responsive<D extends React.ElementType, M extends React.ElementType>(
  Desktop: D,
  Mobile: M
) {
  return function Part(props: React.ComponentProps<D>) {
    const { isDesktop } = useModalCtx()
    const Comp: React.ElementType = isDesktop ? Desktop : Mobile
    return <Comp {...props} />
  }
}

function DialogDrawer({
  children,
  open,
  defaultOpen,
  onOpenChange,
  modal,
}: RootProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const Root: React.ElementType = isDesktop ? Dialog : Drawer

  return (
    <Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      <Ctx.Provider value={{ isDesktop }}>
        {children as React.ReactNode}
      </Ctx.Provider>
    </Root>
  )
}

// Base UI não tem asChild: o filho único vira o `render` do trigger/close.
// Passe asChild={false} para renderizar o botão nativo.
function asRender<D extends React.ElementType>(Desktop: D, Mobile: D) {
  return function Part({
    children,
    asChild = true,
    ...rest
  }: React.ComponentProps<D> & { asChild?: boolean }) {
    const { isDesktop } = useModalCtx()
    const Comp: React.ElementType = isDesktop ? Desktop : Mobile
    if (asChild && React.isValidElement(children)) {
      return <Comp render={children} {...rest} />
    }
    return <Comp {...rest}>{children}</Comp>
  }
}

const Trigger = asRender(DialogTrigger, DrawerTrigger)
const Close = asRender(DialogClose, DrawerClose)
const Content = responsive(DialogContent, DrawerContent)
const Header = responsive(DialogHeader, DrawerHeader)
const Title = responsive(DialogTitle, DrawerTitle)
const Description = responsive(DialogDescription, DrawerDescription)
const Footer = responsive(DialogFooter, DrawerFooter)

function Body({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  const { isDesktop } = useModalCtx()
  return (
    <div {...rest} className={isDesktop ? className : cn('p-4', className)}>
      {children}
    </div>
  )
}

export {
  Body,
  Close,
  Content,
  Description,
  DialogDrawer,
  Footer,
  Header,
  Title,
  Trigger,
}
