import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  principal: text('principal').primaryKey(),
  name: text('name'),
  description: text('description'),
  role: text('role').notNull(), // 'DAO', 'BUILDER', 'INVESTOR'
  githubUrl: text('github_url'),
  websiteUrl: text('website_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(), // UUID
  onchainId: integer('onchain_id'), // Matches Clarity escrow-id
  daoPrincipal: text('dao_principal').references(() => users.principal),
  builderPrincipal: text('builder_principal').references(() => users.principal),
  title: text('title').notNull(),
  description: text('description'),
  amountUsdcx: real('amount_usdcx').notNull(),
  discountBps: integer('discount_bps'), // e.g., 600 = 6% discount
  status: text('status').notNull(), // 'PENDING', 'LOCKED', 'TOKENIZED', 'SETTLED'
  githubPrUrl: text('github_pr_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const investments = sqliteTable('investments', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').references(() => invoices.id),
  investorPrincipal: text('investor_principal').references(() => users.principal),
  amountSbtc: real('amount_sbtc').notNull(),
  sharePercentage: real('share_percentage').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
