export interface AssetIP {
  id: string;
  slug: string;
  title: string;
  author: string;
  description: string;
  type: string;
  template: string;
  collection: string;
  collectionSlug?: string;
  tags: string;
  mediaUrl: string;
  externalUrl: string;
  licenseType: string;
  licenseDetails: string;
  ipVersion: string;
  commercialUse: boolean;
  modifications: boolean;
  attribution: boolean;
  registrationDate: string;
  protectionStatus: string;
  protectionScope: string;
  protectionDuration: string;
  // Additional metadata
  creator: {
    id: string;
    username: string;
    name: string;
    avatar: string;
    verified: boolean;
    wallet: string;
    bio?: string;
    followers?: number;
    following?: number;
    assets?: number;
  };
  timestamp: string;
  attributes?: Array<{ trait_type: string; value: string }>;
  blockchain: string;
  contractAddress?: string;
  tokenId?: string;
  metadataUri?: string;
  fileSize?: string;
  fileDimensions?: string;
  fileFormat?: string;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  coverImage: string;
  bannerImage?: string;
  creator: {
    id: string;
    username: string;
    name: string;
    avatar: string;
    verified: boolean;
    wallet: string;
  };
  assets: number;
  views?: number;
  likes?: number;
  floorPrice?: string;
  totalVolume?: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  tags: string;
  isPublic: boolean;
  isFeatured: boolean;
  blockchain: string;
  contractAddress?: string;
  // IPFS/contract metadata fields
  externalUrl?: string
  sellerFeeBasisPoints?: number
  feeRecipient?: string
  attributes?: Array<{ trait_type: string; value: string }>
  type?: string
  visibility?: string
  requireApproval?: boolean
}

export interface Creator {
  id: string;
  username: string;
  name: string;
  avatar: string;
  banner?: string;
  verified: boolean;
  wallet: string;
  bio: string;
  location?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  followers: number;
  following: number;
  assets: number;
  collections?: number;
  joined: string;
  specialties?: string[];
  achievements?: string[];
}

export interface Activity {
  id: string;
  type:
    | "mint"
    | "transfer_in"
    | "transfer_out"
    | "sale"
    | "license"
    | "update"
    | "collection_create"
    | "collection_add";
  title: string;
  description: string;
  timestamp: string;
  network: string;
  status: "completed" | "pending" | "failed";
  value?: string;
  txHash?: string;
  assetId?: string;
  collectionId?: string;
  fromAddress?: string;
  toAddress?: string;
}

export interface TokenBalance {
  contractAddress: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  balanceFormatted: string;
  type: "ERC20";
}

export interface TokenBalanceERC721 {
  contractAddress: string;
  nftBalance: number | any;
  newNftBalance: any;
  type: "ERC721";
}

export interface NFTAsset {
  contractAddress: string;
  tokenId: string;
  tokenURI?: string;
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
    attributes?: Array<{ trait_type: string; value: string }>;
  };
  type: "ERC721";
}

export interface WalletAssets {
  tokens: TokenBalance[];
  nfts: NFTAsset[];
  totalValueUSD?: number;
}

export interface Metadata {
  name: string;
  description: string;
  external_url: string;
  image: string;
  attributes: Attribute[];
}

export interface Attribute {
  trait_type: string;
  value?: boolean | number | string;
}

export interface IPortfolioReturnType {
  data: IPortfolioReturnTypeObj[] | null;
  meta: any;
}

export interface IPortfolioReturnTypeObj {
  contractAddress: string;
  tokenId: string;
  tokenURI: string;
  metadata: Metadata;
  type: string;
}

export interface AssetData {
  // Essential fields
  title: string;
  description: string;
  mediaUrl: string;
  externalUrl: string;

  // Advanced fields with defaults
  type: string;
  tags: string[];
  author: string;
  collection: string;
  licenseType: string;
  licenseDetails: string;
  ipVersion: string;
  commercialUse: boolean;
  modifications: boolean;
  attribution: boolean;
  registrationDate: string;
  protectionStatus: string;
  protectionScope: string;
  protectionDuration: string;
}
