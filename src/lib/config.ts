interface SiteConfigProps {
  name: string
  description: string
  navItems: { href: string; label: string }[]
}

export const siteConfig: SiteConfigProps = {
  name: 'Phobos',
  description:
    'Sistema web para gerenciamento de insumos, cálculo de custos e precificação de produtos artesanais. Permite organizar materiais, calcular custos de produção e mão de obra, definir margens de lucro e gerenciar um catálogo de produtos de forma simples e eficiente.',
  navItems: [
    { href: '/orders', label: 'Ordens' },
    { href: '/clients', label: 'Clientes' },
    { href: '/products', label: 'Produtos' },
    { href: '/materials', label: 'Materiais' },
  ],
}
