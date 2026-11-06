export const roleLabels = {
  owner: 'Proprietário',
  admin: 'Administrador',
  member: 'Membro',
} as const

export type Role = keyof typeof roleLabels

export const roleDescriptions: Record<Role, string> = {
  owner:
    'Criou a empresa. Tem todos os poderes de administrador e não pode ser removido, desativado nem ter a permissão alterada.',
  admin:
    'Gerencia tudo: ordens, clientes, produtos, materiais, empresa e usuários.',
  member: 'Somente consulta. Vê os dados, mas não altera nada.',
}

export const roleOptions = (['admin', 'member'] as const).map(value => ({
  value,
  label: roleLabels[value],
}))

const everyone: Record<Role, boolean> = {
  owner: true,
  admin: true,
  member: true,
}
const adminsOnly: Record<Role, boolean> = {
  owner: true,
  admin: true,
  member: false,
}

/** Quem pode o quê (espelha as checagens `isAdminUser` das actions). */
export const permissionGroups: {
  title: string
  items: { label: string; roles: Record<Role, boolean> }[]
}[] = [
  {
    title: 'Ordens',
    items: [
      { label: 'Ver ordens', roles: everyone },
      { label: 'Criar, editar e mudar status', roles: adminsOnly },
      { label: 'Excluir', roles: adminsOnly },
    ],
  },
  {
    title: 'Clientes',
    items: [
      { label: 'Ver clientes', roles: everyone },
      { label: 'Criar e editar', roles: adminsOnly },
    ],
  },
  {
    title: 'Produtos',
    items: [
      { label: 'Ver produtos', roles: everyone },
      { label: 'Criar, editar e recalcular custo', roles: adminsOnly },
      { label: 'Excluir', roles: adminsOnly },
    ],
  },
  {
    title: 'Materiais',
    items: [
      { label: 'Ver materiais', roles: everyone },
      { label: 'Criar, editar e arquivar', roles: adminsOnly },
      { label: 'Excluir', roles: adminsOnly },
    ],
  },
  {
    title: 'Empresa e usuários',
    items: [
      { label: 'Editar dados da empresa', roles: adminsOnly },
      { label: 'Adicionar usuários', roles: adminsOnly },
      { label: 'Editar usuários e mudar permissão', roles: adminsOnly },
      { label: 'Desativar ou remover usuários', roles: adminsOnly },
      { label: 'Alterar o próprio perfil e senha', roles: everyone },
    ],
  },
]
