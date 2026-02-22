import MintEventAsset from "@/src/components/assets/mint-event-asset";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Featured Mint Drop",
  description: "Frictionless NFT mint with Starknet, ChipiPay and Medialane",
  alternates: {
    canonical: "/mint",
  },
};

export default function page() {
  return <MintEventAsset />;
}
