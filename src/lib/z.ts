import { z } from 'zod'

z.config(z.locales.pt())

const emptyToUndefined = <T extends z.ZodType>(schema: T) =>
  z
    .union([
      z
        .string()
        .trim()
        .length(0)
        .transform(() => undefined),
      schema,
    ])
    .optional()

export { z, emptyToUndefined }
