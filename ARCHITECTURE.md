# 🏗️ InvoiceVault: Technical Execution Plan

**1-Sentence Pitch:** Fractional, yield-bearing escrow that turns pending developer grants and SME invoices into instant liquidity on Stacks.

This architecture bridges the gap between traditional DAO grant/invoice management and DeFi liquidity, utilizing Stacks (Clarity) for Bitcoin-secured settlement and Turso (Edge SQLite) for blazing-fast frontend experiences.

---

## 1. System Architecture Overview

**InvoiceVault** operates on a hybrid on-chain/off-chain architecture.

*   **Frontend (Next.js App Router):** The command center. Uses **Tailwind CSS** and **shadcn/ui** for a clean, high-trust financial interface.
*   **Web3 Connection (AppKit + Stacks):** Uses **AppKit (Reown)** for the modal UI, paired with `@stacks/connect` and `micro-stacks` to handle Stacks-specific transaction signing (Leather, Xverse).
*   **Database (Turso + Drizzle ORM):** Acts as the high-speed indexing layer. It stores rich metadata (project descriptions, GitHub PR links, user profiles) and caches on-chain state so the UI doesn't have to constantly poll the Stacks blockchain.
*   **Smart Contracts (Clarity):** The source of truth. Handles the locking of USDCx, the accounting of fractional sBTC investments, and the trustless payout routing.
*   **Oracle/Trigger (Next.js API + x402):** A secure backend route that listens for off-chain completion events (e.g., a merged GitHub PR verified by an x402 payment) and broadcasts the `resolve-escrow` transaction to the Clarity contract.

---

## 2. Feature Breakdown & Detailed User Workflows

### Feature 1: The DAO/Buyer Escrow Lock (Locking USDCx)
*The DAO creates a grant and locks the payout funds.*

1.  **User Action:** The DAO Admin goes to "Create Grant". They fill out a shadcn `Form`: Builder Wallet Address, Amount ($50,000 USDCx), Milestone Description, and Deadline.
2.  **Frontend:** Next.js validates the form and triggers `@stacks/connect` `openContractCall`.
3.  **Clarity Contract:** Executes `create-escrow`. The contract transfers 50,000 USDCx (SIP-010) from the DAO's wallet into the smart contract's custody. It assigns an `escrow-id`.
4.  **Turso/Drizzle:** Upon transaction broadcast, a Next.js API route writes a new record to the `invoices` table with status `LOCKED`, storing the rich text description and linking it to the on-chain `escrow-id`.

### Feature 2: Tokenizing the Escrow (Builder Liquidity)
*The Builder needs cash now and offers the locked invoice at a discount.*

1.  **User Action:** The Builder logs in, sees their pending $50,000 USDCx grant, and clicks "Get Upfront Liquidity". They set a discount rate via a sliding Dialog (e.g., "I will take 47,000 sBTC now, giving up 3,000 USDCx as yield").
2.  **Frontend:** Triggers a contract call to `tokenize-invoice`.
3.  **Clarity Contract:** Updates the state of `escrow-id` to allow funding, setting the `discount-bps` (basis points) and the required sBTC funding goal.
4.  **Turso/Drizzle:** A webhook/indexer updates the database status to `TOKENIZED`. The invoice now instantly appears on the public "Yield Marketplace" page.

### Feature 3: The Investor Funding (DeFi users buying fractions)
*Investors buy fractions of the invoice using sBTC to earn the yield.*

1.  **User Action:** An Investor browses the Marketplace (built with shadcn `DataTable`), sees the yield opportunity, and clicks "Fund Invoice". They input an amount (e.g., 23,500 sBTC for 50% of the invoice).
2.  **Frontend:** Triggers `fund-invoice` via the wallet.
3.  **Clarity Contract:** 
    *   Transfers 23,500 sBTC from the Investor to the Builder *immediately*.
    *   Records the Investor's principal address and their share (50%) in the `investors` map.
4.  **Turso/Drizzle:** Writes a new record to the `investments` table, updating the UI progress bar (e.g., "50% Funded").

### Feature 4: The x402 Oracle Trigger & Automated Settlement
*The work is done, the oracle verifies, and funds are distributed.*

1.  **User Action:** The Builder merges the PR on GitHub. 
2.  **Backend (Next.js API):** A GitHub Webhook pings your Next.js API. The API requires an **x402 micro-payment** to process the verification (proving the API request is legit and preventing spam).
3.  **The Trigger:** The server verifies the x402 receipt. It then uses `@stacks/transactions` with a secure Oracle private key to broadcast the `resolve-escrow` function on-chain.
4.  **Clarity Contract:** 
    *   Updates the status of the escrow to "SETTLED".
    *   *(Note for Hackathon: Instead of the contract pushing funds to everyone, which can hit execution limits, have Investors call a `claim-yield` function to pull their funds).*
5.  **The Claim:** The 50% Investor clicks "Claim Yield" on the frontend. The contract sends them 25,000 USDCx (their 50% share of the original $50k). They paid 23,500 sBTC and received 25,000 USDCx. 

---

## 3. Database Schema (Turso + Drizzle ORM)

Create a `schema.ts` file for Drizzle. This keeps the UI blazing fast without querying the blockchain for text/metadata.

```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  principal: text('principal').primaryKey(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  role: text('role').notNull(), // 'DAO', 'BUILDER', 'INVESTOR'
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
```

---

## 4. Clarity Contract Architecture

The Clarity smart contract (`invoice-vault.clar`) is the financial engine. 

**Core Data Maps:**
```clarity
;; Store the main escrow details
(define-map escrows 
  { escrow-id: uint } 
  { 
    dao: principal, 
    builder: principal, 
    amount-usdcx: uint, 
    status: (string-ascii 20), ;; "LOCKED", "TOKENIZED", "SETTLED"
    discount-bps: uint,
    total-sbtc-funded: uint
  }
)

;; Store fractional ownership of the invoice
(define-map investors 
  { escrow-id: uint, investor: principal } 
  { share-bps: uint } ;; Percentage of the final USDCx payout they own
)
```

**Core Public Functions:**
1. `(create-escrow (builder principal) (amount uint))`
   * Asserts caller is DAO.
   * Transfers `amount` of SIP-010 USDCx from `tx-sender` to the contract.
   * Inserts into `escrows` map.
2. `(tokenize-invoice (escrow-id uint) (discount-bps uint))`
   * Asserts caller is the `builder` of the escrow.
   * Updates escrow status to "TOKENIZED".
3. `(fund-invoice (escrow-id uint) (sbtc-amount uint))`
   * Asserts escrow is "TOKENIZED".
   * Transfers SIP-010 sBTC from `tx-sender` (Investor) directly to the `builder`.
   * Calculates `share-bps` based on the `sbtc-amount` vs the discounted total.
   * Updates `investors` map.
4. `(resolve-escrow (escrow-id uint))`
   * Asserts caller is the designated Oracle/Admin principal (triggered by the x402 backend).
   * Updates status to "SETTLED".
5. `(claim-yield (escrow-id uint))`
   * Asserts escrow is "SETTLED".
   * Looks up caller in `investors` map.
   * Transfers their percentage of the locked USDCx from the contract to the caller.
   * Sets their share to 0 to prevent double-claiming.

---

## 5. The Hackathon Demo Secret Weapon
Do not try to do a live GitHub PR merge on stage. Have a giant, beautiful button on the UI that says **"Admin: Simulate Oracle x402 Trigger"**. You press it, the backend fires the transaction, and the UI instantly updates to show the investors can now claim their yield. It shows exactly how the tech works without risking live API failures.