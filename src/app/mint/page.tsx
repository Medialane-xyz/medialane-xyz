import MintEventAsset from "@/src/components/assets/mint-event-asset";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mint",
  description: "Frictionless NFT mint with Starknet, ChipiPay and Medialane",
  alternates: {
    canonical: "/mint",
  },
};

export default function page() {
  return <MintEventAsset />;
}
