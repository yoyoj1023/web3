import { Alchemy, Network, Wallet, Utils } from 'alchemy-sdk';
import dotenv from 'dotenv';
dotenv.config();

const TEST_API_KEY = process.env.OP_SEPOLIA_RPC_API_KEY as string;
const TEST_PRIVATE_KEY = process.env.PRIVATE_KEY as string;

const settings = {
  apiKey: TEST_API_KEY,
  network: Network.OPT_SEPOLIA,
};
const alchemy = new Alchemy(settings);

const wallet = new Wallet(TEST_PRIVATE_KEY);

async function main(): Promise<void> {
  const nonce = await alchemy.core.getTransactionCount(
    wallet.address,
    'latest'
  );

  const transaction = {
    to: "0xd7d47A0896167c80b47F95d82631998d964CD23d", // 示例地址
    value: Utils.parseEther('0.001'), // 0.001 worth of ETH being sent
    gasLimit: '21000',
    maxPriorityFeePerGas: Utils.parseUnits('5', 'gwei'),
    maxFeePerGas: Utils.parseUnits('20', 'gwei'),
    nonce: nonce,
    type: 2,
    chainId: 11155420, // OP sepolia transaction
  };

  const rawTransaction = await wallet.signTransaction(transaction);
  console.log('Raw tx: ', rawTransaction);
  const tx = await alchemy.core.sendTransaction(rawTransaction);
  console.log(`https://sepolia-optimistic.etherscan.io/tx/${tx.hash}`);
}

main();