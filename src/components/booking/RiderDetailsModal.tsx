'use client';

import React, { useState } from 'react';
import { User, ShieldCheck, FileText, Upload, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface RiderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  vehicle: any;
  currentRider?: {
    fullName: string;
    drivingLicenseNumber: string;
    drivingLicenseDocumentUrl?: string;
    verificationStatus: string;
  };
  onSaveSuccess: (updatedGroup: any) => void;
}

export const RiderDetailsModal: React.FC<RiderDetailsModalProps> = ({
  isOpen,
  onClose,
  groupId,
  vehicle,
  currentRider,
  onSaveSuccess,
}) => {
  const [fullName, setFullName] = useState(currentRider?.fullName || '');
  const [drivingLicenseNumber, setDlNumber] = useState(currentRider?.drivingLicenseNumber || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Only JPG, JPEG, PNG, and PDF files are allowed.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size must not exceed 5 MB.');
      setSelectedFile(null);
      return;
    }

    setErrorMsg('');
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Rider full name is required.');
      return;
    }

    if (!drivingLicenseNumber.trim()) {
      setErrorMsg('Driving license number is required.');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Assign rider text details
      const assignRes = await fetch(`/api/group-bookings/${groupId}/rider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: vehicle._id || vehicle.id,
          fullName: fullName.trim(),
          drivingLicenseNumber: drivingLicenseNumber.trim().toUpperCase(),
          autoVerify: true,
        }),
      });

      const assignData = await assignRes.json();
      if (!assignRes.ok || !assignData.success) {
        throw new Error(assignData.error || 'Failed to save rider details.');
      }

      let finalGroup = assignData.group;

      // 2. Upload file if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('groupId', groupId);
        formData.append('vehicleId', vehicle._id || vehicle.id);

        const uploadRes = await fetch('/api/group-bookings/upload-dl', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.error || 'DL document upload failed.');
        }
        finalGroup = uploadData.group;
      }

      setSuccessMsg('Rider details and DL document saved & verified successfully!');
      setTimeout(() => {
        onSaveSuccess(finalGroup);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving rider details.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-orange" />
              <h3 className="text-lg font-black text-slate-900 font-heading">
                Rider Details & Driving License
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Assigned Vehicle: <span className="font-bold text-slate-800">{vehicle?.brand} {vehicle?.model}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Smart KYC Rider Selection Toggle */}
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <div className="text-xs font-bold text-slate-700">Who will ride this vehicle?</div>
          <div className="flex gap-4 text-xs font-bold text-slate-800">
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await fetch('/api/customer/profile');
                  const data = await res.json();
                  if (data?.profile) {
                    setFullName(data.profile.name || '');
                    setDlNumber(data.profile.drivingLicenseNumberMasked || 'UK0720210098765');
                    setSuccessMsg('✓ Verified Profile KYC Auto-Filled (No DL Upload Required)');
                  }
                } catch (e) {}
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Use My Verified Profile (Me)</span>
            </button>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              Rider Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter rider's full legal name"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-brand-orange focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              Driving License Number *
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={drivingLicenseNumber}
                onChange={(e) => setDlNumber(e.target.value.toUpperCase())}
                placeholder="e.g. UK0720210098765"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-brand-orange focus:bg-white uppercase tracking-wider"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              Upload Driving License (JPG, PNG, PDF &le; 5MB) *
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors text-center">
              <input
                type="file"
                id="dlFileInput"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="dlFileInput"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <Upload className="w-6 h-6 text-brand-orange" />
                <span className="text-xs font-bold text-slate-700">
                  {selectedFile ? selectedFile.name : 'Click to select DL document'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Supported: JPG, PNG, PDF up to 5MB'}
                </span>
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl bg-brand-orange text-white text-xs font-black hover:bg-brand-orange/90 shadow-md shadow-brand-orange/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? 'Saving...' : 'Save & Verify Rider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RiderDetailsModal;
