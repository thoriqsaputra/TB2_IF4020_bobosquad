import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { WalletProvider } from './contexts/WalletContext';
import { ContractProvider } from './contexts/ContractContext';
import { Home } from './pages/Home';
import { IssueCertificate } from './pages/IssueCertificate';
import { RevokeCertificate } from './pages/RevokeCertificate';
import { ViewCertificate } from './pages/ViewCertificate';
import { VerifyCertificate } from './pages/VerifyCertificate';
import { Transactions } from './pages/Transactions';
import { NotFound } from './pages/NotFound';

const App: React.FC = () => (
  <WalletProvider>
    <ContractProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/issue" element={<IssueCertificate />} />
          <Route path="/revoke" element={<RevokeCertificate />} />
          <Route path="/certificate/:id" element={<ViewCertificate />} />
          <Route path="/certificate" element={<ViewCertificate />} />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </ContractProvider>
  </WalletProvider>
);

export default App;
