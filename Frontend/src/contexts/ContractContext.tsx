import React, { createContext, useContext, useMemo } from 'react';
import { mockContractService } from '../services/contractService';
import type { ContractService } from '../types/contract';
import { CONFIG } from '../config/config';
import { getExplorerAddress, getExplorerTx } from '../utils/helpers';

interface ContractContextValue {
  contract: ContractService;
  ready: boolean;
  explorer: {
    tx: (hash: string) => string;
    address: (addr: string) => string;
  };
}

const ContractContext = createContext<ContractContextValue | undefined>(undefined);

export const ContractProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useMemo<ContractContextValue>(
    () => ({
      contract: mockContractService,
      ready: Boolean(CONFIG.CONTRACT_ADDRESS),
      explorer: { tx: getExplorerTx, address: getExplorerAddress },
    }),
    [],
  );

  return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>;
};

export const useContractContext = () => {
  const ctx = useContext(ContractContext);
  if (!ctx) throw new Error('useContractContext must be used within ContractProvider');
  return ctx;
};
