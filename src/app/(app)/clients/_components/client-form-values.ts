import type { Client } from '@/db/schema'
import type { ClientFormValues } from './use-client-autofill'

export const emptyClientValues: ClientFormValues = {
  personType: 'individual',
  legalName: '',
  tradeName: '',
  contactName: '',
  email: '',
  phone: '',
  cpf: '',
  cnpj: '',
  stateRegistration: '',
  street: '',
  neighborhood: '',
  addressNumber: '',
  complement: '',
  city: '',
  state: '',
  zipCode: '',
}

/** Linha do banco (null) -> valores do form (string vazia). */
export function clientToFormValues(client: Client): ClientFormValues {
  return {
    personType: client.personType ?? 'individual',
    legalName: client.legalName,
    tradeName: client.tradeName ?? '',
    contactName: client.contactName ?? '',
    email: client.email ?? '',
    phone: client.phone ?? '',
    cpf: client.cpf ?? '',
    cnpj: client.cnpj ?? '',
    stateRegistration: client.stateRegistration ?? '',
    street: client.street ?? '',
    neighborhood: client.neighborhood ?? '',
    addressNumber: client.addressNumber ? String(client.addressNumber) : '',
    complement: client.complement ?? '',
    city: client.city ?? '',
    state: client.state ?? '',
    zipCode: client.zipCode ?? '',
  }
}
