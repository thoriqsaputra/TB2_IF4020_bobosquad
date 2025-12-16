const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateRegistry", function () {
  let certificateRegistry;
  let deployer;
  let issuer;
  let otherAccount;

  function createMessageHash(documentHash, ipfsCid) {
    return ethers.keccak256(
      ethers.solidityPacked(["bytes32", "string"], [documentHash, ipfsCid])
    );
  }

  async function createSignature(messageHash, signer) {
    const messageHashBytes = ethers.getBytes(messageHash);
    return await signer.signMessage(messageHashBytes);
  }

  function splitSignature(signature) {
    const sig = signature.substring(2);
    const r = "0x" + sig.substring(0, 64);
    const s = "0x" + sig.substring(64, 128);
    const v = parseInt(sig.substring(128, 130), 16);
    return { r, s, v };
  }

  beforeEach(async function () {
    [deployer, issuer, otherAccount] = await ethers.getSigners();

    const CertificateRegistry = await ethers.getContractFactory(
      "CertificateRegistry"
    );
    certificateRegistry = await CertificateRegistry.deploy();
    await certificateRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await certificateRegistry.owner()).to.equal(deployer.address);
    });

    it("Should have zero certificates initially", async function () {
      expect(await certificateRegistry.getCertificateCount()).to.equal(0);
    });
  });

  describe("Certificate Issuance", function () {
    let documentHash;
    let ipfsCid;
    let messageHash;

    beforeEach(async function () {
      documentHash = ethers.keccak256(ethers.toUtf8Bytes("test-document"));
      ipfsCid = "QmTest123456789";
      messageHash = createMessageHash(documentHash, ipfsCid);
    });

    it("Should issue a certificate successfully", async function () {
      const signature = await createSignature(messageHash, issuer);
      const { v, r, s } = splitSignature(signature);

      await expect(
        certificateRegistry
          .connect(issuer)
          .issueCertificate(documentHash, ipfsCid, v, r, s)
      )
        .to.emit(certificateRegistry, "CertificateIssued")
        .withArgs(1, documentHash, ipfsCid, issuer.address, anyValue);

      const count = await certificateRegistry.getCertificateCount();
      expect(count).to.equal(1);

      const cert = await certificateRegistry.getCertificate(1);
      expect(cert.documentHash).to.equal(documentHash);
      expect(cert.ipfsCid).to.equal(ipfsCid);
      expect(cert.issuer).to.equal(issuer.address);
      expect(cert.isRevoked).to.equal(false);
    });

    it("Should issue certificate with different caller than signer", async function () {
      const signature = await createSignature(messageHash, issuer);
      const { v, r, s } = splitSignature(signature);

      await expect(
        certificateRegistry
          .connect(otherAccount)
          .issueCertificate(documentHash, ipfsCid, v, r, s)
      )
        .to.emit(certificateRegistry, "CertificateIssued")
        .withArgs(1, documentHash, ipfsCid, issuer.address, anyValue);

      const cert = await certificateRegistry.getCertificate(1);
      expect(cert.issuer).to.equal(issuer.address);
    });

    it("Should fail with invalid signature (invalid v,r,s)", async function () {
      await expect(
        certificateRegistry
          .connect(issuer)
          .issueCertificate(
            documentHash,
            ipfsCid,
            27,
            ethers.ZeroHash,
            ethers.ZeroHash
          )
      ).to.be.revertedWithCustomError(certificateRegistry, "InvalidSignature");
    });

    it("Should fail with invalid certificate data", async function () {
      const signature = await createSignature(messageHash, issuer);
      const { v, r, s } = splitSignature(signature);

      await expect(
        certificateRegistry
          .connect(issuer)
          .issueCertificate(ethers.ZeroHash, ipfsCid, v, r, s)
      ).to.be.revertedWithCustomError(
        certificateRegistry,
        "InvalidCertificateData"
      );

      await expect(
        certificateRegistry
          .connect(issuer)
          .issueCertificate(documentHash, "", v, r, s)
      ).to.be.revertedWithCustomError(
        certificateRegistry,
        "InvalidCertificateData"
      );
    });
  });

  describe("Certificate Revocation", function () {
    let documentHash;
    let ipfsCid;
    let messageHash;

    beforeEach(async function () {
      documentHash = ethers.keccak256(ethers.toUtf8Bytes("test-document"));
      ipfsCid = "QmTest123456789";
      messageHash = createMessageHash(documentHash, ipfsCid);

      const signature = await createSignature(messageHash, issuer);
      const { v, r, s } = splitSignature(signature);
      await certificateRegistry
        .connect(issuer)
        .issueCertificate(documentHash, ipfsCid, v, r, s);
    });

    it("Should revoke a certificate successfully", async function () {
      await expect(
        certificateRegistry
          .connect(issuer)
          .revokeCertificate(1, "Test revocation")
      )
        .to.emit(certificateRegistry, "CertificateRevoked")
        .withArgs(1, issuer.address, "Test revocation", anyValue);

      const cert = await certificateRegistry.getCertificate(1);
      expect(cert.isRevoked).to.equal(true);
      expect(cert.revokeReason).to.equal("Test revocation");
    });

    it("Should fail when non-issuer tries to revoke", async function () {
      await expect(
        certificateRegistry
          .connect(otherAccount)
          .revokeCertificate(1, "Unauthorized")
      ).to.be.revertedWithCustomError(
        certificateRegistry,
        "UnauthorizedIssuer"
      );
    });

    it("Should fail to revoke already revoked certificate", async function () {
      await certificateRegistry
        .connect(issuer)
        .revokeCertificate(1, "First revocation");

      await expect(
        certificateRegistry
          .connect(issuer)
          .revokeCertificate(1, "Second attempt")
      ).to.be.revertedWithCustomError(
        certificateRegistry,
        "CertificateAlreadyRevoked"
      );
    });
  });

  describe("Certificate Verification", function () {
    let documentHash;
    let ipfsCid;
    let messageHash;

    beforeEach(async function () {
      documentHash = ethers.keccak256(ethers.toUtf8Bytes("test-document"));
      ipfsCid = "QmTest123456789";
      messageHash = createMessageHash(documentHash, ipfsCid);

      const signature = await createSignature(messageHash, issuer);
      const { v, r, s } = splitSignature(signature);
      await certificateRegistry
        .connect(issuer)
        .issueCertificate(documentHash, ipfsCid, v, r, s);
    });

    it("Should verify valid certificate", async function () {
      const [isValid, message] = await certificateRegistry.verifyCertificate(
        1,
        documentHash,
        ipfsCid
      );
      expect(isValid).to.equal(true);
      expect(message).to.equal("Certificate is valid");
    });

    it("Should fail verification with wrong document hash", async function () {
      const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("wrong-document"));
      const [isValid, message] = await certificateRegistry.verifyCertificate(
        1,
        wrongHash,
        ipfsCid
      );
      expect(isValid).to.equal(false);
      expect(message).to.equal("Document hash mismatch");
    });

    it("Should fail verification with wrong IPFS CID", async function () {
      const [isValid, message] = await certificateRegistry.verifyCertificate(
        1,
        documentHash,
        "QmWrong"
      );
      expect(isValid).to.equal(false);
      expect(message).to.equal("IPFS CID mismatch");
    });

    it("Should fail verification of revoked certificate", async function () {
      await certificateRegistry
        .connect(issuer)
        .revokeCertificate(1, "Test revocation");

      const [isValid, message] = await certificateRegistry.verifyCertificate(
        1,
        documentHash,
        ipfsCid
      );
      expect(isValid).to.equal(false);
      expect(message).to.equal("Certificate has been revoked");
    });

    it("Should fail verification of non-existent certificate", async function () {
      const [isValid, message] = await certificateRegistry.verifyCertificate(
        999,
        documentHash,
        ipfsCid
      );
      expect(isValid).to.equal(false);
      expect(message).to.equal("Certificate not found");
    });
  });
});

const anyValue = () => true;
