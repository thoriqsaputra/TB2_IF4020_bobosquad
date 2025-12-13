# API Contract - Sistem Pencatatan Ijazah Digital

## 1. Smart Contract Interface (Person 1)

### 1.1 Contract Events
```solidity
event CertificateIssued(
    uint256 indexed certificateId,
    bytes32 documentHash,
    string ipfsCid,
    address indexed issuer,
    uint256 timestamp
);

event CertificateRevoked(
    uint256 indexed certificateId,
    string reason,
    address indexed issuer,
    uint256 timestamp
);

event IssuerUpdated(
    address indexed oldIssuer,
    address indexed newIssuer,
    uint256 timestamp
);
```

### 1.2 Contract Functions

#### Issue Certificate
```solidity
function issueCertificate(
    bytes32 _documentHash,
    string memory _ipfsCid,
    bytes memory _signature
) external returns (uint256 certificateId)
```
**Input:**
- `_documentHash`: SHA-256 hash of unencrypted certificate (bytes32)
- `_ipfsCid`: IPFS CID or storage URL (string)
- `_signature`: ECDSA signature from issuer (bytes)

**Output:**
- `certificateId`: Unique ID for the certificate (uint256)

**Access:** Only issuer address

---

#### Revoke Certificate
```solidity
function revokeCertificate(
    uint256 _certificateId,
    string memory _reason,
    bytes memory _signature
) external
```
**Input:**
- `_certificateId`: ID of certificate to revoke (uint256)
- `_reason`: Reason for revocation (string)
- `_signature`: ECDSA signature from issuer (bytes)

**Output:** None (emits event)

**Access:** Only issuer address

---

#### Get Certificate
```solidity
function getCertificate(uint256 _certificateId) 
    external view returns (
        bytes32 documentHash,
        string memory ipfsCid,
        address issuer,
        uint256 timestamp,
        bool isRevoked,
        string memory revokeReason
    )
```
**Input:**
- `_certificateId`: Certificate ID (uint256)

**Output:**
- Certificate details struct

**Access:** Public (view function)

---

#### Verify Certificate
```solidity
function verifyCertificate(
    uint256 _certificateId,
    bytes32 _documentHash
) external view returns (bool isValid)
```
**Input:**
- `_certificateId`: Certificate ID (uint256)
- `_documentHash`: Hash to verify (bytes32)

**Output:**
- `isValid`: true if hash matches and not revoked (bool)

**Access:** Public (view function)

---

#### Update Issuer (BONUS)
```solidity
function updateIssuer(
    address _newIssuer,
    bytes memory _signature
) external
```
**Input:**
- `_newIssuer`: New issuer address (address)
- `_signature`: Signature from current issuer (bytes)

**Output:** None (emits event)

**Access:** Only current issuer

---

### 1.3 Data Structures
```solidity
struct Certificate {
    bytes32 documentHash;      // SHA-256 hash
    string ipfsCid;            // IPFS CID or URL
    address issuer;            // Issuer address
    uint256 timestamp;         // Issue timestamp
    bool isRevoked;            // Revocation status
    string revokeReason;       // Reason if revoked
}
```

---

## 2. Frontend API Interface (Person 2)

### 2.1 Wallet Authentication

#### Connect Wallet
```typescript
async function connectWallet(): Promise<{
    address: string;
    chainId: number;
}>
```
**Description:** Connect MetaMask/wallet using Web3 provider

**Output:**
- `address`: Connected wallet address
- `chainId`: Network chain ID

---

#### Sign Nonce Challenge
```typescript
async function signNonceChallenge(
    address: string,
    nonce: string
): Promise<string>
```
**Input:**
- `address`: Wallet address (string)
- `nonce`: Random nonce from backend (string)

**Output:**
- Signature (string)

---

### 2.2 Certificate Operations

#### Issue Certificate (Frontend)
```typescript
async function issueCertificate(params: {
    encryptedFileUrl: string;  // From Person 3
    documentHash: string;      // From Person 3
    aesKey: string;           // From Person 3
}): Promise<{
    certificateId: number;
    transactionHash: string;
    blockExplorerUrl: string;
}>
```
**Input:** Encrypted certificate data from crypto module

