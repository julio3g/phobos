'use client'

import { ImagePlus, Loader2, X } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { uploadImage } from '@/db/actions'
import {
  IMAGE_ACCEPT,
  IMAGE_MAX_SIZE,
  type UploadPath,
  validateImageFile,
} from '@/lib/upload'

interface ImageUploadProps {
  id?: string
  /** URL atual da imagem (já enviada ao R2). */
  value?: string | null
  /** Chamado com a URL após o upload, ou `undefined` ao remover. */
  onChange: (url: string | undefined) => void
  path: UploadPath
  disabled?: boolean
}

/** Campo de imagem inline: escolhe o arquivo, envia ao R2 e devolve a URL. */
export function ImageUpload({
  id,
  value,
  onChange,
  path,
  disabled,
}: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleFile(file: File) {
    const invalid = validateImageFile(file)
    if (invalid) {
      setError(invalid)
      return
    }

    setError(null)
    setUploading(true)

    const formData = new FormData()
    formData.set('file', file)
    formData.set('path', path)

    const { data, error } = await uploadImage(formData)
    setUploading(false)

    if (error || !data) {
      setError(error ?? 'Falha ao enviar a imagem.')
      return
    }

    onChange(data.url)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {value ? (
          // biome-ignore lint/performance/noImgElement: URL externa do R2, sem otimização do next/image
          <img
            src={value}
            alt="Imagem enviada"
            className="size-16 rounded-md border object-cover"
          />
        ) : null}
        <Button
          type="button"
          variant="outline"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
          {uploading ? 'Enviando...' : value ? 'Trocar imagem' : 'Enviar imagem'}
        </Button>
        {value && !uploading ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remover imagem"
            disabled={disabled}
            onClick={() => {
              setError(null)
              onChange(undefined)
            }}
          >
            <X className="size-4" />
          </Button>
        ) : null}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={IMAGE_ACCEPT}
          className="sr-only"
          onChange={e => {
            const file = e.target.files?.[0]
            // permite escolher o mesmo arquivo de novo
            e.target.value = ''
            if (file) void handleFile(file)
          }}
        />
      </div>
      <p className="text-muted-foreground text-xs">
        JPG, PNG, WebP ou GIF até {IMAGE_MAX_SIZE / 1024 / 1024}MB.
      </p>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  )
}
