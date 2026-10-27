'use client'

import { useTheme } from 'next-themes'
import * as React from 'react'
import { useMetaColor } from '@/hooks/use-meta-color'
import { Button } from './button'
import { Icons } from './icons'

export const DARK_MODE_FORWARD_TYPE = 'dark-mode-forward'

export function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme()
  const { setMetaColor, metaColor } = useMetaColor()

  React.useEffect(() => setMetaColor(metaColor), [metaColor, setMetaColor])

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="group/toggle extend-touch-target"
      onClick={toggleTheme}
    >
      <Icons.toggleTheme className="size-4.5" />
      <span className="sr-only">Alterar Tema</span>
    </Button>
  )
}
