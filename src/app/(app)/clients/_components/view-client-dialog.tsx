'use client'

import { StatusBadge } from '@/components/status-badge'
import { ViewDialog } from '@/components/view-dialog'
import type { Client } from '@/db/schema'
import { formatCnpj, formatCpf, formatPhone } from '@/lib/format'
import { getPersonTypeIcon } from '@/utils/get-label-and-icons'

interface ViewClientDialogProps {
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewClientDialog({
  client,
  open,
  onOpenChange,
}: ViewClientDialogProps) {
  const address = client
    ? [
        [client.street, client.addressNumber].filter(Boolean).join(', '),
        client.complement,
        client.neighborhood,
        [client.city, client.state].filter(Boolean).join('/'),
        client.zipCode,
      ]
        .filter(Boolean)
        .join(' · ')
    : ''

  return (
    <ViewDialog
      open={open}
      onOpenChange={onOpenChange}
      title={client?.legalName ?? 'Cliente'}
      description="Dados do cliente"
      fields={
        client
          ? [
              {
                label: 'Tipo',
                value: client.personType ? (
                  <StatusBadge meta={getPersonTypeIcon(client.personType)} />
                ) : null,
              },
              {
                label: client.cnpj ? 'CNPJ' : 'CPF',
                value: client.cnpj
                  ? formatCnpj(client.cnpj)
                  : client.cpf
                    ? formatCpf(client.cpf)
                    : null,
              },
              { label: 'Nome fantasia', value: client.tradeName },
              { label: 'Inscrição estadual', value: client.stateRegistration },
              { label: 'Contato', value: client.contactName },
              {
                label: 'Telefone',
                value: client.phone ? formatPhone(client.phone) : null,
              },
              { label: 'E-mail', value: client.email, wide: true },
              { label: 'Endereço', value: address, wide: true },
            ]
          : []
      }
    />
  )
}
