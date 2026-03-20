import { generateWallet } from '@stacks/wallet-sdk';

export async function getOraclePrivateKey(): Promise<string> {
  const keyOrMnemonic = process.env.ORACLE_PRIVATE_KEY;
  
  if (!keyOrMnemonic) {
    throw new Error('ORACLE_PRIVATE_KEY not configured');
  }

  if (!keyOrMnemonic.includes(' ')) {
    return keyOrMnemonic;
  }

  const wallet = await generateWallet({
    secretKey: keyOrMnemonic,
    password: '',
  });

  return wallet.accounts[0].stxPrivateKey;
}
