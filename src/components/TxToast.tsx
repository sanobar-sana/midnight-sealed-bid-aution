import { CheckCircle, XCircle, Loader, X } from 'lucide-react';

interface TxToastProps {
  loading: boolean;
  txHash: string | null;
  error: string | null;
  onClose: () => void;
}

export default function TxToast({ loading, txHash, error, onClose }: TxToastProps) {
  if (!loading && !txHash && !error) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0">
      {loading && (
        <div className="flex items-start gap-3.5 p-4 rounded-2xl liquid-glass border border-cyan-500/40 shadow-2xl animate-in fade-in slide-in-from-bottom-3">
          <Loader className="w-5 h-5 text-cyan-400 animate-spin shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-sm text-white">Broadcasting Transaction</div>
            <div className="text-xs text-white/60 mt-0.5 leading-relaxed">Generating ZK proof and submitting to Midnight testnet…</div>
          </div>
        </div>
      )}

      {txHash && !loading && (
        <div className="flex items-start gap-3.5 p-4 rounded-2xl liquid-glass border border-emerald-500/40 shadow-2xl animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-emerald-300">Transaction Confirmed</div>
            <div className="text-xs font-mono text-emerald-200/80 truncate mt-0.5">{txHash}</div>
          </div>
          <button onClick={onClose} className="text-emerald-400 hover:text-white p-1 rounded-lg transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3.5 p-4 rounded-2xl liquid-glass border border-rose-500/40 shadow-2xl animate-in fade-in slide-in-from-bottom-3">
          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-sm text-rose-300">Transaction Failed</div>
            <div className="text-xs text-rose-200/90 mt-0.5 leading-relaxed">{error}</div>
          </div>
          <button onClick={onClose} className="text-rose-400 hover:text-white p-1 rounded-lg transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
