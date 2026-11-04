export const IMAGE_MAX_SIZE = 1024 * 1024 * 5 // 5MB

// extensão vem do mime (nunca do nome enviado pelo usuário)
export const IMAGE_MIME_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
} as const

export type ImageMimeType = keyof typeof IMAGE_MIME_EXTENSIONS

export const IMAGE_ACCEPT = Object.keys(IMAGE_MIME_EXTENSIONS).join(',')

export const UPLOAD_PATHS = ['products', 'materials'] as const

export type UploadPath = (typeof UPLOAD_PATHS)[number]

export function validateImageFile(file: File) {
  if (!(file.type in IMAGE_MIME_EXTENSIONS))
    return 'Tipo de arquivo não permitido. Use JPG, PNG, WebP ou GIF.'

  if (file.size > IMAGE_MAX_SIZE) return 'A imagem deve ter no máximo 5MB.'

  return null
}
