import React, { useMemo, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import type { ContractTransaction } from '../../types/contract';
import { Button } from '../common/Button';
import { TX_STATUS_STYLES } from '../../utils/constants';
import { formatTimestamp } from '../../utils/helpers';

interface Props {
  transactions: ContractTransaction[];
  loading?: boolean;
  onRefresh?: () => void;
}

export const TransactionList: React.FC<Props> = ({ transactions, loading, onRefresh }) => {
  const [filter, setFilter] = useState<'ALL' | 'ISSUE' | 'REVOKE'>('ALL');

  const filtered = useMemo(
    () => (filter === 'ALL' ? transactions : transactions.filter((t) => t.type === filter)),
    [transactions, filter],
  );

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
          <p className="text-sm text-gray-600">Recent issue and revoke operations.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-gray-50 p-1">
            {(['ALL', 'ISSUE', 'REVOKE'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`rounded-md px-3 py-1 text-xs font-semibold ${
                  filter === type ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {onRefresh && (
            <Button variant="ghost" onClick={onRefresh} loading={loading}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          )}
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">Tx Hash</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">Type</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">Certificate ID</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">Timestamp</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((tx) => (
              <tr key={tx.txHash} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <a href={tx.blockExplorerUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                    {tx.txHash.slice(0, 10)}...
                  </a>
                </td>
                <td className="px-3 py-2 font-semibold text-gray-800">{tx.type}</td>
                <td className="px-3 py-2">#{tx.certificateId}</td>
                <td className="px-3 py-2 text-gray-600">{formatTimestamp(tx.timestamp)}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TX_STATUS_STYLES[tx.status]}`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-gray-500" colSpan={5}>
                  {loading ? 'Loading transactions...' : 'No transactions yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
        PLACEHOLDER: replace mock transaction feed with Person 1 contract events.
      </div>
    </div>
  );
};