**Output:**
- Certificate ID and transaction details

**Process:**
1. Get signature from Person 3
2. Call smart contract `issueCertificate()`
3. Wait for transaction confirmation
4. Return certificate ID and TX hash

---

#### Revoke Certificate (Frontend)
```typescript
async function revokeCertificate(params: {
    certificateId: number;
    reason: string;
}): Promise<{
    transactionHash: string;
    blockExplorerUrl: string;
}>
```
**Input:**
- Certificate ID and revocation reason

**Output:**
- Transaction details

---

#### View Certificate (Frontend)
```typescript
async function viewCertificate(
    certificateId: number
): Promise<{
    ipfsCid: string;
    documentHash: string;
    issuer: string;
    timestamp: number;
    isRevoked: boolean;
    revokeReason?: string;
}>
```
**Input:**
- Certificate ID

**Output:**
- Certificate metadata from blockchain

---

#### Verify Certificate (Frontend)
```typescript
async function verifyCertificate(
    certificateId: number,
    documentHash: string
): Promise<{
    isValid: boolean;
    details: CertificateDetails;
}>
```
**Input:**
- Certificate ID and hash to verify

**Output:**
- Verification result and certificate details

---

### 2.3 Display Functions

#### Get Transaction List
```typescript
async function getTransactionList(): Promise<Transaction[]>
```
**Output:** Array of transactions from the contract

---

#### Get Block Explorer Link
```typescript
function getBlockExplorerUrl(
    txHash: string,
    type: 'tx' | 'address'
): string
```
**Input:**
- Transaction hash or address
- Type of link

**Output:**
- Etherscan/block explorer URL

---

## 3. Cryptography & Storage API (Person 3)

### 3.1 File Processing

#### Prepare Certificate for Upload
```typescript
async function prepareCertificate(params: {
    certificateFile: File;     // PDF/Image/Text
    studentData: {
        name: string;
        nim: string;
        birthPlace: string;
        birthDate: string;
        program: string;
        degree: string;
        issueDate: string;
    };
}): Promise<{
    encryptedFile: Blob;
    aesKey: string;           // Base64 encoded
    documentHash: string;      // SHA-256 hex string
    ipfsCid: string;          // Or storage URL
}>
```
**Process:**
1. Generate certificate file (PDF/Image/Text)
2. Calculate SHA-256 hash of **unencrypted** file
3. Generate random AES-256 key
4. Encrypt file with AES
5. Upload encrypted file to IPFS/storage
6. Return all metadata

**Output:**
- Encrypted file details for blockchain storage

---

#### Generate Certificate Signature
```typescript
async function generateCertificateSignature(params: {
    documentHash: string;
    ipfsCid: string;
    issuerPrivateKey: string;  // ECDSA private key
}): Promise<string>
```
**Input:**
- Certificate metadata
- Issuer's private key

**Output:**
- ECDSA signature (hex string)

**Note:** This creates the digital signature for the certificate

---

### 3.2 Certificate Retrieval

#### Download and Decrypt Certificate
```typescript
async function downloadCertificate(params: {
    ipfsCid: string;
    aesKey: string;
    certificateUrl?: string;   // Optional: URL to add to cert
}): Promise<{
    decryptedFile: Blob;
    mimeType: string;
}>
```
**Input:**
- IPFS CID and AES key (from certificate URL)
- Optional: certificate URL to embed

**Process:**
1. Download encrypted file from IPFS/storage
2. Decrypt using AES key
3. Optionally add certificate URL to document
4. Return decrypted file

**Output:**
- Decrypted certificate file ready for display/download

---

#### Verify Document Hash
```typescript
async function verifyDocumentHash(
    file: File | Blob,
    expectedHash: string
): Promise<boolean>
```
**Input:**
- Certificate file
- Expected SHA-256 hash

**Output:**
- Boolean indicating if hash matches

---

### 3.3 Key Management

#### Generate Issuer Keys (Setup Only)
```typescript
async function generateIssuerKeys(): Promise<{
    privateKey: string;
    publicKey: string;
    address: string;
}>
```
**Output:**
- ECDSA key pair for issuer

