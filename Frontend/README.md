# CertiChain Frontend (Person 2)

React + TypeScript + Vite + Tailwind UI for the blockchain-based certificate system. MetaMask wallet integration, placeholder services for Person 1 (smart contract) and Person 3 (crypto/storage) with mock data to keep flows working during development.

## Project Structure
```
src/
  components/      // UI atoms/molecules (layout, wallet, certificate, transaction)
  contexts/        // Wallet + contract providers
  hooks/           // useWallet, useContract, useCertificate
  services/        // web3 wrapper, mock contract/crypto services
  types/           // shared TypeScript interfaces
  utils/           // helpers, validation, errors, constants
  config/          // network + contract config
  pages/           // routed views
  App.tsx          // router + providers
  main.tsx         // bootstraps React
```

## Configuration
Edit `src/config/config.ts`:
- `NETWORK`: chainId, chainName, rpcUrl, blockExplorer (defaults to Sepolia)
- `CONTRACT_ADDRESS`: deployed contract (from Person 1)
- `ISSUER_ADDRESS`: admin wallet allowed to issue/revoke
- `SUPPORTED_FILE_TYPES`, `MAX_FILE_SIZE`: upload guardrails

## Component Reference (key components)
- Layout: `components/layout/Layout`, `Header`, `Footer`
- Wallet: `WalletConnect` (connect/disconnect, network warning), `WalletInfo`
- Common: `Button`, `Input`, `TextArea`, `FileUpload`, `Modal`, `ProgressSteps`, `LoadingSpinner`, `ErrorMessage`
- Certificate: `CertificateForm` (issue flow with progress + QR), `RevocationForm` (preview + confirm), `CertificateCard` (metadata/status), `CertificateViewer`, `VerificationResult`
- Transactions: `TransactionList` (filters + explorer links)

## User Guide
1. **Connect wallet**: Click "Connect Wallet" (MetaMask). If wrong network, use "Switch Network" to go to Sepolia.
2. **Issue certificate (issuer only)**: Go to Issue, fill student info, upload file, submit. Progress steps show status. Success view shows ID, tx hash, shareable URL, and QR.
3. **View certificate**: Open link like `/certificate?id={id}&cid={cid}&key={key}&tx={tx}` or `/certificate/{id}` with query params. Metadata + decrypted file preview (mock).
4. **Verify certificate**: Enter certificate ID and upload file; on-chain verify + mock hash check return status.
5. **Revoke certificate (issuer only)**: Enter ID and reason, preview metadata, confirm revocation.
6. **Transactions**: Browse issue/revoke transactions with explorer links.

## Placeholder Integration Notes
- Person 1 contract calls are mocked in `services/contractService.ts` and wired via `ContractProvider`. Replace with real ethers.js contract calls + ABI.
- Person 3 crypto/storage calls are mocked in `services/cryptoService.ts`. Replace with real hashing/encryption/upload/decrypt functions.
- All placeholder sections in UI are marked with comments/banners for clarity.

## Testing
- Mock flows run without blockchain/crypto dependencies.
- When integrating real services, add unit tests or Cypress/e2e as needed and extend `npm run lint`/CI accordingly.
