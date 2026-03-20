# ⚡ InvoiceVault

**Fractional, yield-bearing escrow that turns pending developer grants and SME invoices into instant liquidity on Stacks.**

[![Live Demo](https://img.shields.io/badge/Demo-Live-green.svg)](#)
[![Stacks Testnet](https://img.shields.io/badge/Stacks-Testnet-orange.svg)](#)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](#)

---

## 📖 The Problem: Trapped Capital in the Gig Economy

When freelance developers or agencies accept a bounty or a grant from a DAO, they aren't paid immediately. The DAO must protect its treasury, so it locks the funds in an escrow contract until the work is finished and the GitHub Pull Request is merged. 

This causes massive friction:
*   **The Builder's Dilemma:** Developers need cash *today* to pay rent, servers, and their team. Their money is mathematically secure but completely illiquid for 30 to 90 days.
*   **The DAO's Dilemma:** DAOs cannot risk paying upfront for incomplete code. They inadvertently starve their best contributors.

## 💡 The Solution: Factoring on Bitcoin

**InvoiceVault** brings the $3 Trillion traditional invoice factoring market to Web3. It is a decentralized, fractional marketplace built on the Stacks L2.

1.  **DAOs** lock funds safely in a Clarity smart contract.
2.  **Builders** can instantly "tokenize" that pending locked payout, offering fractional shares of it to the market at a slight discount.
3.  **DeFi Investors** provide instant liquidity (sBTC) to the builders today in exchange for the right to claim the full value (USDCx) when the milestone is completed.

Builders get paid today. DAOs get their code risk-free. Investors get a low-risk, Bitcoin-backed real-world asset (RWA) yield.

---

## 🚀 Key Features

*   **Role-Based Dashboards:** Distinct user experiences for DAOs (managing grants), Builders (managing liquidity), and Investors (managing yield portfolios).
*   **Clarity Smart Contracts:** Fully functional `invoice-vault.clar` deployed to the Stacks Testnet, handling trustless escrow and fractional accounting.
*   **sBTC Liquidity:** Built to leverage the new sBTC standard on Stacks, allowing investors to fund projects with decentralized Bitcoin.
*   **Automated x402 Webhook Oracle:** A Next.js backend that listens for GitHub PR merges, verifies them, and acts as an automated Oracle to settle the on-chain contract instantly. No manual claims required by the DAO.
*   **Interactive Onboarding:** Built-in `react-joyride` product tour and an immersive embedded pitch deck.

---

## 🏗️ Architecture & Tech Stack

InvoiceVault utilizes a high-performance hybrid architecture:

*   **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4, shadcn/ui.
*   **Database:** Turso (Edge SQLite) + Drizzle ORM for blazing-fast off-chain metadata caching and user profile management.
*   **Smart Contracts:** Clarity on the Stacks L2 Network.
*   **Web3 Integration:** `@stacks/connect` and `micro-stacks` for seamless wallet connection (Leather, Xverse).
*   **Blockchain Indexing:** Custom polling endpoints utilizing the Hiro API to sync on-chain transaction data with the Turso edge database.

### Smart Contract Deployment
The Clarity contract is currently deployed and verified on the Stacks Testnet:
*   **Contract Address:** `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.invoice-vault`

---

## 📂 File Organization

```text
invoice-vault/
├── contracts/
│   └── invoice-vault.clar        # The core Clarity smart contract
├── src/
│   ├── app/
│   │   ├── api/                  # Next.js API Routes (Oracles, Webhooks, Sync)
│   │   ├── dashboard/            # Role-based DAO and Builder views
│   │   ├── marketplace/          # Public DeFi marketplace for tokenized invoices
│   │   ├── pitch/                # Embedded interactive pitch deck
│   │   └── portfolio/            # Investor yield tracking and claiming
│   ├── components/
│   │   ├── layout/               # Navbar and global UI wrappers
│   │   ├── providers/            # StacksProvider (Wallet state)
│   │   ├── tutorial/             # react-joyride interactive onboarding
│   │   └── ui/                   # shadcn UI components
│   ├── db/
│   │   └── schema.ts             # Drizzle ORM SQLite schema for Turso
│   └── lib/                      # Utils and Oracle key management
├── local.db                      # Local SQLite fallback for dev
└── ARCHITECTURE.md               # Detailed technical spec
```

---

## 🛠️ Getting Started (Local Development)

### 1. Prerequisites
*   Node.js (v18+)
*   Bun or npm
*   A Leather or Xverse wallet (switched to Stacks Testnet)

### 2. Clone and Install
```bash
git clone https://github.com/yourusername/invoice-vault.git
cd invoice-vault
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory. You can use local SQLite for development or connect a Turso Edge DB.
```env
# Database
TURSO_DATABASE_URL="file:./local.db"
# TURSO_AUTH_TOKEN="" # Required if using remote Turso DB

# Stacks Network
NEXT_PUBLIC_CONTRACT_ADDRESS="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
NEXT_PUBLIC_CONTRACT_NAME="invoice-vault"
NEXT_PUBLIC_NETWORK_ENV="testnet"

# Oracle Config
ORACLE_PRIVATE_KEY="your_testnet_private_key_here"
```

### 4. Database Setup
Push the Drizzle schema to your database (local or remote):
```bash
npx drizzle-kit push
```

### 5. Run the Application
```bash
npm run dev
```
Open `http://localhost:3000` to interact with the protocol.

---

## 🔒 Security Notice
*   This project was built for a hackathon. The smart contracts have not been formally audited. Do not use on Mainnet with real funds without a comprehensive security review.
*   The x402 Lightning network verification in the GitHub webhook is currently mocked for the hackathon demo, as GitHub webhooks cannot natively pay Lightning invoices.

## 📄 License
MIT License
