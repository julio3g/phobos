'use server'

import { Cnpja } from '@cnpja/sdk'
import ky, { HTTPError } from 'ky'
import { connection } from 'next/server'
import { requireSession } from '@/db/queries'
import { env } from '@/env'
import { getErrorMessage } from '@/lib/handle-error'

// Server actions são chamáveis por qualquer cliente: exigem sessão para não
// gastar a cota das APIs externas, e devolvem { data, error } porque em produção
// o Next esconde a mensagem de erros lançados.

export interface ZipLookup {
  code: string
  street: string
  district: string
  city: string
  state: string
}

export interface CompanyLookup {
  legalName: string
  tradeName: string
  email: string
  phone: string
  zipCode: string
  street: string
  addressNumber: string
  complement: string
  neighborhood: string
  city: string
  state: string
  stateRegistration: string
}

function cnpja() {
  if (!env.CNPJA_KEY) throw new Error('Consulta de CNPJ/CEP não configurada.')
  return new Cnpja({ apiKey: env.CNPJA_KEY })
}

export async function lookupZip(code: string) {
  await connection()
  await requireSession()
  try {
    const zip = await cnpja().zip.read({ code })

    return {
      data: {
        code: zip.code,
        street: zip.street ?? '',
        district: zip.district ?? '',
        city: zip.city ?? '',
        state: zip.state ?? '',
      } satisfies ZipLookup,
      error: null,
    }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

export async function lookupCompany(taxId: string) {
  await connection()
  await requireSession()
  try {
    const office = await cnpja().office.read({
      taxId,
      registrations: ['ORIGIN'],
    })

    const phone = office.phones?.[0]
    const registration =
      office.registrations?.find(reg => reg.enabled) ??
      office.registrations?.[0]

    return {
      data: {
        legalName: office.company?.name ?? '',
        tradeName: office.alias ?? '',
        email: office.emails?.[0]?.address ?? '',
        phone: phone ? `${phone.area}${phone.number}` : '',
        zipCode: office.address?.zip ?? '',
        street: office.address?.street ?? '',
        addressNumber: office.address?.number ?? '',
        complement: office.address?.details ?? '',
        neighborhood: office.address?.district ?? '',
        city: office.address?.city ?? '',
        state: office.address?.state ?? '',
        stateRegistration: registration?.number ?? '',
      } satisfies CompanyLookup,
      error: null,
    }
  } catch (err) {
    return { data: null, error: getErrorMessage(err) }
  }
}

type CpfHubResponse =
  | { success: true; data: { name: string } }
  | { success: false; data: null; error: { message: string } }

export async function lookupTaxpayer(cpf: string) {
  await connection()
  await requireSession()
  try {
    if (!env.CPF_HUB_KEY) throw new Error('Consulta de CPF não configurada.')

    const response = await ky
      .get(`https://api.cpfhub.io/cpf/${cpf}`, {
        headers: { 'x-api-key': env.CPF_HUB_KEY },
      })
      .json<CpfHubResponse>()

    if (!response.success) throw new Error(response.error.message)

    return { data: { name: response.data.name }, error: null }
  } catch (err) {
    if (err instanceof HTTPError) {
      return {
        data: null,
        error: `CPF não encontrado (CPFHub ${err.response.status})`,
      }
    }
    return { data: null, error: getErrorMessage(err) }
  }
}
