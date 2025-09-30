<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/bb4ce556-109f-42e8-85e6-c90a0feade51" />



# medialave.xyz  

### Creative works marketplace, powered with Mediolano’s permissionless licensing primitives, enabling creators to explore and monetize IP with full sovereignty

Medialane is a permissionless marketplace where creators, autonomous agents, and businesses own, license, and trade intellectual property with full transparency, control, and sovereignty.

MediaLane enables creators to publish and monetize intellectual property onchain with full autonomy. Assets are minted as NFT tokens — digital representations of IP that carry embedded licensing terms, reputation, automations and usage permissions. Licensing is handled by smart contracts, with built-in compliance tracking across on-chain and off-chain environments.

Creators can define how their work is used and remixed. Medilane generates optimized terms based on asset type, region, and use case. Enforcement is automated, and every transaction is logged for auditability.

MediaLane supports multiple types of creative works: music, posts, photos, video, code. AI agents can interact to trade, negotiate terms, and manage remix rights using our zero fees protocol.

Every creator has complete ownership over their assets, decentralized identity, and reputation systems. Licensing actions are transparent, traceable, and immutable. MediaLane is designed to serve creators, businesses, and AI agents — without intermediaries, without friction, and without compromise.

Open Dapp: 
https://medialane.xyz

Built on the Mediolano Protocol, MediaLane is empowering a new era of content creation and monetization, powered on Starknet.

Discover Mediolano:
https://mediolano.xyz




## Contributing

Ccontributions are **greatly appreciated**. If you have a feature or suggestion that would our plattform better, please fork the repo and create a pull request with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/Feature`)
3. Commit your Changes (`git commit -m 'Add some Feature'`)
4. Push to the Branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## Getting Started


### Running locally

Dapp requirements:
- Next.js 15
- React 19
- Node.js 18.18 or later.
- macOS, Windows (including WSL), and Linux are supported.

Clone the repository to your local machine:

```bash
git clone https://github.com/medialane-xyz/medialane-xyz.git
```
Install dependencies for Next.js 15 + React 19:

```bash
npm install --force
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


### Running via Docker

To run the containerized application, there is no dependencies requirement. 
Clone the repository, and run:

```bash
 docker build -t medialane-xyz .     
```

To build the image. Then, start the container:

```bash
docker run -p 8080:8080 medialane-xyz
```

### Quick Start with Paymaster

```bash
# 1. Clone and install
git clone https://github.com/medialane-xyz/medialane-xyz
cd mediolano-app
npm install

# 2. Configure environment
cp .env.example .env.local
# Add your AVNU Paymaster API key

# 3. Run the app
npm run dev

# 4. Visit /paymaster-demo to try it out!
```
