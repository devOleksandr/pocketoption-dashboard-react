import { useState, useEffect, type FC } from 'react';
import { useTradingStore, type Trade } from '~/stores';
import styles from './Trades.module.scss';

export const Trades: FC = () => {
    const { activeTrades, tradeHistory, timeframe, currencyPairs } = useTradingStore();
    const [activeTab, setActiveTab] = useState<'opened' | 'closed'>('opened');
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Обновляем время каждую секунду для таймера открытых сделок
    useEffect(() => {
        if (activeTab === 'opened' && activeTrades.length > 0) {
            const interval = setInterval(() => {
                setCurrentTime(Date.now());
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [activeTab, activeTrades.length]);

    const formatTime = (timeString: string): string => {
        if (!timeString) return '';
        // Если время в формате HH:mm:ss, берем только HH:mm
        const parts = timeString.split(':');
        if (parts.length >= 2) {
            return `${parts[0]}:${parts[1]}`;
        }
        return timeString;
    };

    const formatDate = (timestamp: number): string => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const calculatePayout = (trade: Trade): number => {
        if (trade.status === 'closed' && trade.profit !== undefined) {
            return trade.profit;
        }
        // Для открытых сделок показываем потенциальную выплату
        const pair = currencyPairs[trade.pair];
        const payout = pair?.payout || 92;
        const profitMultiplier = 1 + (payout / 100);
        return Number(trade.amount) * profitMultiplier;
    };

    const calculateProfit = (trade: Trade): number => {
        if (trade.status === 'closed' && trade.profit !== undefined) {
            const profit = trade.profit - Number(trade.amount);
            // Если прибыль отрицательная (проигрыш), показываем 0
            return profit > 0 ? profit : 0;
        }
        return 0;
    };

    const getPayoutPercentage = (trade: Trade): string => {
        const pair = currencyPairs[trade.pair];
        const payout = pair?.payout || 92;
        if (trade.status === 'closed') {
            if (trade.profit && trade.profit > 0) {
                return `+${payout}%`;
            }
            return '-100%';
        }
        return `+${payout}%`;
    };

    const getRemainingTime = (trade: Trade): string => {
        if (trade.status === 'active') {
            const expirationTime = trade.entryTimestamp + (trade.timeframe * 1000);
            const timeLeft = Math.max(0, Math.ceil((expirationTime - currentTime) / 1000));
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return '';
    };

    const renderTradeItem = (trade: Trade, index: number, globalIndex?: number) => {
        const payout = calculatePayout(trade);
        const profit = calculateProfit(trade);
        const payoutPercentage = getPayoutPercentage(trade);
        const isBuy = trade.type === 'buy';
        const isWin = trade.status === 'closed' && trade.profit !== undefined && trade.profit > 0;
        const time = trade.status === 'closed' && trade.exitTime
            ? formatTime(trade.exitTime)
            : trade.status === 'active'
                ? getRemainingTime(trade)
                : formatTime(trade.entryTime);

        const itemIndex = globalIndex !== undefined ? globalIndex : index;
        return (
            <div key={trade.id || index} className={`${styles.dealsListItem} ${itemIndex % 2 === 0 ? styles.dealsListItemEven : styles.dealsListItemOdd}`}>
                <div className={styles.dealsListItemFirst}>
                    <div className={styles.dealsListItemShort}>
                        <div className={styles.itemRow}>
                            <div>
                                <span className={styles.favorites}>
                                    <a>
                                        <i className={`fa fa-star-o ${styles.starIcon}`} aria-hidden="true"></i>
                                    </a>
                                </span>
                                <a>{trade.pair} OTC</a>
                                <span className={isWin ? styles.priceUp : ''}>{payoutPercentage}</span>
                            </div>
                            <div className={trade.status === 'active' ? styles.timer : ''}>{time}</div>
                        </div>
                        <div className={styles.itemRow}>
                            <div>
                                <i className={`fa fa-arrow-${isBuy ? 'up' : 'down'} ${isBuy ? styles.arrowUp : styles.arrowDown}`} aria-hidden="true"></i>
                                ${Number(trade.amount).toFixed(2)}
                            </div>
                            <div className={`${styles.centered} ${isWin ? styles.priceUp : ''}`}>
                                ${payout.toFixed(2)}
                            </div>
                            <div className={isWin ? styles.priceUp : ''}>
                                {profit > 0 ? `+$${profit.toFixed(2)}` : `$${profit.toFixed(2)}`}
                            </div>
                        </div>
                        {trade.status === 'active' && (
                            <div className={styles.doubleUpButton}>
                                <a className={styles.btnDoubleUp}>
                                    <i className="fa fa-angle-double-up" aria-hidden="true"></i>
                                    Double Up
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Сортируем открытые сделки - последние сверху
    const openedTrades = activeTrades
        .filter(trade => trade.status === 'active')
        .sort((a, b) => b.entryTimestamp - a.entryTimestamp);

    const closedTrades = tradeHistory.filter(trade => trade.status === 'closed');

    // Группируем закрытые сделки по дате
    const groupedClosedTrades = closedTrades.reduce((acc, trade) => {
        if (trade.exitTimestamp) {
            const date = formatDate(trade.exitTimestamp);
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(trade);
        }
        return acc;
    }, {} as Record<string, Trade[]>);

    // Сортируем даты от новых к старым
    const sortedDates = Object.keys(groupedClosedTrades).sort((a, b) => {
        return new Date(b).getTime() - new Date(a).getTime();
    });

    // Сортируем сделки внутри каждой даты - последние сверху
    sortedDates.forEach(date => {
        groupedClosedTrades[date].sort((a, b) => {
            const timestampA = a.exitTimestamp || a.entryTimestamp;
            const timestampB = b.exitTimestamp || b.entryTimestamp;
            return timestampB - timestampA;
        });
    });

    return (
        <div className={styles.widgetSlot}>
            <div className={styles.header}>
                <div className={styles.title}>
                    <span>Trades</span>
                </div>
                <div className={styles.divider}>
                    <ul className={styles.tabList}>
                        <li className={activeTab === 'opened' ? styles.active : ''}>
                            <a
                                className={styles.tabLink}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('opened');
                                }}
                            >
                                Opened
                            </a>
                        </li>
                        <li className={activeTab === 'closed' ? styles.active : ''}>
                            <a
                                className={styles.tabLink}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('closed');
                                }}
                            >
                                Closed
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className={styles.body}>
                <div className={styles.scrollbarContainer}>
                    {activeTab === 'opened' ? (
                        <div className={styles.dealsList}>
                            {openedTrades.length === 0 ? (
                                <div className={styles.noDeals}>No opened trades</div>
                            ) : (
                                openedTrades.map((trade, index) => renderTradeItem(trade, index, index))
                            )}
                        </div>
                    ) : (
                        <div className={styles.dealsList}>
                            {closedTrades.length === 0 ? (
                                <div className={styles.noDeals}>No closed trades</div>
                            ) : (() => {
                                let globalIndex = 0;
                                return sortedDates.map((date) => (
                                    <div key={date} className={styles.dateGroup}>
                                        <div className={styles.dateLabel}>{date}</div>
                                        {groupedClosedTrades[date].map((trade, index) => {
                                            const currentIndex = globalIndex++;
                                            return renderTradeItem(trade, index, currentIndex);
                                        })}
                                    </div>
                                ));
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

