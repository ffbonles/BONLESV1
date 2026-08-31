import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Mail, KeyRound, Eye, EyeOff, 
  X, ShieldAlert, ArrowRight 
} from 'lucide-react';
import { authService } from '../services/auth';
import { BonlesLogo } from './BonlesLogo';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    // Simulate authenticating for smooth secure UX
    setTimeout(() => {
      const result = authService.login(username, password, rememberMe);
      setIsLoading(false);

      if (result.success) {
        onLoginSuccess();
        onClose();
        // Reset form
        setUsername('');
        setPassword('');
      } else {
        setErrorMessage(result.message);
      }
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-[#1C070B] border border-[#D82824]/30 rounded-sm p-6 sm:p-8 shadow-2xl text-[#E8E4D9]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-admin-title"
      >
        {/* Top Gradient Security Line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#D82824] via-[#F5A623] to-[#00D222]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A89886] hover:text-white transition-colors p-1.5 rounded-sm hover:bg-white/5 cursor-pointer"
          aria-label="Tutup dialog login"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="space-y-4 text-center pb-2">
          <div className="flex justify-center">
            <BonlesLogo size="sm" variant="horizontal" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs bg-[#140507] border border-[#F5A623]/40 text-[#F5A623] text-[10px] font-mono font-bold tracking-[0.2em] uppercase">
            <Lock className="w-3 h-3" />
            <span>PROTECTED GATEWAY</span>
          </div>

          <div>
            <h2 id="modal-admin-title" className="text-xl sm:text-2xl font-serif text-[#FFFDF9] font-medium">
              Autentifikasi Bonles Food Admin
            </h2>
            <p className="text-xs text-[#A89886] mt-1 font-light">
              Masukkan kredensial resmi untuk mengakses database & panel kontrol.
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xs bg-[#3B0C10] border border-[#D82824]/60 text-[#FF8888] text-xs flex items-start gap-2.5 animate-shake">
            <ShieldAlert className="w-4 h-4 text-[#D82824] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-[#FF9999]">Akses Ditolak</span>
              <p className="text-[11px] leading-relaxed text-[#FFBBBB] mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Username / Email Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#F5A623] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>Username/Email</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username atau email..."
                required
                autoFocus
                className="w-full bg-[#140507] border border-[#D82824]/30 focus:border-[#F5A623] rounded-xs px-3.5 py-2.5 text-xs text-white placeholder-[#887766] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[#F5A623] flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password..."
                required
                className="w-full bg-[#140507] border border-[#D82824]/30 focus:border-[#F5A623] rounded-xs px-3.5 py-2.5 pr-10 text-xs text-white placeholder-[#887766] focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89886] hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-2 text-[#DCD1C0] hover:text-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded-xs bg-[#140507] border-[#D82824]/30 text-[#D82824] focus:ring-0 focus:ring-offset-0"
              />
              <span className="text-[11px]">Ingat sesi login ini</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#D82824] to-[#B51E1A] hover:from-[#E53935] hover:to-[#D82824] disabled:bg-[#555555] text-white font-semibold py-3 px-4 rounded-xs text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#D82824]/25 cursor-pointer"
            >
              {isLoading ? (
                <span>Memverifikasi Otoritas...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Buka Panel Administrasi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Footer Notice */}
        <div className="mt-6 pt-4 border-t border-[#D82824]/20 text-center">
          <p className="text-[10px] text-[#A89886] leading-relaxed">
            Sistem pengamanan enkripsi sesi PT. Bonles Food Nusantara. Seluruh aktivitas login dicatat pada audit log.
          </p>
        </div>
      </div>
    </div>
  );
};
