import { w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { configureChains, createClient } from 'wagmi';
import { goerli, sepolia } from 'wagmi/chains';

import { CHAINS, PROJECT_ID } from 'constants/walletConnect';

const { provider } = configureChains<typeof goerli | typeof sepolia>(CHAINS, [
  w3mProvider({ projectId: PROJECT_ID }),
]);

export const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ chains: CHAINS, projectId: PROJECT_ID }),
  provider,
});
