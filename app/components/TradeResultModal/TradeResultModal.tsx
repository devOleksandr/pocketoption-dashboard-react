import { type FC } from 'react';
import { useTradingStore } from '~/stores';

export const TradeResultModal: FC = () => {
  const {
    showTradeResult,
    setShowTradeResult,
    lastTradeResult,
    selectedPair
  } = useTradingStore();

  if (!showTradeResult || !lastTradeResult) return null;

  const { trade, isWin, profit } = lastTradeResult;

  const handleClose = () => {
    setShowTradeResult(false);
  };

  return (
    <div className="modal modal--result active">
      <div className="modal__content">
        <div className="modal__content-main" style={{ alignItems: "center" }}>
          <div className="modal__main">
            <h3 className="modal__main-title">Trade Result</h3>
          </div>
          <button className="btn-item" onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z" fill="#F8F8FB"></path>
            </svg>
          </button>
        </div>

        <div className="modal__main-inner">
          <div className="modal__main-description">
            {isWin ? (
              <>
                <div className="modal__main-smile">🎉</div>
                <div
                  className="modal__main-info"
                  style={{ color: "#10b981" }}
                >
                  YOU WON!
                </div>
              </>
            ) : (
              <>
                <div className="modal__main-smile">😞</div>
                <div
                  className="modal__main-info"
                  style={{ color: "#ef4444" }}
                >
                  YOU LOST!
                </div>
              </>
            )}
          </div>

          <div className="modal-table">
            <div className="modal-table__row">
              <div className="modal-table__item">
                <span>Pair</span>
                <span>{trade.pair}</span>
              </div>
              <div className="modal-table__item">
                <span>Trade Type:</span>
                <span style={{ color: trade.type === "buy" ? "#10b981" : "#ef4444" }}>
                  {trade.type.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="modal-table__row">
              <div className="modal-table__item">
                <span>Amount:</span>
                <span>${trade.amount}</span>
              </div>
              <div className="modal-table__item">
                <span>Entry Price:</span>
                <span> {trade.entryPrice.toFixed(selectedPair === "USD/JPY" ? 2 : 5)}</span>
              </div>
            </div>
          </div>

          <div className="modal__main-bottom">
            <div
              className="modal__main-details"
              style={{ color: isWin ? "#10b981" : "#ef4444" }}
            >
              {profit > 0 ? "+" : ""}{profit.toFixed(2)} $
            </div>

            <button
              onClick={handleClose}
              className="main-btn"
              style={{
                backgroundColor: isWin ? "#10b981" : "#ef4444",
              }}
            >
              Continue Trading
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
