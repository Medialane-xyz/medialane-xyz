import PortfolioView from "@/src/components/portfolio";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mint Portfolio",
  description: "Check your minted assets onchain",
  alternates: {
    canonical: "/mint/portfolio",
  },
};

export default function page() {
  return <PortfolioView />;
}