**Note:** Used once during system setup. Private key must be stored securely (can be hardcoded for this project).

---

### 3.4 Storage Interface

#### Upload to Storage
```typescript
async function uploadToStorage(
    encryptedFile: Blob
): Promise<{
    url: string;        // IPFS CID or cloud URL
    size: number;       // File size in bytes
}>
```
**Input:**
- Encrypted file blob

**Output:**
- Storage URL/CID and metadata

**Supported Storage:**
- IPFS
- Cloud storage (AWS S3, etc.)
- Local server storage

---

## 4. Integration Flow Examples

### 4.1 Issue Certificate Flow
```
Person 2 (Frontend) → Person 3 (Crypto) → Person 2 (Frontend) → Person 1 (Blockchain)

1. Frontend: User fills certificate form
2. Frontend → Crypto: prepareCertificate(certificateData)
3. Crypto: 
   - Generate certificate file
   - Hash document (SHA-256)
   - Encrypt with AES
   - Upload to IPFS
   - Return: {encryptedFileUrl, aesKey, documentHash, ipfsCid}
4. Crypto → Frontend: generateCertificateSignature(documentHash, ipfsCid)
5. Frontend → Blockchain: issueCertificate(hash, cid, signature)
6. Blockchain: Store metadata on-chain
7. Blockchain → Frontend: Return certificateId
8. Frontend: Display success + certificate URL
```

---

### 4.2 View Certificate Flow
```
Person 2 (Frontend) → Person 1 (Blockchain) → Person 3 (Crypto) → Person 2 (Display)

1. Frontend: User opens certificate URL with params:
   - certificateId
   - ipfsCid
   - aesKey
2. Frontend → Blockchain: getCertificate(certificateId)
3. Blockchain → Frontend: Return metadata
4. Frontend → Crypto: downloadCertificate(ipfsCid, aesKey)
5. Crypto:
   - Download encrypted file
   - Decrypt with AES
   - Add certificate URL to document
   - Return decrypted file
6. Frontend: Display certificate + verification status
```

---

### 4.3 Verify Certificate Flow
```
Person 2 (Frontend) → Person 1 (Blockchain) → Person 3 (Crypto)

1. Frontend: User provides certificateId
2. Frontend → Blockchain: getCertificate(certificateId)
3. Blockchain → Frontend: Return stored hash + metadata
4. Frontend → Crypto: downloadCertificate() to get file
5. Crypto → Frontend: verifyDocumentHash(file, storedHash)
6. Frontend: Display verification result
```

---

## 5. Certificate URL Format

### URL Structure
```
https://yourapp.com/certificate?id={certificateId}&cid={ipfsCid}&key={aesKey}&tx={txHash}
```

**Parameters:**
- `id`: Certificate ID from blockchain (uint256)
- `cid`: IPFS CID or storage URL (string)
- `key`: Base64-encoded AES key (string)
- `tx`: Transaction hash for blockchain explorer (string)

**Example:**
```
https://yourapp.com/certificate?id=1&cid=QmX...&key=dGVzdGtleQ==&tx=0xabc123...
```

---

## 6. Error Handling Contract

### Common Error Codes
```typescript
enum ErrorCode {
    // Wallet/Auth (Person 2)
    WALLET_NOT_CONNECTED = 'E001',
    INVALID_SIGNATURE = 'E002',
    WRONG_NETWORK = 'E003',
    
    // Blockchain (Person 1)
    CONTRACT_ERROR = 'E101',
    UNAUTHORIZED = 'E102',
    CERTIFICATE_NOT_FOUND = 'E103',
    ALREADY_REVOKED = 'E104',
    
    // Crypto/Storage (Person 3)
    ENCRYPTION_FAILED = 'E201',
    DECRYPTION_FAILED = 'E202',
    HASH_MISMATCH = 'E203',
    UPLOAD_FAILED = 'E204',
    DOWNLOAD_FAILED = 'E205',
}
```

### Error Response Format
```typescript
interface ErrorResponse {
    code: ErrorCode;
    message: string;
    details?: any;
}
```

