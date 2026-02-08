<img width="1920" height="1080" alt="Medialane" src="https://mediolano.xyz/wp-content/uploads/2026/01/medialane-monetization-hub-programmable-ip.jpg" />

### Medialane: Creators Capital Markets on the Integrity Web

Monetization hub financial infrastructure for the Creators Capital Markets, with Creators Launchpad and IP Marketplace engineered for the integrity web, to enable trustless, verifiable financial activity. Medialane empowers creators, businesses, and AI to fully own, trade, and generate capital from intellectual property with sovereignty, control, and transparency.


The core of our business operates through two integrated financial hubs. The Creator Launchpad is the engine for capital structuring, facilitating the creation of financial assets and structured revenue products such as IP Coins, Creator Coins, Collection Drops, IP Clubs, Memberships, Subscriptions, and IP Tickets. Complementing this is the NFT Marketplace, which functions as the High-Integrity Exchange, the central secondary market for the licensing and trading of all tokenized creator assets.


We provide the definitive operating environment for creative capital, eliminating intermediaries and friction through key principles. Creators maintain Sovereign Capital—complete ownership over their assets and decentralized identity, which is the basis for their market activity. Utilizing the Mediolano primitives, assets feature Programmable Licensing, giving creators precise control over usage and remix terms with contracts generated automatically. 

Discover Medialane (Dapp Preview): [https://medialane.xyz](https://medialane.xyz)

#### Powered by Starknet, Mediolano Protocol, Chipi Pay SDK.

## Key Features

- **Creator Launchpad**: Tools for capital structuring and creating financial assets like IP Coins and Creator Coins.
- **IP Marketplace**: A high-integrity secondary market for licensing and trading tokenized assets.
- **Programmable Licensing**: Smart contracts that automatically enforce usage and remix terms.
- **Sovereign Capital**: Complete ownership for creators over their assets and decentralized identity.
- **Interactive UI**: Rich animations, floating navigation, and a responsive design optimized for mobile and desktop.
- **Wallet Integration**: Seamless connection with Starknet wallets throughout the application.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Blockchain**: [Starknet](https://www.starknet.io/) (via `@starknet-react/core`)
- **Authentication**: [Clerk](https://clerk.com/)
- **Invisible Wallet/Payments**: [Chipi Pay](https://chipipay.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)

## Project Structure

```bash
src/
├── app/                  # Application routes and pages (App Router)
│   ├── layout.tsx        # Global layout and providers
│   ├── page.tsx          # Landing page
│   └── [features]/       # Feature-based route directories (assets, creators, etc.)
├── components/           # React components
│   ├── ui/               # Reusable atomic UI components (Button, Card, etc.)
│   └── [feature].tsx     # Feature-specific components
├── lib/                  # Utilities, contexts, and helper functions
├── hooks/                # Custom React hooks
└── styles/               # Global styles
```

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env.local` file:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NEXT_PUBLIC_CHIPI_API_KEY=your_chipi_api_key
```

## Roadmap

- [X] Medialane Protocol @ Starknet Sepolia **25.11**
- [X] Medialane Dapp @ Starknet Sepolia **25.11**
- [X] Medialane Onboarding @ Starknet Mainnet **26.01**
- [ ] Medialane Protocol @ Starknet Mainnet **26.02**
- [ ] Medialane Creator Launchpad @ Starknet Mainnet **26.03**
- [ ] Medialane Marketplace @ Starknet Mainnet **26.03**


## Contributing

Contributions are **greatly appreciated**. If you have a feature or suggestion that would our platform better, please fork the repo and create a pull request with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/Feature`)
3. Commit your Changes (`git commit -m 'Add some Feature'`)
4. Push to the Branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## Getting Started


### Running locally

**Prerequisites:**
- Node.js 18.18 or later
- npm or pnpm or yarn

1. **Clone the repository:**

   ```bash
   git clone https://github.com/medialane-xyz/medialane-xyz.git
   cd medialane-xyz
   ```

2. **Install dependencies:**

   ```bash
   npm install --force
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory and add the required keys (see [Environment Variables](#environment-variables)).

4. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


### Running via Docker

To run the containerized application, there is no dependencies requirement other than Docker. 

1. **Build the image:**

   ```bash
   docker build -t medialane-xyz .     
   ```

2. **Start the container:**

   ```bash
   docker run -p 8080:8080 medialane-xyz
   ```
