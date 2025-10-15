import { PrismaClient, Role, ProductType, ProductStatus, OrderStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed Letsdoo');

  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.version.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const passwordAdmin = await bcrypt.hash('Admin123!', 12);
  const passwordCreator = await bcrypt.hash('Creator123!', 12);
  const passwordClient = await bcrypt.hash('Client123!', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@letsdoo.io',
      passwordHash: passwordAdmin,
      displayName: 'Admin Letsdoo',
      role: Role.ADMIN,
    },
  });

  const creator1 = await prisma.user.create({
    data: {
      email: 'alice@letsdoo.io',
      passwordHash: passwordCreator,
      displayName: 'Alice Automatisation',
      role: Role.CREATOR,
    },
  });

  const creator2 = await prisma.user.create({
    data: {
      email: 'bruno@letsdoo.io',
      passwordHash: passwordCreator,
      displayName: 'Bruno Bots',
      role: Role.CREATOR,
    },
  });

  const client = await prisma.user.create({
    data: {
      email: 'client@letsdoo.io',
      passwordHash: passwordClient,
      displayName: 'Claire Client',
      role: Role.CLIENT,
    },
  });

  const categories = await prisma.$transaction([
    prisma.category.create({ data: { name: 'Modules Odoo', slug: 'modules-odoo' } }),
    prisma.category.create({ data: { name: 'Templates', slug: 'templates' } }),
    prisma.category.create({ data: { name: 'Scripts Python', slug: 'scripts-python' } }),
    prisma.category.create({ data: { name: 'Connecteurs', slug: 'connecteurs' } }),
  ]);

  const sampleProducts = [
    {
      title: 'Module Odoo - Facturation intelligente',
      slug: 'module-odoo-facturation-intelligente',
      type: ProductType.MODULE,
      descriptionMD: '## Simplifiez la facturation\nAutomatisez la génération de vos factures avec des règles dynamiques.',
      subtitle: 'Gagnez 2h par jour sur vos relances clients',
      priceCents: 14900,
      compatibility: ['Odoo 17', 'Odoo 18'],
      tags: ['odoo', 'finance', 'automatisation'],
      authorId: creator1.id,
      coverUrl: '/assets/covers/facturation.jpg',
      status: ProductStatus.PUBLISHED,
      categories: [categories[0]],
    },
    {
      title: 'Template CRM Notion',
      slug: 'template-crm-notion',
      type: ProductType.TEMPLATE,
      descriptionMD: '### Centralisez vos leads\nUne base structurée prête à l’emploi pour Notion.',
      subtitle: 'Organisez votre pipeline sans effort',
      priceCents: 4900,
      compatibility: ['Notion', 'Make.com'],
      tags: ['template', 'crm'],
      authorId: creator1.id,
      coverUrl: '/assets/covers/notion-crm.jpg',
      status: ProductStatus.PUBLISHED,
      categories: [categories[1]],
    },
    {
      title: 'Script Python - Synchronisation SaaS',
      slug: 'script-python-synchronisation-saas',
      type: ProductType.SCRIPT,
      descriptionMD: 'Synchronisez vos comptes SaaS en quelques lignes de code.',
      subtitle: 'Connectez Stripe, HubSpot et Slack',
      priceCents: 0,
      compatibility: ['SaaS', 'Make.com'],
      tags: ['python', 'integration'],
      authorId: creator2.id,
      coverUrl: '/assets/covers/python-sync.jpg',
      status: ProductStatus.PUBLISHED,
      categories: [categories[2], categories[3]],
    },
  ];

  for (const product of sampleProducts) {
    const created = await prisma.product.create({
      data: {
        title: product.title,
        slug: product.slug,
        type: product.type,
        descriptionMD: product.descriptionMD,
        subtitle: product.subtitle,
        priceCents: product.priceCents,
        compatibility: product.compatibility,
        tags: product.tags,
        authorId: product.authorId,
        coverUrl: product.coverUrl,
        status: product.status,
        categories: {
          create: product.categories.map((cat) => ({ categoryId: cat.id })),
        },
        versions: {
          create: [
            {
              number: '1.0.0',
              changelogMD: 'Version initiale',
              zipUrl: '/storage/demo.zip',
            },
            {
              number: '1.1.0',
              changelogMD: 'Améliorations et correctifs',
              zipUrl: '/storage/demo-1-1.zip',
            },
          ],
        },
      },
    });

    await prisma.review.create({
      data: {
        productId: created.id,
        userId: client.id,
        rating: 5,
        comment: 'Une solution indispensable pour notre équipe !',
      },
    });
  }

  const order = await prisma.order.create({
    data: {
      buyerId: client.id,
      totalCents: 19800,
      currency: 'EUR',
      status: OrderStatus.PAID,
      items: {
        create: sampleProducts.map((product) => ({
          product: { connect: { slug: product.slug } },
          unitPriceCents: product.priceCents,
          qty: 1,
        })),
      },
    },
  });

  await prisma.favorite.create({
    data: {
      userId: client.id,
      product: { connect: { slug: sampleProducts[0].slug } },
    },
  });

  console.log('✅ Seed terminé avec succès', { admin: admin.email, order: order.id });
}

main()
  .catch((error) => {
    console.error('❌ Seed échoué', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
