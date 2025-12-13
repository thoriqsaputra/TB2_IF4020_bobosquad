# Integration Guide

How to replace the mocked services with real implementations from Person 1 (smart contract) and Person 3 (crypto/storage).

## 1) Configuration
- Set `CONTRACT_ADDRESS`, `ISSUER_ADDRESS`, and network endpoints in `src/config/config.ts`.
- Add your Infura/Alchemy RPC key if required.
- Keep `SUPPORTED_FILE_TYPES` and `MAX_FILE_SIZE` aligned with backend limits.

## 2) Smart Contract (Person 1)
- Provide ABI JSON and deployed address.
- In `services/contractService.ts`, replace `mockContractService` with a real implementation using ethers v6:
  - Initialize `BrowserProvider` and `Contract` with signer.
  - Methods to map directly:
    - `issueCertificate(bytes32 documentHash, string ipfsCid, bytes signature)` → returns `certificateId`
    - `revokeCertificate(uint256 certificateId, string reason, bytes signature)`
    - `getCertificate(uint256 certificateId)` → returns `{ documentHash, ipfsCid, issuer, timestamp, isRevoked, revokeReason }`
    - `verifyCertificate(uint256 certificateId, bytes32 documentHash)` → returns `bool`
    - Events `CertificateIssued` / `CertificateRevoked` → hydrate `getTransactionList()`
- Wire the concrete service in `ContractProvider`:
  ```ts
  import { realContractService } from './services/contractService';
  // ...
  contract: realContractService,
  ```

## 3) Crypto/Storage (Person 3)
- In `services/cryptoService.ts`, replace `mockCryptoService` with calls to:
  - `prepareCertificate({ certificateFile, studentData })` → returns `{ encryptedFile, aesKey, documentHash, ipfsCid }`
  - `generateCertificateSignature({ documentHash, ipfsCid, issuerPrivateKey })` → returns hex signature
  - `downloadCertificate({ ipfsCid, aesKey, certificateUrl? })` → returns `{ decryptedFile, mimeType }`
  - `verifyDocumentHash(file, expectedHash)` → boolean
- Ensure AES key/base64 and SHA-256 hash outputs match contract expectations (bytes32 hex).

## 4) Wiring the Flows (UI)
- Issue flow (see `CertificateForm` + `useCertificate.issueCertificate`):
  1) `prepareCertificate` (P3) → metadata
  2) `generateCertificateSignature` (P3) → signature
  3) `issueCertificate` (P1) → tx + certificateId
  4) Build URL `.../certificate?id={id}&cid={ipfsCid}&key={aesKey}&tx={txHash}`
- Revoke flow (`RevocationForm`):
  - Sign with issuer key (P3), call `revokeCertificate` (P1), show tx hash.
- View flow (`ViewCertificate`):
  - `getCertificate` (P1), `downloadCertificate` (P3) with `cid` + `key`, render via `CertificateViewer`.
- Verify flow (`VerifyCertificate`):
  - `getCertificate` (P1) to fetch `documentHash`
  - `verifyDocumentHash` (P3) on uploaded file against `documentHash`
  - Optional on-chain `verifyCertificate` (P1) for cross-check.
- Transactions (`TransactionList`):
  - Replace mock list with event queries or indexed history from the contract.

## 5) Error Handling
- Map contract/storage errors to `ErrorCode` enum in `src/utils/errors.ts`.
- Show user-friendly messages in UI components (ErrorMessage, banners).

## 6) Testing Checklist
- Wallet connect/disconnect + Sepolia network guard.
- Issue flow completes with real tx + explorer link.
- Revoke flow updates status on-chain.
- View flow decrypts and displays PDFs/images/text.
- Verify flow detects mismatched hashes and revoked certificates.
- Transactions list shows live data (filters, explorer links).
