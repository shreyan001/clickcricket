'use client';

import React, { ReactNode } from 'react';
import { config, projectId, siweConfig, metadata } from './siwe';

import { createWeb3Modal } from '@web3modal/wagmi/react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { State,WagmiProvider } from 'wagmi';

// Setup queryClient
const queryClient = new QueryClient();

if (!projectId) throw new Error('Project ID is not defined');

// Create modal
createWeb3Modal({
  metadata: metadata,
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true, // Optional - false as default
  siweConfig,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-font-family': 'monospace, sans-serif',
    '--w3m-accent': '#FFC700',
    '--w3m-color-mix': '#FFC700',
    '--w3m-color-mix-strength': 3,
    '--w3m-border-radius-master': '0px',
    '--w3m-z-index': 999
  }
});

export default function Web3ModalProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}