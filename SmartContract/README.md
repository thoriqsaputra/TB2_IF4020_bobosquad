# CertificateRegistry Smart Contract Documentation

## Overview

CertificateRegistry is a decentralized digital certificate management system built on Ethereum. It allows issuers to create, revoke, and verify digital certificates with cryptographic signatures.

## Contract Information

- **Contract Name**: CertificateRegistry
- **Solidity Version**: 0.8.20
- **License**: MIT
- **Network**: Sepolia Testnet

## Features

- ✅ Issue digital certificates with IPFS storage
- ✅ Revoke certificates with reason tracking
- ✅ Verify certificate authenticity
- ✅ Cryptographic signature verification
- ✅ Access control with issuer management
- ✅ Gas-efficient custom errors
- ✅ Event emission for transparency

## Contract Functions

### Core Functions

#### `issueCertificate(bytes32 documentHash, string ipfsCid, bytes signature)`

Issues a new digital certificate.

- **Parameters**:
  - `documentHash`: SHA-256 hash of the certificate document
  - `ipfsCid`: IPFS content identifier for certificate storage
  - `signature`: ECDSA signature from authorized issuer
- **Returns**: `uint256 certificateId`
- **Emits**: `CertificateIssued` event
- **Access**: Only current issuer

#### `revokeCertificate(uint256 certificateId, string reason, bytes signature)`

Revokes an existing certificate.

- **Parameters**:
  - `certificateId`: ID of certificate to revoke
  - `reason`: Reason for revocation
  - `signature`: ECDSA signature from authorized issuer
- **Emits**: `CertificateRevoked` event
- **Access**: Only current issuer

#### `verifyCertificate(uint256 certificateId, bytes32 documentHash)`

Verifies if a certificate is valid and matches the provided document hash.

- **Parameters**:
  - `certificateId`: ID of certificate to verify
  - `documentHash`: Document hash to verify against
- **Returns**: `bool isValid` (true if valid and not revoked)
- **Access**: Public

#### `getCertificate(uint256 certificateId)`

Retrieves complete certificate information.

- **Parameters**:
  - `certificateId`: ID of certificate to retrieve
- **Returns**:
  - `documentHash`: SHA-256 hash of document
  - `ipfsCid`: IPFS content identifier
  - `issuerAddress`: Address of certificate issuer
  - `timestamp`: Unix timestamp of issuance
  - `isRevoked`: Revocation status
  - `revokeReason`: Reason for revocation (if applicable)
- **Access**: Public

### Administrative Functions

#### `updateIssuer(address newIssuer, bytes signature)`

Updates the authorized issuer address.

- **Parameters**:
  - `newIssuer`: New issuer address
  - `signature`: ECDSA signature from current issuer
- **Emits**: `IssuerUpdated` event
- **Access**: Only current issuer

#### `isIssuer()`

Checks if the caller is the current issuer.

- **Returns**: `bool` (true if caller is issuer)
- **Access**: Public

#### `getCertificateCount()`

Returns the total number of certificates issued.

- **Returns**: `uint256` count
- **Access**: Public

## Custom Errors

- `InvalidInput()`: Invalid input parameters (empty IPFS CID or zero hash)
- `InvalidSignature()`: Invalid or unauthorized signature
- `InvalidCertificateId()`: Invalid certificate ID
- `CertificateAlreadyRevoked()`: Certificate is already revoked
- `Unauthorized()`: Caller is not authorized for the action

## Events

### `CertificateIssued`

Emitted when a new certificate is issued.

```solidity
event CertificateIssued(
    uint256 indexed certificateId,
    bytes32 documentHash,
    string ipfsCid,
    address indexed issuer,
    uint256 timestamp
);
```

### `CertificateRevoked`

Emitted when a certificate is revoked.

```solidity
event CertificateRevoked(
    uint256 indexed certificateId,
    string reason,
    address indexed issuer,
    uint256 timestamp
);
```

### `IssuerUpdated`

