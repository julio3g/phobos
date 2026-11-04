import { createSearchParamsCache, parseAsString } from 'nuqs/server'

// formato e limites são validados em resolveRange (lib/date-range)
export const searchParamsCacheDashboard = createSearchParamsCache({
  from: parseAsString,
  to: parseAsString,
})
