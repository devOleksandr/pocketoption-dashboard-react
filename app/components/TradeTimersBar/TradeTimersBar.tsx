import { useState, useEffect, type FC, useRef } from 'react';
import { useTradingStore } from '~/stores';

export const TradeTimersBar: FC = () => {
    const { activeTrades, selectedPair, timeframe } = useTradingStore();
    const [isVisible, setIsVisible] = useState(false);
    const lastActiveTradesRef = useRef<string>('');

    const now = Date.now();
    const trades = Array.isArray(activeTrades) ? activeTrades.filter(t => t.pair === selectedPair) : [];
    const currentTradesId = trades.map(t => t.id).join(',');

    // Auto-hide the entire notification bar after 5 seconds
    useEffect(() => {
        // Check if there are trades and if they changed
        if (trades.length > 0) {
            // Show the bar when a new trade opens (trades changed)
            if (lastActiveTradesRef.current !== currentTradesId) {
                setIsVisible(true);
                lastActiveTradesRef.current = currentTradesId;

                // Hide after 5 seconds
                const timer = setTimeout(() => {
                    setIsVisible(false);
                }, 5000);

                return () => clearTimeout(timer);
            }
        } else {
            // No active trades
            setIsVisible(false);
            lastActiveTradesRef.current = '';
        }
    }, [trades.length, currentTradesId]);

    if (!isVisible || trades.length === 0) return null;

    return (
        <div className="push-message">
            {trades.map(trade => {
                const timeLeft = Math.max(0, Math.ceil((trade.entryTimestamp + timeframe * 1000 - now) / 1000));
                return (
                    <div className="push-message__item" key={trade.id}>
                        <div className="push-message__left">
                            <span>{trade.type.toUpperCase()} {trade.pair}</span>
                            <span>${trade.amount}</span>
                        </div>
                        <div className="push-message__time">
                            <span style={{ color: timeLeft < 5 ? "#ef4444" : "#10b981" }}>
                                {timeLeft}s
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