Emitted when the issuer is updated.

```solidity
event IssuerUpdated(
    address indexed oldIssuer,
    address indexed newIssuer,
    uint256 timestamp
);
```

## Data Structures

### Certificate Struct

```solidity
struct Certificate {
    bytes32 documentHash;    // SHA-256 hash of document
    string ipfsCid;          // IPFS content identifier
    address issuer;          // Address of issuer
    uint256 timestamp;       // Unix timestamp
    bool isRevoked;          // Revocation status
    string revokeReason;     // Revocation reason
}
```

## Security Features

1. **Signature Verification**: All critical operations require ECDSA signatures
2. **Access Control**: Only authorized issuer can issue/revoke certificates
3. **Immutable Records**: Once issued, certificate data cannot be modified
4. **Revocation Tracking**: Complete audit trail of revocations
5. **Input Validation**: Comprehensive input parameter validation

## Gas Optimization

- Custom errors instead of require statements
- Efficient data packing in structs
- Minimal storage operations
- Optimized function modifiers

## Deployment

### Prerequisites

- Node.js v16+
- Hardhat framework
- Sepolia testnet RPC endpoint
- Private key with Sepolia ETH

### Environment Setup

```bash
# Install dependencies
npm install

# Set environment variables
export PRIVATE_KEY="your_private_key"
export INFURA_KEY="your_infura_project_id"
```

### Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Local Testing

```bash
npx hardhat test
```

## Usage Examples

### Issue a Certificate

```javascript
// Create message hash
const messageHash = ethers.keccak256(
  ethers.solidityPacked(["bytes32", "string"], [documentHash, ipfsCid])
);

// Sign message hash
const signature = await signer.signMessage(ethers.getBytes(messageHash));

// Issue certificate
const tx = await contract.issueCertificate(documentHash, ipfsCid, signature);
```

### Verify a Certificate

```javascript
// Verify certificate validity
const isValid = await contract.verifyCertificate(certificateId, documentHash);
console.log("Certificate valid:", isValid);

// Get certificate details
const cert = await contract.getCertificate(certificateId);
console.log("Certificate details:", cert);
```

### Revoke a Certificate

```javascript
// Create revoke message hash
const revokeHash = ethers.keccak256(
  ethers.solidityPacked(
    ["string", "uint256", "string"],
    ["REVOKE", certificateId, reason]
  )
);

// Sign revoke hash
const revokeSignature = await signer.signMessage(ethers.getBytes(revokeHash));

// Revoke certificate
const tx = await contract.revokeCertificate(
  certificateId,
  reason,
  revokeSignature
);
```

## Integration Guide

### Frontend Integration

```javascript
// Contract ABI and address
const CONTRACT_ABI = [
  /* ABI array */
];
const CONTRACT_ADDRESS = "0x...";

// Connect to contract
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
```

### Backend Integration

```javascript
// Node.js integration
const { ethers } = require("ethers");
const provider = new ethers.providers.JsonRpcProvider(
  "https://sepolia.infura.io/v3/YOUR_PROJECT_ID"
);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
```

## Best Practices

1. **Always verify signatures** before submitting transactions
2. **Use IPFS for document storage** to ensure decentralization
3. **Monitor events** for real-time updates
4. **Implement proper error handling** for user feedback
5. **Test thoroughly** on testnet before mainnet deployment
6. **Keep private keys secure** and use hardware wallets for production

## Troubleshooting

### Common Issues

1. **InvalidSignature error**: Ensure correct message hash creation and signing
2. **CertificateAlreadyRevoked**: Check certificate status before revocation
3. **Unauthorized error**: Verify caller is the current issuer
4. **InvalidInput error**: Validate all input parameters

### Debug Tips

- Check transaction receipts for event logs
- Use Hardhat console for interactive testing
- Monitor gas usage for optimization
- Verify contract state after transactions

## License

MIT License - See LICENSE file for details

## Support

For issues and questions, please refer to the project repository or contact the development team.
