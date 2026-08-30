import React from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

interface TxToastProps {
  loading: boolean;
  txHash: string | null;
  error: string | null;
  onClose: () => void;
}

export default function TxToast({ loading, txHash, error, onClose }: TxToastProps) {
  if (!loading && !txHash && !error) return null;

  return (
    <div style={styles.wrap}>
      {loading && (
        <div style={{ ...styles.toast, borderColor: 'rgba(124,58,237,0.4)', background: 'rgba(124,58,237,0.1)' }}>
          <div style={styles.spin}><Loader size={18} color="#8b5cf6" /></div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#f1f0ff' }}>Broadcasting Transaction</div>
            <div style={{ fontSize: 12, color: '#9490c4', marginTop: 2 }}>Signing and submitting to Midnight testnet…</div>
          </div>
        </div>
      )}
      {txHash && !loading && (
        <div style={{ ...styles.toast, borderColor: 'rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.1)' }}>
          <CheckCircle size={20} color="#10b981" />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#10b981' }}>Transaction Confirmed</div>
            <code style={{ fontSize: 11, color: '#9490c4' }}>{txHash.slice(0, 40)}…</code>
          </div>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>
      )}
      {error && (
        <div style={{ ...styles.toast, borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)' }}>
          <XCircle size={20} color="#ef4444" />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#ef4444' }}>Transaction Failed</div>
            <div style={{ fontSize: 12, color: '#9490c4', marginTop: 2 }}>{error}</div>
          </div>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    position: 'fixed', bottom: 24, right: 24, zIndex: 999,
    display: 'flex', flexDirection: 'column', gap: 12,
    maxWidth: 380,
  },
  toast: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    background: '#0d0d2b', border: '1px solid',
    borderRadius: 12, padding: '14px 16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  spin: { animation: 'spin 1s linear infinite' },
  close: {
    marginLeft: 'auto', background: 'none', border: 'none',
    color: '#9490c4', cursor: 'pointer', fontSize: 14, padding: 2,
  },
};
