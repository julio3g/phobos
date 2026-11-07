'use server'

import { randomUUID } from 'node:crypto'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { connection } from 'next/server'
import { env } from '@/env'
import { r2 } from '@/lib/cloudflare'
import { getErrorMessage } from '@/lib/handle-error'
import {
  IMAGE_MIME_EXTENSIONS,
  type ImageMimeType,
  UPLOAD_PATHS,
  type UploadPath,
  validateImageFile,
} from '@/lib/upload'
import { requireSession } from '../queries'

/** Envia uma imagem para o R2 e devolve a URL pública. */
export async function uploadImage(formData: FormData) {
  await connection()
  const { isAdminUser, organizationId } = await requireSession()
  try {
    if (!isAdminUser)
      throw new Error('Apenas administradores podem enviar arquivos')

    const file = formData.get('file')
    const path = formData.get('path')

    if (!(file instanceof File)) throw new Error('Arquivo inválido.')
    if (!UPLOAD_PATHS.includes(path as UploadPath))
      throw new Error('Caminho de upload inválido.')

    const invalid = validateImageFile(file)
    if (invalid) throw new Error(invalid)

    const extension = IMAGE_MIME_EXTENSIONS[file.type as ImageMimeType]
    const key = `${path}/${organizationId}/${randomUUID()}.${extension}`

    await r2.send(
      new PutObjectCommand({
        Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: key,
        ContentType: file.type,
        ContentLength: file.size,
        Body: Buffer.from(await file.arrayBuffer()),
      })
    )

    return {
      data: { url: `${env.CLOUDFLARE_FILE_BASE_PATH}/${key}` },
      error: null,
    }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}
