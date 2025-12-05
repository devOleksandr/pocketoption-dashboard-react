import { useState, useEffect, type FC } from 'react';
import { useTradingStore } from '~/stores';

export const Balance: FC = () => {
    const { balance, setShowFundsModal } = useTradingStore();

    const handleAddFunds = () => {
        setShowFundsModal(true);
    };

    return (
        <div className="header-balance">
            <div className="header-balance__item header-balance__item--title">
                <span>Your balance</span>
                <div className="header-balance-icon header-balance-icon--question">
                    <svg xmlns="http://www.w3.org/2000/svg" width="6" height="11" viewBox="0 0 6 11">
                        <path d="M3 0C1.34315 0 0 1.34315 0 3C0 4.65685 1.34315 6 3 6C4.65685 6 6 4.65685 6 3C6 1.34315 4.65685 0 3 0Z" fill="#315BF0" />
                        <path d="M3 8V11" stroke="#315BF0" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
            </div>

            <div className="header-balance__item header-balance__item--price">
                <span>${Math.floor(balance)}</span>

                <div className="header-balance-icon header-balance-icon--plus" onClick={handleAddFunds}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path
                            d="M3.35824 8V4.64176H0V3.34945H3.35824V0H4.65055V3.34945H8V4.64176H4.65055V8H3.35824Z"
                            fill="#315BF0" />
                    </svg>
                </div>
            </div>
        </div>
    );
};
