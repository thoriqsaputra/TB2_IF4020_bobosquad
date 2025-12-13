import React from 'react';

interface Props {
  fileUrl?: string;
  mimeType?: string;
}

export const CertificateViewer: React.FC<Props> = ({ fileUrl, mimeType }) => {
  if (!fileUrl) {
    return <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500">No document loaded yet.</div>;
  }

  if (mimeType?.includes('pdf')) {
    return <iframe src={fileUrl} className="h-[500px] w-full rounded-xl border" title="Certificate PDF" />;
  }

  if (mimeType?.startsWith('image/')) {
    return <img src={fileUrl} alt="Certificate" className="max-h-[500px] w-full rounded-xl border object-contain" />;
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-700">
      <p className="mb-2 font-semibold text-gray-900">Certificate Content</p>
      <pre className="whitespace-pre-wrap break-words text-xs">{fileUrl}</pre>
    </div>
  );
};
