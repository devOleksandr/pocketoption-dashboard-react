import { type FC, useRef, useEffect } from 'react';
import { useTradingStore } from '~/stores';

export const TradingPanel: FC = () => {
    const panelRef = useRef<HTMLDivElement | null>(null);
    const touchStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const {
        timeframe,
        setTimeframe,
        amount,
        setAmount,
        handleTrade,
        isTradingDisabled
    } = useTradingStore();

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove everything except digits and dots
        let val = e.target.value.replace(/[^0-9.]/g, "");
        // Don't allow more than 100
        if (val !== "") {
            let num = Number(val);
            if (num > 100) num = 100;
            if (num < 1) num = 1;
            val = String(num);
        }
        setAmount(val);
    };

    useEffect(() => {
        const el = panelRef.current;
        if (!el) return;

        const onTouchStart = (e: TouchEvent) => {
            const t = e.touches && e.touches[0];
            if (!t) return;
            touchStart.current = { x: t.clientX, y: t.clientY };
        };

        const onTouchMove = (e: TouchEvent) => {
            const t = e.touches && e.touches[0];
            if (!t) return;
            const dx = t.clientX - touchStart.current.x;
            const dy = t.clientY - touchStart.current.y;
            if (Math.abs(dx) > Math.abs(dy)) {
                e.preventDefault(); // block horizontal swipe within panel
            }
        };

        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        return () => {
            el.removeEventListener('touchstart', onTouchStart as any);
            el.removeEventListener('touchmove', onTouchMove as any);
        };
    }, []);

    return (
        <div className="chart-panel" ref={panelRef} style={{ touchAction: 'pan-y' }}>
            <div className="chart-panel__item chart-panel__item--sell">
                <div className="chart-panel__input">
                    <button
                        className="chart-panel__input-btn"
                        onClick={() => setTimeframe(Math.max(5, timeframe - 5))}
                    ></button>
                    <div className="chart-panel__input-inner">
                        {timeframe} <span>sec</span>
                    </div>
                    <button
                        className="chart-panel__input-btn"
                        onClick={() => setTimeframe(Math.min(60, timeframe + 5))}
                    ></button>
                </div>
                <button
                    className="chart-panel__btn"
                    onClick={() => handleTrade("down")}
                    disabled={isTradingDisabled}
                    style={{
                        opacity: isTradingDisabled ? 0.5 : 1,
                        cursor: isTradingDisabled ? 'not-allowed' : 'pointer'
                    }}
                >
                    <i></i>
                    <span>SELL</span>
                </button>
            </div>

            <div className="chart-panel__item chart-panel__item--buy">
                <div className="chart-panel__input">
                    <button
                        className="chart-panel__input-btn"
                        onClick={() => setAmount(String(Math.max(1, Number(amount) - 1)))}
                    ></button>
                    <input
                        type="text"
                        className="chart-panel__input-inner"
                        value={amount === "" ? "" : `$${amount}`}
                        onChange={handleAmountChange}
                        style={{
                            all: "unset",
                            width: 60,
                            textAlign: "center",
                            background: "transparent",
                            border: "none",
                            color: "#F8F8FB",
                            outline: "none",
                            paddingLeft: 0,
                        }}
                    />
                    <button
                        className="chart-panel__input-btn"
                        onClick={() => setAmount(String(Math.min(100, Number(amount) + 1)))}
                    ></button>
                </div>
                <button
                    className="chart-panel__btn"
                    onClick={() => handleTrade("up")}
                    disabled={isTradingDisabled}
                    style={{
                        opacity: isTradingDisabled ? 0.5 : 1,
                        cursor: isTradingDisabled ? 'not-allowed' : 'pointer'
                    }}
                >
                    <i></i>
                    <span>BUY</span>
                </button>
            </div>
        </div>
    );
};
