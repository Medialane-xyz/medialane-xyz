import PortfolioView from "@/src/components/portfolio";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Portfolio",
  description: "Manage your MediaLane assets and collections",
};

export default function page() {
  return <PortfolioView />;
}
