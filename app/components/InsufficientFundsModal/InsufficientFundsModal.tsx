import { type FC } from 'react';
import { useTradingStore } from '~/stores';

export const InsufficientFundsModal: FC = () => {
  const { showFundsModal, setShowFundsModal } = useTradingStore();

  if (!showFundsModal) return null;

  const handleClose = () => {
    setShowFundsModal(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#2d3748",
          borderRadius: "8px",
          padding: "24px",
          maxWidth: "400px",
          width: "90%",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>😞</div>
        <div style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "16px" }}>
          Insufficient funds on balance
        </div>
        <button
          onClick={handleClose}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};
