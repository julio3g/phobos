import { Check, Minus } from 'lucide-react'
import type { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { userRoleIcons } from '@/lib/icons'
import {
  permissionGroups,
  type Role,
  roleDescriptions,
  roleLabels,
} from '@/lib/permissions'

export const metadata: Metadata = { title: 'Permissões' }

const roles = Object.keys(roleLabels) as Role[]

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-medium text-2xl">Permissões</h2>
        <p className="text-muted-foreground text-sm">
          O que cada permissão pode fazer no aplicativo. Altere a permissão de
          um usuário em Usuários.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {roles.map(role => {
          const Icon = userRoleIcons[role]
          return (
            <div key={role} className="space-y-1 rounded-lg border p-3">
              <Badge variant="outline" className="py-1 [&>svg]:size-3.5">
                <Icon aria-hidden />
                {roleLabels[role]}
              </Badge>
              <p className="text-muted-foreground text-sm">
                {roleDescriptions[role]}
              </p>
            </div>
          )
        })}
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-2">Ação</th>
              {roles.map(role => (
                <th key={role} className="p-2 text-center">
                  {roleLabels[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissionGroups.map(group => (
              <PermissionGroup key={group.title} group={group} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PermissionGroup({
  group,
}: {
  group: (typeof permissionGroups)[number]
}) {
  return (
    <>
      <tr className="border-t bg-muted/30">
        <td colSpan={roles.length + 1} className="p-2 font-medium">
          {group.title}
        </td>
      </tr>
      {group.items.map(item => (
        <tr key={item.label} className="border-t">
          <td className="p-2">{item.label}</td>
          {roles.map(role => (
            <td key={role} className="p-2 text-center">
              {item.roles[role] ? (
                <Check
                  className="mx-auto size-4 text-green-600"
                  aria-label="Pode"
                />
              ) : (
                <Minus
                  className="mx-auto size-4 text-muted-foreground"
                  aria-label="Não pode"
                />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
