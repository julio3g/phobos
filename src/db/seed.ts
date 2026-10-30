import chalk from 'chalk'
import { hashPassword } from '@/lib/password'
import { nextOrderNumber } from '@/lib/generate-number'
import slugify from '@/lib/slug'
import { db } from './connection'
import {
  clients,
  materials,
  members,
  orderItems,
  orders,
  organizations,
  products,
  users,
} from './schema'
import { takeFirstOrThrow } from './utils'

/*
 * Reset database (ordem respeita FKs: filhos antes dos pais)
 */

await db.delete(orderItems)
await db.delete(orders)
await db.delete(products)
await db.delete(materials)
await db.delete(clients)
await db.delete(members)
await db.delete(organizations)
await db.delete(users)

console.log(chalk.yellow('✔ Database reset'))

/**
 * Create organization
 */

const nameOrganization = 'Phobos mock'

const organization = await db
  .insert(organizations)
  .values({
    name: nameOrganization,
    slug: slugify(nameOrganization, {
      lower: true,
      strict: true,
      locale: 'pt',
    }),
  })
  .returning()
  .then(takeFirstOrThrow)

console.log(chalk.yellow('✔ Created organization'))

/**
 * Create members
 */

const passwordHash = await hashPassword('member123456@')

const [member1, member2] = await Promise.all([
  db
    .insert(users)
    .values({
      name: 'Member 1',
      username: 'member-1',
      email: 'member1@phobos.com',
      passwordHash,
    })
    .returning()
    .then(takeFirstOrThrow),
  db
    .insert(users)
    .values({
      name: 'Member 2',
      username: 'member-2',
      email: 'member2@phobos.com',
      passwordHash,
    })
    .returning()
    .then(takeFirstOrThrow),
])

await db.insert(members).values([
  { organizationId: organization.id, userId: member1.id, role: 'member' },
  { organizationId: organization.id, userId: member2.id, role: 'member' },
])

console.log(chalk.yellow('✔ Created members'))

/**
 * Create admin
 */

const passwordHashGenerateAdmin = await hashPassword('admin123456@')
const admin = await db
  .insert(users)
  .values({
    name: 'Julio Cesar',
    username: 'julio_cesar',
    email: 'juliodagaita@gmail.com',
    passwordHash: passwordHashGenerateAdmin,
  })
  .returning()
  .then(takeFirstOrThrow)

await db
  .insert(members)
  .values({ organizationId: organization.id, userId: admin.id, role: 'admin' })

console.log(chalk.yellow('✔ Created admin'))

/**
 * Create clients
 */

const [clientIndividual, clientCompany] = await db
  .insert(clients)
  .values([
    {
      organizationId: organization.id,
      legalName: 'Maria Silva',
      contactName: 'Maria Silva',
      email: 'maria@example.com',
      phone: '11999990001',
      personType: 'individual',
      cpf: '52998224725',
      street: 'Rua das Flores',
      neighborhood: 'Centro',
      addressNumber: 120,
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01001000',
    },
    {
      organizationId: organization.id,
      legalName: 'Ateliê Lótus Ltda',
      tradeName: 'Ateliê Lótus',
      contactName: 'Ana Souza',
      email: 'contato@atelielotus.com',
      phone: '11999990002',
      personType: 'company',
      cnpj: '11222333000181',
      stateRegistration: '123456789',
      street: 'Av. Paulista',
      neighborhood: 'Bela Vista',
      addressNumber: 1000,
      complement: 'Sala 12',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310100',
    },
  ])
  .returning()

console.log(chalk.yellow('✔ Created clients'))

/**
 * Create materials
 * (unitCost é coluna gerada: packagePrice / packageQuantity)
 */

await db.insert(materials).values([
  {
    organizationId: organization.id,
    name: 'Linha de crochê',
    brand: 'Círculo',
    variant: 'Cru',
    unit: 'm',
    packagePrice: 12.9,
    packageQuantity: 200,
  },
  {
    organizationId: organization.id,
    name: 'Fio de malha',
    brand: 'Trapilho',
    variant: 'Azul',
    unit: 'm',
    packagePrice: 35,
    packageQuantity: 120,
  },
  {
    organizationId: organization.id,
    name: 'Enchimento acrílico',
    unit: 'g',
    packagePrice: 18,
    packageQuantity: 500,
  },
  {
    organizationId: organization.id,
    name: 'Olho de segurança',
    variant: '8mm',
    unit: 'pair',
    packagePrice: 9.5,
    packageQuantity: 20,
  },
])

console.log(chalk.yellow('✔ Created materials'))

/**
 * Create products
 * (totalCost é coluna gerada; salePrice calculado aqui pela margem)
 */

function priceWithMargin(cost: number, type: 'percent' | 'fixed', value: number) {
  const price = type === 'percent' ? cost * (1 + value / 100) : cost + value
  return Math.round(price * 100) / 100
}

const productSeeds = [
  {
    name: 'Amigurumi Coelho',
    variant: 'Pequeno',
    laborMinutes: 180,
    marginType: 'percent' as const,
    marginValue: 80,
    materialCost: 8.5,
    laborCost: 30,
  },
  {
    name: 'Bolsa de trapilho',
    variant: 'Média',
    laborMinutes: 240,
    marginType: 'fixed' as const,
    marginValue: 45,
    materialCost: 22,
    laborCost: 40,
  },
]

const [product1, product2] = await db
  .insert(products)
  .values(
    productSeeds.map(p => ({
      ...p,
      organizationId: organization.id,
      salePrice: priceWithMargin(
        p.materialCost + p.laborCost,
        p.marginType,
        p.marginValue
      ),
    }))
  )
  .returning()

console.log(chalk.yellow('✔ Created products'))

/**
 * Create orders (com itens)
 */

const orderSeeds = [
  {
    client: clientIndividual,
    status: 'confirmed' as const,
    paymentStatus: 'partial' as const,
    discount: 0,
    shipping: 15,
    paidAmount: 50,
    items: [{ product: product1, quantity: 2 }],
  },
  {
    client: clientCompany,
    status: 'in_production' as const,
    paymentStatus: 'paid' as const,
    discount: 10,
    shipping: 0,
    paidAmount: 0,
    items: [
      { product: product1, quantity: 5 },
      { product: product2, quantity: 1 },
    ],
  },
]

for (const seed of orderSeeds) {
  await db.transaction(async tx => {
    const number = await nextOrderNumber(tx, organization.id)

    const lines = seed.items.map(({ product, quantity }) => ({
      productId: product.id,
      quantity,
      unitPrice: product.salePrice,
      unitCost: product.totalCost,
      total: Math.round(product.salePrice * quantity * 100) / 100,
    }))

    const subtotal = lines.reduce((sum, l) => sum + l.total, 0)
    const costTotal = seed.items.reduce(
      (sum, { product, quantity }) => sum + product.totalCost * quantity,
      0
    )

    const order = await tx
      .insert(orders)
      .values({
        organizationId: organization.id,
        number,
        clientId: seed.client.id,
        status: seed.status,
        paymentStatus: seed.paymentStatus,
        subtotal,
        discount: seed.discount,
        shipping: seed.shipping,
        costTotal,
        paidAmount:
          seed.paymentStatus === 'paid'
            ? subtotal - seed.discount + seed.shipping
            : seed.paidAmount,
      })
      .returning()
      .then(takeFirstOrThrow)

    await tx
      .insert(orderItems)
      .values(lines.map(line => ({ ...line, orderId: order.id })))
  })
}

console.log(chalk.yellow('✔ Created orders'))

console.log(chalk.greenBright('Database seeded successfully!'))

process.exit()
