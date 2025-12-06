import { useState, useEffect, type FC } from 'react';
import { useTradingStore } from '~/stores';
import { getScenarioInfo } from '~/utils/scenarioManager';
import { TimeframeModal } from '../TimeframeModal/TimeframeModal';
import { DesktopTimeframeSelector } from '../DesktopTimeframeSelector/DesktopTimeframeSelector';

export const TradingSidePanel: FC = () => {
    const {
        timeframe,
        setTimeframe,
        amount,
        setAmount,
        handleTrade,
        lastTradeDisplay,
        isTradingDisabled
    } = useTradingStore();

    const [showTimeframeModal, setShowTimeframeModal] = useState(false);

    // Don't auto-clear trade result - keep it until next trade

    const handleTimeframeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9]/g, "");
        if (val !== "") {
            let num = Number(val);
            if (num > 36000) num = 36000; // Максимум 10 часов
            if (num < 5) num = 5;     // Минимум 5 секунд
            val = String(num);
        }
        setTimeframe(Number(val) || 5);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9.]/g, "");
        if (val !== "") {
            let num = Number(val);
            if (num > 100) num = 100;
            if (num < 1) num = 1;
            val = String(num);
        }
        setAmount(val);
    };

    const formatTime = (seconds: number) => {
        if (seconds < 60) {
            // Для секунд показываем только секунды
            return `00:${seconds.toString().padStart(2, '0')}`;
        } else if (seconds < 3600) {
            // Для минут показываем минуты и секунды
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            // Для часов показываем часы, минуты и секунды
            const hours = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    };

    const payoutPercentage = 92; // Fixed payout percentage as shown in screenshot
    // Показуємо загальну суму повернення: початковий amount + прибуток 92%
    const potentialProfit = (Number(amount) * 1.92).toFixed(2);

    return (
        <div className="trading-side-panel">
            <div className="trading-side-panel__content">
                {/* Input Row - Time and Amount sections */}
                <div className="trading-side-panel__input-row">
                    {/* Time Section */}
                    <div className="trading-side-panel__section">
                        <div className="trading-side-panel__label">
                            Time
                            <i className="fa fa-question-circle-o" aria-hidden="true" style={{ fontSize: '10px', width: '13px', height: '13px' }}></i>
                        </div>
                        <div className="trading-side-panel__time-display">
                            <input
                                type="text"
                                value={formatTime(timeframe)}
                                onClick={() => setShowTimeframeModal(true)}
                                readOnly
                                className="trading-side-panel__time-field"
                                placeholder="00:00:05"
                            />
                            <button
                                className="trading-side-panel__time-icon"
                                onClick={() => setShowTimeframeModal(true)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M10.4 7.2H8.8V4C8.8 3.78783 8.71572 3.58434 8.56569 3.43431C8.41566 3.28428 8.21217 3.2 8 3.2C7.78783 3.2 7.58435 3.28428 7.43432 3.43431C7.28429 3.58434 7.2 3.78783 7.2 4V8C7.2 8.21217 7.28429 8.41565 7.43432 8.56568C7.58435 8.71571 7.78783 8.8 8 8.8H10.4C10.6122 8.8 10.8157 8.71571 10.9657 8.56568C11.1157 8.41565 11.2 8.21217 11.2 8C11.2 7.78782 11.1157 7.58434 10.9657 7.43431C10.8157 7.28428 10.6122 7.2 10.4 7.2ZM8 0C6.41775 0 4.87103 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346627 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C16 6.94942 15.7931 5.90914 15.391 4.93853C14.989 3.96793 14.3997 3.08601 13.6569 2.34315C12.914 1.60028 12.0321 1.011 11.0615 0.608964C10.0909 0.206926 9.05058 0 8 0ZM8 14.4C6.7342 14.4 5.49683 14.0246 4.44435 13.3214C3.39188 12.6182 2.57157 11.6186 2.08717 10.4492C1.60277 9.27972 1.47603 7.9929 1.72298 6.75142C1.96992 5.50994 2.57946 4.36957 3.47452 3.47452C4.36958 2.57946 5.50995 1.96992 6.75142 1.72297C7.9929 1.47603 9.27973 1.60277 10.4492 2.08717C11.6186 2.57157 12.6182 3.39187 13.3214 4.44435C14.0246 5.49682 14.4 6.7342 14.4 8C14.4 9.69738 13.7257 11.3252 12.5255 12.5255C11.3253 13.7257 9.69739 14.4 8 14.4Z" fill="currentColor"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Amount Section */}
                    <div className="trading-side-panel__section">
                        <div className="trading-side-panel__label">
                            Amount
                            <i className="fa fa-question-circle-o" aria-hidden="true" style={{ fontSize: '10px', width: '13px', height: '13px' }}></i>
                        </div>
                        <div className="trading-side-panel__amount-input">
                            <input
                                type="text"
                                value={amount}
                                onChange={handleAmountChange}
                                className="trading-side-panel__amount-field"
                            />
                            <div className="trading-side-panel__amount-icon">
                                <img
                                    src="/assets/images/dollar.svg"
                                    alt="Dollar"
                                    width="16"
                                    height="16"
                                    className="currency-icon currency-icon--usd"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payout Section - Desktop Version */}
                <div className="trading-side-panel__section trading-side-panel__section--desktop">
                    <div className="trading-side-panel__label">
                        Payout
                        <i className="fa fa-question-circle-o" aria-hidden="true" style={{ fontSize: '10px', width: '13px', height: '13px' }}></i>
                    </div>
                    <div className="trading-side-panel__payout-info trading-side-panel__payout-info--desktop">
                        {lastTradeDisplay ? (
                            <>
                                <div className="trading-side-panel__payout-percentage">
                                    {lastTradeDisplay.isWin ? '+' : ''}{lastTradeDisplay.percentage}%
                                </div>
                                <div className="trading-side-panel__payout-amount">
                                    {lastTradeDisplay.isWin ? '+' : ''}{lastTradeDisplay.profit.toFixed(2)} UAH
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="trading-side-panel__payout-percentage">
                                    +{payoutPercentage}%
                                </div>
                                <div className="trading-side-panel__payout-amount">
                                    +{(Number(amount) * 0.92).toFixed(2)} UAH
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Payout Section - Mobile Version */}
                <div className="trading-side-panel__section trading-side-panel__section--mobile">
                    <div className="trading-side-panel__label">
                        Payout
                        <i className="fa fa-question-circle-o" aria-hidden="true" style={{ fontSize: '10px', width: '13px', height: '13px' }}></i>
                    </div>
                    <div className="trading-side-panel__payout-info trading-side-panel__payout-info--mobile">
                        {lastTradeDisplay ? (
                            <>
                                <div className="trading-side-panel__payout-percentage">
                                    {lastTradeDisplay.isWin ? '+' : ''}{lastTradeDisplay.percentage}%
                                </div>
                                <div className="trading-side-panel__payout-amount">
                                    {lastTradeDisplay.isWin ? '+' : ''}{lastTradeDisplay.profit.toFixed(2)} UAH
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="trading-side-panel__payout-percentage">
                                    +{payoutPercentage}%
                                </div>
                                <div className="trading-side-panel__payout-amount">
                                    +{(Number(amount) * 0.92).toFixed(2)} UAH
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="trading-side-panel__actions">
                    <button
                        className="trading-side-panel__btn trading-side-panel__btn--buy"
                        onClick={() => handleTrade("up")}
                        disabled={isTradingDisabled}
                        style={{
                            opacity: isTradingDisabled ? 0.5 : 1,
                            cursor: isTradingDisabled ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <div className="trading-side-panel__btn-icon">
                            <img src="/assets/images/newPictures/buy_button.svg" alt="Buy" width="20" height="20" />
                        </div>
                        <span className="trading-side-panel__btn-text">BUY</span>
                    </button>
                    <button
                        className="trading-side-panel__btn trading-side-panel__btn--ai"
                        onClick={() => { }}
                        disabled={isTradingDisabled}
                        style={{
                            opacity: isTradingDisabled ? 0.5 : 1,
                            cursor: isTradingDisabled ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <div className="trading-side-panel__btn-icon trading-side-panel__btn-icon--ai">
                            <img src="/assets/images/newPictures/ai_button.svg" alt="AI Trading" width="40" height="40" />
                        </div>
                        <span className="trading-side-panel__btn-text">TRADING</span>
                    </button>
                    <button
                        className="trading-side-panel__btn trading-side-panel__btn--sell"
                        onClick={() => handleTrade("down")}
                        disabled={isTradingDisabled}
                        style={{
                            opacity: isTradingDisabled ? 0.5 : 1,
                            cursor: isTradingDisabled ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <div className="trading-side-panel__btn-icon">
                            <img src="/assets/images/newPictures/sell_button.svg" alt="Sell" width="20" height="20" />
                        </div>
                        <span className="trading-side-panel__btn-text">SELL</span>
                    </button>
                </div>
            </div>

            {/* Desktop Timeframe Selector */}
            <DesktopTimeframeSelector
                isOpen={showTimeframeModal && typeof window !== 'undefined' && window.innerWidth > 768}
                onClose={() => setShowTimeframeModal(false)}
            />

            {/* Mobile Timeframe Modal */}
            <TimeframeModal
                isOpen={showTimeframeModal && typeof window !== 'undefined' && window.innerWidth <= 768}
                onClose={() => setShowTimeframeModal(false)}
            />
        </div>
    );
};
