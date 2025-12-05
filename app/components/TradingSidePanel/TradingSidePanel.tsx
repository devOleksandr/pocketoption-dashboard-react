import { useState, useEffect, type FC } from 'react';
import { useTradingStore } from '~/stores';
import { resetScenario, getScenarioInfo } from '~/utils/scenarioManager';
import { TimeframeModal } from '../TimeframeModal/TimeframeModal';

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

    // Scenario info for debugging
    const [scenarioInfo, setScenarioInfo] = useState(getScenarioInfo());

    useEffect(() => {
        const interval = setInterval(() => {
            setScenarioInfo(getScenarioInfo());
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const handleResetScenario = () => {
        resetScenario();
        setScenarioInfo(getScenarioInfo());
    };

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
                    <div className="trading-side-panel__payout-info trading-side-panel__payout-info--desktop">
                        {lastTradeDisplay ? (
                            <>
                                <div className="trading-side-panel__payout-item">
                                    <div className="trading-side-panel__payout-label">Payout</div>
                                    <div className={`trading-side-panel__payout-value ${lastTradeDisplay.isWin ? 'trading-side-panel__payout-value--win' : 'trading-side-panel__payout-value--loss'}`}>
                                        ${(Number(amount) + lastTradeDisplay.profit).toFixed(2)}
                                    </div>
                                </div>
                                <div className={`trading-side-panel__payout-percentage ${lastTradeDisplay.isWin ? 'trading-side-panel__payout-percentage--win' : 'trading-side-panel__payout-percentage--loss'}`}>
                                    {lastTradeDisplay.isWin ? '+' : ''}{lastTradeDisplay.percentage}%
                                </div>
                                <div className="trading-side-panel__payout-item">
                                    <div className="trading-side-panel__payout-label">Profit</div>
                                    <div className={`trading-side-panel__payout-value ${lastTradeDisplay.isWin ? 'trading-side-panel__payout-value--win' : 'trading-side-panel__payout-value--loss'}`}>
                                        {lastTradeDisplay.isWin ? '+' : ''}${lastTradeDisplay.profit.toFixed(2)}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="trading-side-panel__payout-item">
                                    <div className="trading-side-panel__payout-label">Payout</div>
                                    <div className="trading-side-panel__payout-value">
                                        ${potentialProfit}
                                    </div>
                                </div>
                                <div className="trading-side-panel__payout-percentage">
                                    +{payoutPercentage}%
                                </div>
                                <div className="trading-side-panel__payout-item">
                                    <div className="trading-side-panel__payout-label">Profit</div>
                                    <div className="trading-side-panel__payout-value">
                                        +${(Number(amount) * 0.92).toFixed(2)}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Payout Section - Mobile Version */}
                <div className="trading-side-panel__section trading-side-panel__section--mobile">
                    <div className="trading-side-panel__payout-info trading-side-panel__payout-info--mobile">
                        {lastTradeDisplay ? (
                            <>
                                <div className="trading-side-panel__payout-item">
                                    <div className="trading-side-panel__payout-label">Payout</div>
                                    <div className={`trading-side-panel__payout-value ${lastTradeDisplay.isWin ? 'trading-side-panel__payout-value--win' : 'trading-side-panel__payout-value--loss'}`}>
                                        ${(Number(amount) + lastTradeDisplay.profit).toFixed(2)}
                                    </div>
                                </div>
                                <div className={`trading-side-panel__payout-percentage ${lastTradeDisplay.isWin ? 'trading-side-panel__payout-percentage--win' : 'trading-side-panel__payout-percentage--loss'}`}>
                                    {lastTradeDisplay.isWin ? '+' : ''}{lastTradeDisplay.percentage}%
                                </div>
                                <div className="trading-side-panel__payout-item">
                                    <div className="trading-side-panel__payout-label">Profit</div>
                                    <div className={`trading-side-panel__payout-value ${lastTradeDisplay.isWin ? 'trading-side-panel__payout-value--win' : 'trading-side-panel__payout-value--loss'}`}>
                                        {lastTradeDisplay.isWin ? '+' : ''}${lastTradeDisplay.profit.toFixed(2)}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="trading-side-panel__payout-item">
                                    <div className="trading-side-panel__payout-label">Payout</div>
                                    <div className="trading-side-panel__payout-value">
                                        ${potentialProfit}
                                    </div>
                                </div>
                                <div className="trading-side-panel__payout-percentage">
                                    +{payoutPercentage}%
                                </div>
                                <div className="trading-side-panel__payout-item">
                                    <div className="trading-side-panel__payout-label">Profit</div>
                                    <div className="trading-side-panel__payout-value">
                                        +${(Number(amount) * 0.92).toFixed(2)}
                                    </div>
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className="injected-svg" data-src="/themes/cabinet/svg/icons/btn-buy.svg?v=1" xmlnsXlink="http://www.w3.org/1999/xlink" role="img">
                                <path d="M10 0C8.02219 0 6.08879 0.58649 4.4443 1.6853C2.79981 2.78412 1.51809 4.3459 0.761209 6.17317C0.00433284 8.00043 -0.193701 10.0111 0.192152 11.9509C0.578004 13.8907 1.53041 15.6725 2.92894 17.0711C4.32746 18.4696 6.10929 19.422 8.0491 19.8079C9.98891 20.1937 11.9996 19.9957 13.8268 19.2388C15.6541 18.4819 17.2159 17.2002 18.3147 15.5557C19.4135 13.9112 20 11.9778 20 10C19.9971 7.34874 18.9425 4.80691 17.0678 2.93219C15.1931 1.05746 12.6513 0.00294858 10 0Z" fill="#248F32"></path>
                                <path d="M13.8319 12.832L13.8288 7.17244C13.8278 6.90725 13.722 6.65311 13.5343 6.46549C13.3467 6.27786 13.0926 6.172 12.8274 6.17101L7.16786 6.16792C6.90411 6.17016 6.65203 6.27647 6.46647 6.46372C6.28091 6.65097 6.17688 6.90401 6.17703 7.16777C6.17717 7.43154 6.28148 7.68469 6.46725 7.87214C6.65301 8.0596 6.90521 8.16619 7.16897 8.16873L10.4135 8.17057L6.46366 12.1204C6.27612 12.308 6.17085 12.5624 6.17099 12.8278C6.17114 13.0931 6.2767 13.3477 6.46444 13.5354C6.65218 13.7232 6.90674 13.8287 7.1721 13.8289C7.43746 13.829 7.6919 13.7237 7.87944 13.5362L11.8293 9.58635L11.8311 12.8309C11.8329 13.0952 11.9392 13.3481 12.1267 13.5344C12.3143 13.7208 12.5678 13.8255 12.8321 13.8256C13.0963 13.8258 13.3498 13.7214 13.5371 13.5352C13.7244 13.349 13.8304 13.0962 13.8319 12.832Z" fill="white"></path>
                            </svg>
                        </div>
                        <span className="trading-side-panel__btn-text">BUY</span>
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className="injected-svg" data-src="/themes/cabinet/svg/icons/btn-sell.svg?v=1" xmlnsXlink="http://www.w3.org/1999/xlink" role="img">
                                <path d="M10 20C11.9778 20 13.9112 19.4135 15.5557 18.3147C17.2002 17.2159 18.4819 15.6541 19.2388 13.8268C19.9957 11.9996 20.1937 9.98891 19.8079 8.0491C19.422 6.10929 18.4696 4.32746 17.0711 2.92894C15.6725 1.53041 13.8907 0.578004 11.9509 0.192152C10.0111 -0.193701 8.00043 0.00433284 6.17317 0.761209C4.3459 1.51809 2.78412 2.79981 1.6853 4.4443C0.58649 6.08879 0 8.02219 0 10C0.00294858 12.6513 1.05746 15.1931 2.93219 17.0678C4.80691 18.9425 7.34874 19.9971 10 20Z" fill="#D1281F"></path>
                                <path d="M7.16786 13.8324L12.828 13.8287C13.0932 13.8277 13.3474 13.7218 13.535 13.5341C13.7227 13.3465 13.8286 13.0923 13.8296 12.8271L13.8333 7.16702C13.831 6.90324 13.7247 6.65115 13.5375 6.46559C13.3502 6.28003 13.0972 6.17602 12.8334 6.17619C12.5696 6.17636 12.3164 6.2807 12.1289 6.4665C11.9414 6.65231 11.8348 6.90454 11.8322 7.16832L11.8301 10.4132L7.88023 6.46333C7.6927 6.27579 7.43825 6.17053 7.17286 6.17071C6.90747 6.17088 6.65288 6.27647 6.4651 6.46425C6.27732 6.65203 6.17173 6.90662 6.17155 7.17201C6.17138 7.4374 6.27664 7.69185 6.46418 7.87939L10.414 11.8292L7.16917 11.8314C6.90539 11.834 6.65315 11.9406 6.46735 12.1281C6.28155 12.3156 6.17721 12.5688 6.17704 12.8325C6.17686 13.0963 6.28087 13.3494 6.46643 13.5366C6.65199 13.7239 6.90409 13.8302 7.16786 13.8324Z" fill="white"></path>
                            </svg>
                        </div>
                        <span className="trading-side-panel__btn-text">SELL</span>
                    </button>
                </div>
            </div>

            <TimeframeModal
                isOpen={showTimeframeModal}
                onClose={() => setShowTimeframeModal(false)}
            />
        </div>
    );
};
