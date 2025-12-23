import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Download, ExternalLink } from "lucide-react";
import { CertificateCard } from "../components/certificate/CertificateCard";
import { CertificateViewer } from "../components/certificate/CertificateViewer";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useCertificate } from "../hooks/useCertificate";
import { cryptoService } from "../services/cryptoService";
import { getExplorerTx } from "../utils/helpers";

export const ViewCertificate: React.FC = () => {
  const params = useParams();
  const [search] = useSearchParams();
  const [fileUrl, setFileUrl] = useState<string | undefined>();
  const [mimeType, setMimeType] = useState<string | undefined>();
  const [loadingFile, setLoadingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const certificateId = Number(params.id || search.get("id"));
  const cid = search.get("cid") || undefined;
  const aesKey = search.get("key") || undefined;
  const txHash = search.get("tx") || undefined;

  const { loadCertificate, certificateMeta } = useCertificate();

  useEffect(() => {
    if (!certificateId) return;
    loadCertificate(certificateId).catch(() =>
      setError("Failed to load certificate")
    );
  }, [certificateId, loadCertificate]);

  useEffect(() => {
    const fetchFile = async () => {
      if (!cid || !aesKey) return;
      setLoadingFile(true);
      setError(null);
      try {
        const res = await cryptoService.downloadCertificate({
          ipfsCid: cid,
          aesKey,
        });
        const url = URL.createObjectURL(res.decryptedFile);
        setFileUrl(url);
        setMimeType(res.mimeType);
      } catch (err: any) {
        setError(err?.message || "Failed to decrypt certificate");
      } finally {
        setLoadingFile(false);
      }
    };
    fetchFile();
  }, [cid, aesKey]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            View Certificate #{certificateId || "-"}
          </h1>
          <p className="text-sm text-gray-600">
            Validate certificate details and view the document.
          </p>
        </div>
        {txHash && (
          <a
            href={getExplorerTx(txHash)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-sm text-primary underline"
          >
            Verify on Blockchain <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        )}
      </div>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          {certificateMeta ? (
            <CertificateCard data={certificateMeta} />
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <LoadingSpinner label="Loading certificate metadata..." />
            </div>
          )}
          {cid && aesKey ? (
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
              PLACEHOLDER: download & decrypt via Person 3 crypto module.
            </div>
          ) : (
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Certificate URL missing CID or key.
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            {loadingFile ? (
              <LoadingSpinner label="Decrypting and loading document..." />
            ) : (
              <CertificateViewer fileUrl={fileUrl} mimeType={mimeType} />
            )}
          </div>
          {fileUrl && (
            <div className="flex gap-2">
              <a
                href={fileUrl}
                download={`certificate-${certificateId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Certificate
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
