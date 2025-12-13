import React, { useEffect } from 'react';
import { TransactionList } from '../components/transaction/TransactionList';
import { useCertificate } from '../hooks/useCertificate';

export const Transactions: React.FC = () => {
  const { transactions, loadTransactions, txLoading } = useCertificate();

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <TransactionList transactions={transactions} loading={txLoading} onRefresh={loadTransactions} />
    </div>
  );
};
