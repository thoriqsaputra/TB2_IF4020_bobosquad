// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CertificateRegistry is Ownable, ReentrancyGuard {
    
    struct Certificate {
        bytes32 documentHash;
        string ipfsCid;
        address issuer;
        uint256 timestamp;
        bool isRevoked;
        string revokeReason;
    }
    
    mapping(uint256 => Certificate) private certificates;
    uint256 private certificateCounter;
    
    event CertificateIssued(
        uint256 indexed certificateId,
        bytes32 documentHash,
        string ipfsCid,
        address indexed issuer,
        uint256 timestamp
    );
    
    event CertificateRevoked(
        uint256 indexed certificateId,
        address indexed issuer,
        string reason,
        uint256 timestamp
    );
    
    error InvalidSignature();
    error CertificateNotFound();
    error CertificateAlreadyRevoked();
    error InvalidCertificateData();
    error UnauthorizedIssuer();
    
    modifier onlyValidCertificate(uint256 certificateId) {
        if (certificateId == 0 || certificateId > certificateCounter) {
            revert CertificateNotFound();
        }
        _;
    }
    
    modifier onlyNonRevoked(uint256 certificateId) {
        if (certificates[certificateId].isRevoked) {
            revert CertificateAlreadyRevoked();
        }
        _;
    }
    
    constructor() Ownable(msg.sender) {
        certificateCounter = 0;
    }
    
    function issueCertificate(
        bytes32 documentHash,
        string memory ipfsCid,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant returns (uint256) {
        if (documentHash == bytes32(0) || bytes(ipfsCid).length == 0) {
            revert InvalidCertificateData();
        }
        
        bytes32 messageHash = keccak256(abi.encodePacked(documentHash, ipfsCid));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address recoveredSigner = ecrecover(ethSignedMessageHash, v, r, s);
        
        if (recoveredSigner == address(0)) {
            revert InvalidSignature();
        }
        
        certificateCounter++;
        uint256 certificateId = certificateCounter;
        
        certificates[certificateId] = Certificate({
            documentHash: documentHash,
            ipfsCid: ipfsCid,
            issuer: recoveredSigner,
            timestamp: block.timestamp,
            isRevoked: false,
            revokeReason: ""
        });
        
        emit CertificateIssued(certificateId, documentHash, ipfsCid, recoveredSigner, block.timestamp);
        
        return certificateId;
    }
    
    function revokeCertificate(
        uint256 certificateId,
        string memory reason
    ) external onlyValidCertificate(certificateId) onlyNonRevoked(certificateId) {
        Certificate storage cert = certificates[certificateId];
        
        if (cert.issuer != msg.sender) {
            revert UnauthorizedIssuer();
        }
        
        cert.isRevoked = true;
        cert.revokeReason = reason;
        
        emit CertificateRevoked(certificateId, msg.sender, reason, block.timestamp);
    }
    
    function getCertificate(uint256 certificateId) 
        external 
        view 
        onlyValidCertificate(certificateId) 
        returns (
            bytes32 documentHash,
            string memory ipfsCid,
            address issuer,
            uint256 timestamp,
            bool isRevoked,
            string memory revokeReason
        ) 
    {
        Certificate memory cert = certificates[certificateId];
        return (cert.documentHash, cert.ipfsCid, cert.issuer, cert.timestamp, cert.isRevoked, cert.revokeReason);
    }
    
    function verifyCertificate(
        uint256 certificateId,
        bytes32 documentHash,
        string memory ipfsCid
    ) external view returns (bool isValid, string memory message) {
        if (certificateId == 0 || certificateId > certificateCounter) {
            return (false, "Certificate not found");
        }
        
        Certificate memory cert = certificates[certificateId];
        
        if (cert.isRevoked) {
            return (false, "Certificate has been revoked");
        }
        
        if (cert.documentHash != documentHash) {
            return (false, "Document hash mismatch");
        }
        
        if (keccak256(bytes(cert.ipfsCid)) != keccak256(bytes(ipfsCid))) {
            return (false, "IPFS CID mismatch");
        }
        
        return (true, "Certificate is valid");
    }
    
    function getCertificateCount() external view returns (uint256) {
        return certificateCounter;
    }
}