---

## 7. Environment Configuration

### Shared Constants
```typescript
// Network Configuration
export const NETWORK_CONFIG = {
    chainId: 11155111,  // Sepolia testnet
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
    blockExplorer: 'https://sepolia.etherscan.io'
};

// Contract Address (deployed by Person 1)
export const CONTRACT_ADDRESS = '0x...'; // To be filled after deployment

// Storage Configuration (Person 3)
export const STORAGE_CONFIG = {
    ipfsGateway: 'https://ipfs.io/ipfs/',
    // Or alternative storage URL
};

// Issuer Configuration
export const ISSUER_CONFIG = {
    address: '0x...', // Issuer wallet address
    // Note: Private key stored securely by Person 3
};
```

---

## 8. Testing Checklist

### Person 1 (Smart Contract)
- [ ] Deploy contract to testnet
- [ ] Verify contract on block explorer
- [ ] Test issueCertificate with dummy data
- [ ] Test revokeCertificate
- [ ] Test getCertificate and verifyCertificate
- [ ] Provide contract ABI to Person 2

### Person 2 (Frontend)
- [ ] Wallet connection works
- [ ] Can call all contract functions
- [ ] Display transaction list
- [ ] Show block explorer links
- [ ] Error handling for failed transactions
- [ ] Loading states for async operations

### Person 3 (Crypto)
- [ ] PDF/Image generation works
- [ ] SHA-256 hashing correct
- [ ] AES encryption/decryption works
- [ ] IPFS upload successful
- [ ] Certificate URL embedding works
- [ ] Signature generation valid

### Integration Tests
- [ ] Complete issue certificate flow
- [ ] Complete view certificate flow
- [ ] Complete verify certificate flow
- [ ] Complete revoke certificate flow
- [ ] Test with different file formats (PDF, Image, Text)

---

## 9. Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                    ISSUE FLOW                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frontend (P2)                                      │
│       │                                             │
│       ├─► prepareCertificate()                      │
│       │        │                                    │
│       │        ▼                                    │
│       │   Crypto (P3)                               │
│       │        │                                    │
│       │        ├─► Generate PDF                     │
│       │        ├─► Hash (SHA-256)                   │
│       │        ├─► Encrypt (AES)                    │
│       │        ├─► Upload to IPFS                   │
│       │        └─► Return metadata                  │
│       │                                             │
│       ├─► generateSignature()                       │
│       │        │                                    │
│       │        ▼                                    │
│       │   Crypto (P3)                               │
│       │        └─► ECDSA sign                       │
│       │                                             │
│       ├─► issueCertificate()                        │
│       │        │                                    │
│       │        ▼                                    │
│       │   Blockchain (P1)                           │
│       │        ├─► Verify signature                 │
│       │        ├─► Store metadata                   │
│       │        └─► Emit event                       │
│       │                                             │
│       └─► Display certificate URL                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 10. Deliverables per Person

### Person 1 (Smart Contract)
- [ ] Solidity smart contract
- [ ] Deployment script
- [ ] Contract ABI JSON file
- [ ] Deployed contract address
- [ ] Block explorer verification link
- [ ] README with contract functions

### Person 2 (Frontend)
- [ ] Web application UI
- [ ] Wallet integration
- [ ] Certificate upload page
- [ ] Certificate view page
- [ ] Verification page
- [ ] Transaction list page
- [ ] README with setup instructions

### Person 3 (Crypto & Storage)
- [ ] Certificate generation module
- [ ] Encryption/decryption module
- [ ] Hash verification module
- [ ] IPFS/storage integration
- [ ] Signature generation module
- [ ] README with API documentation

---

## Notes

1. **Security:** Never store private keys in frontend code or git repository
2. **Gas Optimization:** Person 1 should optimize contract for gas costs
3. **Error Handling:** All async operations must have try-catch blocks
4. **Testing:** Use Sepolia testnet ETH (free from faucet)
5. **Documentation:** Each person should document their module's API
6. **Version Control:** Use separate branches for each person's work
7. **Code Review:** Review integration points before final merge