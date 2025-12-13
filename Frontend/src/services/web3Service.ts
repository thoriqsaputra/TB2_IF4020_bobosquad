import { BrowserProvider } from 'ethers';
import { CONFIG } from '../config/config';

export const getBrowserProvider = async () => {
  if (!(window as any).ethereum) {
    throw new Error('MetaMask not found');
  }
  return new BrowserProvider((window as any).ethereum);
};

export const getNetworkStatus = async () => {
  const provider = await getBrowserProvider();
  const network = await provider.getNetwork();
  return { chainId: Number(network.chainId) };
};

export const switchToSupportedNetwork = async () => {
  const provider = (window as any).ethereum;
  if (!provider) throw new Error('MetaMask not found');
  const hexChainId = `0x${CONFIG.NETWORK.chainId.toString(16)}`;
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    });
  } catch (err: any) {
    if (err?.code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: hexChainId,
            chainName: CONFIG.NETWORK.chainName,
            rpcUrls: [CONFIG.NETWORK.rpcUrl],
            nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
            blockExplorerUrls: [CONFIG.NETWORK.blockExplorer],
          },
        ],
      });
    } else {
      throw err;
    }
  }
};
