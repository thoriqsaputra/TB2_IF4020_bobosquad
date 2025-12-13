import { useContractContext } from '../contexts/ContractContext';

export const useContract = () => {
  const ctx = useContractContext();
  return ctx;
};
