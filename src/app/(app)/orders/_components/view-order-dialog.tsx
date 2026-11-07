'use client'

import {
  Body,
  Close,
  Content,
  Description,
  DialogDrawer,
  Footer,
  Header,
  Title,
} from '@/components/dialog-drawer'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { OrderListItem } from '@/db/queries/orders'
import { formatCurrency, formatShortDate } from '@/lib/format'
import {
  formatOrderNumber,
  getOrderStatusIcon,
  getPaymentStatusIcon,
} from '@/utils/get-label-and-icons'

interface ViewOrderDialogProps {
  order: OrderListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewOrderDialog({
  order,
  open,
  onOpenChange,
}: ViewOrderDialogProps) {
  return (
    <DialogDrawer open={open} onOpenChange={onOpenChange}>
      <Content className="flex flex-col gap-6 sm:max-w-3xl">
        <Header className="text-left">
          <Title>Ordem {order ? formatOrderNumber(order.number) : ''}</Title>
          <Description>Revise os detalhes da ordem</Description>
        </Header>
        <Body className="space-y-6">
          {order ? (
            <>
              <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Cliente</dt>
                  <dd className="font-medium">{order.client.clientName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Criada em</dt>
                  <dd className="font-medium">
                    {formatShortDate(order.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <StatusBadge meta={getOrderStatusIcon(order.status)} />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Pagamento</dt>
                  <dd>
                    <StatusBadge
                      meta={getPaymentStatusIcon(order.paymentStatus)}
                    />
                  </dd>
                </div>
                {order.notes ? (
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground">Observações</dt>
                    <dd>{order.notes}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/25">
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtd.</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.orderItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-48 truncate">
                          {item.product.name}
                          {item.product.variant
                            ? ` — ${item.product.variant}`
                            : ''}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <dl className="ml-auto grid w-full max-w-xs grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="text-right">{formatCurrency(order.subtotal)}</dd>
                <dt className="text-muted-foreground">Desconto</dt>
                <dd className="text-right">
                  - {formatCurrency(order.discount)}
                </dd>
                <dt className="text-muted-foreground">Frete</dt>
                <dd className="text-right">
                  + {formatCurrency(order.shipping)}
                </dd>
                <dt className="font-medium">Total</dt>
                <dd className="text-right font-medium">
                  {formatCurrency(order.total)}
                </dd>
              </dl>
            </>
          ) : null}
        </Body>
        <Footer className="pt-0 max-sm:px-4 max-sm:pb-4">
          <Close asChild>
            <Button type="button">Fechar</Button>
          </Close>
        </Footer>
      </Content>
    </DialogDrawer>
  )
}
