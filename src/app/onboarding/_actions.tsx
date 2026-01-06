'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'

interface WalletData {
  publicKey: string;
  encryptedPrivateKey: string;
}

export const completeOnboarding = async (walletData: WalletData) => {
  try {
    const { userId } = await auth()

    if (!userId) {
      return { error: 'No Logged In User' }
    }

    const client = await clerkClient()

    const res = await client.users.updateUser(userId, {
      publicMetadata: {
        walletCreated: true,
        publicKey: walletData.publicKey,
        encryptedPrivateKey: walletData.encryptedPrivateKey,
      },
    })

    return { success: true, metadata: res.publicMetadata }
  } catch (err) {
    console.error('Server: Error in complete Onboarding:', err)
    return { error: err instanceof Error ? err.message : 'There was an error updating the user metadata.' }
  }
}

export const getWalletData = async (): Promise<{
  publicKey: string;
  encryptedPrivateKey: string;
} | null> => {
  try {
    const { userId } = await auth()

    if (!userId) {
      console.error('No authenticated user found')
      return null
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    const { publicKey, encryptedPrivateKey, walletCreated } = user.publicMetadata as {
      publicKey?: string;
      encryptedPrivateKey?: string;
      walletCreated?: boolean;
    }

    if (!walletCreated || !publicKey || !encryptedPrivateKey) {
      console.error('Wallet not found or not created')
      return null
    }

    return {
      publicKey,
      encryptedPrivateKey,
    }
  } catch (err) {
    console.error('Error fetching wallet data:', err)
    return null
  }
}