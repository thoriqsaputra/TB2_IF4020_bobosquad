import React, { useMemo, useState } from 'react';
import QRCode from 'react-qr-code';
import { ShieldCheck, LinkIcon, Copy } from 'lucide-react';
import { Input } from '../common/Input';
import { FileUpload } from '../common/FileUpload';
import { Button } from '../common/Button';
import { ProgressSteps } from '../common/ProgressSteps';
import { ErrorMessage } from '../common/ErrorMessage';
import type { StudentData } from '../../types/certificate';
import { validateFile } from '../../utils/validation';
import { useCertificate } from '../../hooks/useCertificate';
import { copyToClipboard } from '../../utils/helpers';

const defaultData: StudentData = {
  name: '',
  nim: '',
  birthPlace: '',
  birthDate: '',
  program: '',
  degree: '',
  issueDate: new Date().toISOString().split('T')[0],
};

export const CertificateForm: React.FC = () => {
  const [form, setForm] = useState<StudentData>(defaultData);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { issueCertificate, issueProgress, issueResult, issueError, isIssuing } = useCertificate();
  const [copied, setCopied] = useState(false);

  const steps = useMemo(
    () => ['Preparing certificate...', 'Encrypting and uploading...', 'Signing transaction...', 'Confirming on blockchain...'],
    [],
  );
  const progressIndex = useMemo(() => ['preparing', 'encrypting', 'signing', 'confirming'].indexOf(issueProgress), [issueProgress]);

  const handleChange = (key: keyof StudentData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    Object.entries(form).forEach(([k, v]) => {
      if (!v) errs[k] = 'Required';
    });
    const fileError = validateFile(file || undefined);
    if (fileError) errs.file = fileError;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !file) return;
    await issueCertificate(form, file);
  };

  const handleCopy = async (value: string) => {
    const ok = await copyToClipboard(value);
    setCopied(ok);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:col-span-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Issue Certificate</h2>
            <p className="text-sm text-gray-600">Fill in student data and upload the certificate file.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Name" value={form.name} onChange={handleChange('name')} error={errors.name} required />
          <Input label="NIM" value={form.nim} onChange={handleChange('nim')} error={errors.nim} required />
          <Input label="Birth Place" value={form.birthPlace} onChange={handleChange('birthPlace')} error={errors.birthPlace} required />
          <Input label="Birth Date" type="date" value={form.birthDate} onChange={handleChange('birthDate')} error={errors.birthDate} required />
          <Input label="Program/Major" value={form.program} onChange={handleChange('program')} error={errors.program} required />
          <Input label="Degree" value={form.degree} onChange={handleChange('degree')} error={errors.degree} required />
          <Input label="Issue Date" type="date" value={form.issueDate} onChange={handleChange('issueDate')} error={errors.issueDate} required />
        </div>
        <FileUpload
          label="Certificate File"
          accept=".pdf,.png,.jpg,.jpeg,.txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          fileName={file?.name}
          error={errors.file}
        />
        <div className="flex justify-end">
          <Button type="submit" loading={isIssuing}>
            Issue Certificate
          </Button>
        </div>
        {issueError && <ErrorMessage message={issueError} />}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-semibold text-gray-800">Progress</p>
          <ProgressSteps steps={steps} activeIndex={progressIndex < 0 ? 0 : progressIndex} />
        </div>
      </form>
      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900">Result</h3>
        {!issueResult ? (
          <p className="text-sm text-gray-600">Issue a certificate to see details here.</p>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-800">
              <p>
                Certificate ID: <span className="font-semibold">{issueResult.certificateId}</span>
              </p>
              <p className="mt-1 break-all">
                Tx Hash:{' '}
                <a href={issueResult.blockExplorerUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                  {issueResult.transactionHash}
                </a>
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between text-sm font-semibold text-gray-800">
                <span>Certificate URL</span>
                <button className="flex items-center gap-1 text-primary" onClick={() => handleCopy(issueResult.certificateUrl)}>
                  <Copy className="h-4 w-4" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="mt-2 break-all text-xs text-gray-700">{issueResult.certificateUrl}</p>
              <div className="mt-4 flex justify-center rounded-lg bg-white p-2 shadow-sm">
                <QRCode value={issueResult.certificateUrl} size={160} />
              </div>
              <p className="mt-2 text-xs text-gray-500">Scan to view certificate</p>
            </div>
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
              PLACEHOLDER: integrate Person 3 crypto module and Person 1 contract when available.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
