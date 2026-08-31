import React, { useState, useRef } from 'react';
import { Upload, Link2, X, Image as ImageIcon, Check, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

interface ImageUploadOrUrlProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
}

export const ImageUploadOrUrl: React.FC<ImageUploadOrUrlProps> = ({
  label,
  value,
  onChange,
  placeholder = 'https://... atau upload foto',
  helperText = 'Mendukung upload file (PNG, JPG, WEBP) atau salin link URL foto.',
  required = false,
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState<string>(value || '');
  const [previewError, setPreviewError] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize internal state when value prop changes
  React.useEffect(() => {
    setUrlInput(value || '');
    setPreviewError(false);
  }, [value]);

  // Convert Google Drive sharing URLs to direct image URLs if needed
  const formatImageUrl = (rawUrl: string): string => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return '';

    // Handle Google Drive share link: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }

    // Handle Google Drive open link: https://drive.google.com/open?id=FILE_ID
    const driveIdMatch = trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (trimmed.includes('drive.google.com') && driveIdMatch && driveIdMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${driveIdMatch[1]}`;
    }

    return trimmed;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);
    const formatted = formatImageUrl(val);
    onChange(formatted);
    setPreviewError(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPG, PNG, WEBP, GIF).');
      return;
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file maksimal 10MB.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result);
        setUrlInput(result);
        setPreviewError(false);
      }
      setIsProcessing(false);
    };

    reader.onerror = () => {
      alert('Gagal membaca file gambar.');
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClearImage = () => {
    onChange('');
    setUrlInput('');
    setPreviewError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isBase64 = value && value.startsWith('data:image/');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#E2E2E2] flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>{label}</span>
          {required && <span className="text-red-400">*</span>}
        </label>

        {/* Mode Switcher Tabs */}
        <div className="inline-flex rounded-xs bg-[#0A0A0B] p-0.5 border border-white/10 text-[10px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer flex items-center gap-1 ${
              mode === 'upload'
                ? 'bg-[#C5A059] text-black font-bold'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer flex items-center gap-1 ${
              mode === 'url'
                ? 'bg-[#C5A059] text-black font-bold'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            <Link2 className="w-3 h-3" />
            <span>Copy Link URL</span>
          </button>
        </div>
      </div>

      {/* Input Area Depending on Mode */}
      {mode === 'upload' ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-sm p-4 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-[#C5A059] bg-[#C5A059]/10'
              : 'border-white/15 hover:border-[#C5A059]/50 bg-[#0A0A0B]/60 hover:bg-[#0A0A0B]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
            <div className="w-9 h-9 rounded-full bg-[#1A1A1E] border border-white/10 flex items-center justify-center text-[#C5A059]">
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#C5A059]" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </div>
            <p className="text-xs text-white font-medium">
              {isProcessing
                ? 'Memproses gambar...'
                : 'Klik untuk pilih foto atau drag & drop ke sini'}
            </p>
            <p className="text-[10px] text-[#777777]">PNG, JPG, WEBP, GIF (Maks. 10MB)</p>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="relative">
            <Link2 className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={urlInput}
              onChange={handleUrlChange}
              placeholder={placeholder}
              className="w-full bg-[#0A0A0B] border border-white/10 focus:border-[#C5A059] rounded-sm pl-9 pr-8 py-2 text-xs text-white placeholder-[#555555] focus:outline-none transition-colors"
            />
            {urlInput && (
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white"
                title="Hapus URL"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-[#777777]">
            Tips: Mendukung link publik Google Drive, CDN, Imgur, atau link website.
          </p>
        </div>
      )}

      {/* Live Preview Box */}
      {value ? (
        <div className="mt-2 p-2.5 bg-[#121214] border border-white/10 rounded-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-14 h-14 shrink-0 rounded-xs overflow-hidden border border-white/15 bg-black">
              {!previewError ? (
                <img
                  src={value}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  onError={() => setPreviewError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-red-950/40 text-red-400 p-1 text-center">
                  <AlertCircle className="w-4 h-4 mb-0.5" />
                  <span className="text-[8px] leading-tight">Gagal Muat</span>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#00D222] flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Foto Terpasang</span>
                </span>
                <span className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.2 rounded-2xs text-[#AAAAAA] uppercase font-mono">
                  {isBase64 ? 'Uploaded File' : 'URL Link'}
                </span>
              </div>
              <p className="text-[10px] text-[#888888] truncate max-w-xs font-mono">
                {isBase64 ? 'Local Image (Base64 Encoded)' : value}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isBase64 && value && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-[#1A1A1E] hover:bg-[#25252A] text-[#C5A059] border border-white/10 rounded-xs text-[10px] transition-colors"
                title="Buka foto di tab baru"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={handleClearImage}
              className="px-2 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 rounded-xs text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-[#666666] italic">{helperText}</p>
      )}
    </div>
  );
};
