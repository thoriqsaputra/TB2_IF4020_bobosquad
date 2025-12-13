export interface StudentData {
  name: string;
  nim: string;
  birthPlace: string;
  birthDate: string;
  program: string;
  degree: string;
  issueDate: string;
}

export interface PreparedCertificateView {
  certificateId: number;
  transactionHash: string;
  blockExplorerUrl: string;
  certificateUrl: string;
}
