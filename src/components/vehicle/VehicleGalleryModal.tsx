'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

interface VehicleGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  images: string[];
  photos?: {
    front?: string;
    rear?: string;
    left?: string;
    right?: string;
    dashboard?: string;
    odometer?: string;
  };
}

export const VehicleGalleryModal: React.FC<VehicleGalleryModalProps> = ({
  isOpen,
  onClose,
  title,
  images,
  photos,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!isOpen) return null;

  // Consolidate all available photos
  const allPhotos: { label: string; url: string }[] = [];

  if (photos?.front) allPhotos.push({ label: 'Front View', url: photos.front });
  if (photos?.right || photos?.left) allPhotos.push({ label: 'Side Profile', url: photos.right || photos.left || '' });
  if (photos?.rear) allPhotos.push({ label: 'Rear View', url: photos.rear });
  if (photos?.dashboard) allPhotos.push({ label: 'Dashboard & Controls', url: photos.dashboard });
  if (photos?.odometer) allPhotos.push({ label: 'Odometer Reading', url: photos.odometer });

  images.forEach((img, idx) => {
    if (!allPhotos.some((p) => p.url === img)) {
      allPhotos.push({ label: `Photo #${idx + 1}`, url: img });
    }
  });

  if (allPhotos.length === 0) {
    allPhotos.push({ label: 'Vehicle View', url: '/images/vehicles/himalayan.jpg' });
  }

  const currentPhoto = allPhotos[selectedIndex] || allPhotos[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-brand-orange" />
            <h3 className="font-extrabold text-white text-sm sm:text-base truncate max-w-md font-heading">
              {title} — High-Res Photo Gallery
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Display Image */}
        <div className="flex-1 bg-slate-950 flex items-center justify-center relative min-h-[300px] sm:min-h-[420px] p-4">
          <div className="relative w-full h-full min-h-[300px] sm:min-h-[420px] flex items-center justify-center">
            <Image
              src={currentPhoto.url}
              alt={currentPhoto.label}
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-white">
            {currentPhoto.label} ({selectedIndex + 1}/{allPhotos.length})
          </div>

          {/* Navigation Controls */}
          {allPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-white/10 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0))}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-white/10 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails strip */}
        <div className="p-4 bg-slate-900 border-t border-white/10 flex items-center gap-3 overflow-x-auto">
          {allPhotos.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                selectedIndex === idx ? 'border-brand-orange scale-105 shadow-md' : 'border-white/10 opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={p.url} alt={p.label} fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
