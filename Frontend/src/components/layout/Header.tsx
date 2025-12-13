import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Shield, Wallet } from 'lucide-react';
import { Button } from '../common/Button';
import { useWallet } from '../../hooks/useWallet';
import { truncateAddress } from '../../utils/helpers';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${
    isActive ? 'text-primary bg-blue-50' : 'text-gray-700 hover:text-primary'
  }`;

export const Header: React.FC = () => {
  const { address, connect, disconnect, isConnecting, isIssuer, isConnected, isCorrectNetwork } = useWallet();
  const [open, setOpen] = useState(false);

  const walletButton = isConnected ? (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm">
      <Wallet className="h-4 w-4 text-primary" />
      <span>{truncateAddress(address || '')}</span>
      <button className="text-xs text-gray-500 hover:text-red-500" onClick={disconnect}>
        Disconnect
      </button>
    </div>
  ) : (
    <Button onClick={connect} loading={isConnecting} variant="secondary">
      Connect Wallet
    </Button>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3 text-lg font-bold text-gray-900">
          <Shield className="h-6 w-6 text-primary" />
          <span>CertiChain</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          {isIssuer && (
            <>
              <NavLink to="/issue" className={navLinkClass}>
                Issue
              </NavLink>
              <NavLink to="/revoke" className={navLinkClass}>
                Revoke
              </NavLink>
            </>
          )}
          <NavLink to="/verify" className={navLinkClass}>
            Verify
          </NavLink>
          <NavLink to="/transactions" className={navLinkClass}>
            Transactions
          </NavLink>
        </nav>
        <div className="hidden md:block">
          {!isCorrectNetwork && isConnected ? <span className="text-xs text-red-500">Wrong network</span> : walletButton}
        </div>
        <button className="md:hidden" onClick={() => setOpen((s) => !s)} aria-label="Toggle menu">
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
      </div>
      {open && (
        <div className="md:hidden">
          <div className="mx-4 mb-4 flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-4 shadow-lg">
            <NavLink to="/" className={navLinkClass} onClick={() => setOpen(false)}>
              Home
            </NavLink>
            {isIssuer && (
              <>
                <NavLink to="/issue" className={navLinkClass} onClick={() => setOpen(false)}>
                  Issue
                </NavLink>
                <NavLink to="/revoke" className={navLinkClass} onClick={() => setOpen(false)}>
                  Revoke
                </NavLink>
              </>
            )}
            <NavLink to="/verify" className={navLinkClass} onClick={() => setOpen(false)}>
              Verify
            </NavLink>
            <NavLink to="/transactions" className={navLinkClass} onClick={() => setOpen(false)}>
              Transactions
            </NavLink>
            <div className="pt-2">{walletButton}</div>
            {!isCorrectNetwork && isConnected && <div className="text-xs text-red-500">Wrong network</div>}
          </div>
        </div>
      )}
    </header>
  );
};
