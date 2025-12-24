import { BrowserProvider, Contract, JsonRpcProvider, ethers } from "ethers";
import type {
  CertificateOnChain,
  ContractService,
  ContractTransaction,
  IssueCertificateParams,
  IssueCertificateResult,
  RevokeCertificateParams,
  VerifyCertificateResult,
} from "../types/contract";
import { CONFIG } from "../config/config";
import { getExplorerTx } from "../utils/helpers";
const abi: any = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "certificateId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "documentHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "ipfsCid",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "issuer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "CertificateIssued",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "certificateId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "issuer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "reason",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "CertificateRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "getCertificateCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "documentHash", type: "bytes32" },
      { internalType: "string", name: "ipfsCid", type: "string" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "issueCertificate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "certificateId", type: "uint256" },
    ],
    name: "getCertificate",
    outputs: [
      { internalType: "bytes32", name: "documentHash", type: "bytes32" },
      { internalType: "string", name: "ipfsCid", type: "string" },
      { internalType: "address", name: "issuer", type: "address" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
      { internalType: "bool", name: "isRevoked", type: "bool" },
      { internalType: "string", name: "revokeReason", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "certificateId", type: "uint256" },
      { internalType: "bytes32", name: "documentHash", type: "bytes32" },
      { internalType: "string", name: "ipfsCid", type: "string" },
    ],
    name: "verifyCertificate",
    outputs: [
      { internalType: "bool", name: "isValid", type: "bool" },
      { internalType: "string", name: "message", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "certificateId", type: "uint256" },
      { internalType: "string", name: "reason", type: "string" },
    ],
    name: "revokeCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const buildRpcProvider = () => new JsonRpcProvider(CONFIG.NETWORK.rpcUrl);
const buildReadContract = () =>
  new Contract(CONFIG.CONTRACT_ADDRESS, abi as any, buildRpcProvider());

const getSigner = async () => {
  const provider = new BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  return { provider, signer };
};

const splitSignature = (signature: string) => {
  const sig = signature.slice(2);
  const r = "0x" + sig.slice(0, 64);
  const s = "0x" + sig.slice(64, 128);
  const v = parseInt(sig.slice(128, 130), 16);
  return { v, r, s };
};

export const ethersContractService: ContractService = {
  async issueCertificate(
    params: IssueCertificateParams
  ): Promise<IssueCertificateResult> {
    const { signer } = await getSigner();
    const write = new Contract(CONFIG.CONTRACT_ADDRESS, abi as any, signer);
    const messageHash = ethers.keccak256(
      ethers.solidityPacked(
        ["bytes32", "string"],
        [params.documentHash, params.ipfsCid]
      )
    );
    const signature = await signer.signMessage(ethers.getBytes(messageHash));
    const { v, r, s } = splitSignature(signature);
    const tx = await write.issueCertificate(
      params.documentHash,
      params.ipfsCid,
      v,
      r,
      s
    );
    const receipt = await tx.wait();
    const events = receipt?.logs || [];
    let certificateId = 0;
    for (const log of events) {
      try {
        const parsed = write.interface.parseLog(log);
        if (parsed?.name === "CertificateIssued") {
          certificateId = Number(parsed.args.certificateId);
          break;
        }
      } catch {}
    }
    const txHash = tx.hash;
    return {
      certificateId,
      transactionHash: txHash,
      blockExplorerUrl: getExplorerTx(txHash),
    };
  },

  async revokeCertificate(params: RevokeCertificateParams) {
    const { signer } = await getSigner();
    const write = new Contract(CONFIG.CONTRACT_ADDRESS, abi as any, signer);
    const tx = await write.revokeCertificate(
      params.certificateId,
      params.reason
    );
    const receipt = await tx.wait();
    const txHash = receipt?.hash || tx.hash;
    return {
      transactionHash: txHash,
      blockExplorerUrl: getExplorerTx(txHash),
    };
  },

  async getCertificate(id: number): Promise<CertificateOnChain> {
    const read = buildReadContract();
    const cert = await read.getCertificate(id);
    return {
      documentHash: cert.documentHash,
      ipfsCid: cert.ipfsCid,
      issuer: cert.issuer,
      timestamp: Number(cert.timestamp),
      isRevoked: Boolean(cert.isRevoked),
      revokeReason: cert.revokeReason,
    };
  },

  async verifyCertificate(
    id: number,
    documentHash: string
  ): Promise<VerifyCertificateResult> {
    const res = await fetch(
      `${CONFIG.BACKEND_URL}/contract/verify?id=${encodeURIComponent(
        id
      )}&hash=${encodeURIComponent(documentHash)}`
    );
    if (!res.ok) {
      throw new Error("Backend verification failed");
    }
    const data = await res.json();
    return {
      isValid: Boolean(data.isValid),
      details: data.details as CertificateOnChain,
    };
  },

  async getTransactionList(): Promise<ContractTransaction[]> {
    const provider = buildRpcProvider();
    const read = buildReadContract();
    const latest = await provider.getBlockNumber();
    const from = Math.max(0, latest - 20000);
    const issued = await read.queryFilter(
      read.filters.CertificateIssued(),
      from,
      latest
    );
    const revoked = await read.queryFilter(
      read.filters.CertificateRevoked(),
      from,
      latest
    );
    const txs: ContractTransaction[] = [];
    for (const ev of issued) {
      const b = await provider.getBlock(ev.blockHash!);
      let certificateId = 0;
      try {
        const parsed = read.interface.parseLog(ev);
        if (parsed?.name === "CertificateIssued") {
          certificateId = Number(parsed.args.certificateId);
        }
      } catch {}
      txs.push({
        txHash: ev.transactionHash,
        type: "ISSUE",
        certificateId,
        timestamp: Number(b?.timestamp || 0),
        status: "SUCCESS",
        blockExplorerUrl: getExplorerTx(ev.transactionHash),
      });
    }
    for (const ev of revoked) {
      const b = await provider.getBlock(ev.blockHash!);
      let certificateId = 0;
      try {
        const parsed = read.interface.parseLog(ev);
        if (parsed?.name === "CertificateRevoked") {
          certificateId = Number(parsed.args.certificateId);
        }
      } catch {}
      txs.push({
        txHash: ev.transactionHash,
        type: "REVOKE",
        certificateId,
        timestamp: Number(b?.timestamp || 0),
        status: "SUCCESS",
        blockExplorerUrl: getExplorerTx(ev.transactionHash),
      });
    }
    txs.sort((a, b) => b.timestamp - a.timestamp);
    return txs;
  },
};
