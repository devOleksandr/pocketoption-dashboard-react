import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    getCurrentTradeIndex,
    incrementTradeIndex,
    shouldTradeWin,
    getScenarioDirection,
    generateScenarioPrice,
    type Direction
} from '~/utils/scenarioManager';

export interface Trade {
    id: string;
    type: 'buy' | 'sell';
    entryPrice: number;
    entryTime: string;
    entryTimestamp: number;
    amount: string;
    status: 'active' | 'closed';
    pair: string;
    timeframe: number;
    chartType: string;
    exitPrice?: number;
    exitTime?: string;
    exitTimestamp?: number;
    profit?: number;
    duration?: number;
    scenarioDirection?: Direction; // Напрямок руху графіка за сценарієм
    tradeIndex?: number; // Індекс угоди в сценарії
}

export interface CandlestickData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    timestamp: number;
}

export interface CurrencyPair {
    name: string;
    baseRate: number;
    volatility: number;
    apiBase?: string;
    apiTarget?: string;
    flags?: string[];
}

export interface TradeResult {
    trade: Trade;
    isWin: boolean;
    profit: number;
}

export interface ChartViewport {
    offset: number; // Скільки свічок прокручено назад від кінця
    isLocked: boolean; // Чи заблокований auto-scroll
}

export interface ChartZoom {
    timeframeIndex: number; // Індекс в TIMEFRAMES масиві
    visibleCandles: number; // Скільки свічок показувати
}

export const TIMEFRAMES = [
    // Секунды
    { value: 5, label: '5s', unit: 's', interval: 5000 },
    { value: 10, label: '10s', unit: 's', interval: 10000 },
    { value: 25, label: '25s', unit: 's', interval: 25000 },

    // Минуты
    { value: 60, label: '1m', unit: 'm', interval: 60000 },
    { value: 120, label: '2m', unit: 'm', interval: 120000 },
    { value: 180, label: '3m', unit: 'm', interval: 180000 },
    { value: 240, label: '4m', unit: 'm', interval: 240000 },
    { value: 300, label: '5m', unit: 'm', interval: 300000 },
    { value: 600, label: '10m', unit: 'm', interval: 600000 },
    { value: 900, label: '15m', unit: 'm', interval: 900000 },
    { value: 1200, label: '20m', unit: 'm', interval: 1200000 },

    // Часы
    { value: 3600, label: '1h', unit: 'h', interval: 3600000 },
    { value: 7200, label: '2h', unit: 'h', interval: 7200000 },
    { value: 10800, label: '3h', unit: 'h', interval: 10800000 },
    { value: 14400, label: '4h', unit: 'h', interval: 14400000 },
    { value: 18000, label: '5h', unit: 'h', interval: 18000000 },
    { value: 36000, label: '10h', unit: 'h', interval: 36000000 }
];

export interface TradingState {
    // Balance and user data
    balance: number;
    setBalance: (balance: number) => void;
    addToBalance: (amount: number) => void;

    // Trading data
    currentRate: number;
    setCurrentRate: (rate: number) => void;

    candlestickData: CandlestickData[];
    setCandlestickData: (data: CandlestickData[]) => void;
    addCandlestick: (candle: CandlestickData) => void;

    // Chart viewport for scrolling
    chartViewport: ChartViewport;
    setChartViewport: (viewport: ChartViewport) => void;
    lockChart: () => void;
    unlockChart: () => void;

    // Chart zoom functionality
    chartZoom: ChartZoom;
    setChartZoom: (zoom: ChartZoom) => void;
    zoomIn: () => void;
    zoomOut: () => void;

    // Trading settings
    timeframe: number;
    setTimeframe: (timeframe: number) => void;

    amount: string;
    setAmount: (amount: string) => void;

    selectedPair: string;
    setSelectedPair: (pair: string) => void;

    chartType: 'candlestick' | 'line';
    setChartType: (type: 'candlestick' | 'line') => void;

    // Trades
    activeTrades: Trade[];
    setActiveTrades: (trades: Trade[]) => void;
    addActiveTrade: (trade: Trade) => void;
    removeActiveTrade: (tradeId: string) => void;
    updateActiveTrade: (tradeId: string, updates: Partial<Trade>) => void;

    tradeHistory: Trade[];
    setTradeHistory: (trades: Trade[]) => void;
    addToTradeHistory: (trades: Trade[]) => void;

    // UI state
    showTradeResult: boolean;
    setShowTradeResult: (show: boolean) => void;

    lastTradeResult: TradeResult | null;
    setLastTradeResult: (result: TradeResult | null) => void;

    // Last trade result for Payout display
    lastTradeDisplay: {
        isWin: boolean;
        profit: number;
        percentage: number;
    } | null;
    setLastTradeDisplay: (display: { isWin: boolean; profit: number; percentage: number } | null) => void;
    clearLastTradeDisplay: () => void;

    showPairDropdown: boolean;
    setShowPairDropdown: (show: boolean) => void;

    showFundsModal: boolean;
    setShowFundsModal: (show: boolean) => void;

    // Trading button state
    isTradingDisabled: boolean;
    setIsTradingDisabled: (disabled: boolean) => void;

    // Trading actions
    handleTrade: (direction: 'up' | 'down') => void;
    checkExpiredTrades: (currentPrice: number, currentTime: number) => void;

    // Currency pairs
    currencyPairs: Record<string, CurrencyPair>;

    // Promo modal after trades
    completedTradesCount: number;
    promoModalVisible: boolean;
    promoModalShown: boolean;
    setPromoModalVisible: (visible: boolean) => void;

    // Welcome bonus modal
    welcomeBonusModalVisible: boolean;
    setWelcomeBonusModalVisible: (visible: boolean) => void;
}

export const CURRENCY_PAIRS: Record<string, CurrencyPair> = {
    "EUR/USD": {
        name: "EUR/USD",
        baseRate: 1.095,
        volatility: 0.001,
        apiBase: "EUR",
        apiTarget: "USD",
    },
    "AUD/USD": {
        name: "AUD/USD",
        baseRate: 0.665,
        volatility: 0.0015,
        apiBase: "AUD",
        apiTarget: "USD",
    },
    "EUR/AUD": {
        name: "EUR/AUD",
        baseRate: 1.645,
        volatility: 0.0012,
        apiBase: "EUR",
        apiTarget: "AUD",
    },
    "EUR/JPY": {
        name: "EUR/JPY",
        baseRate: 169.85,
        volatility: 0.15,
        apiBase: "EUR",
        apiTarget: "JPY",
    },
    "EUR/CHF": {
        name: "EUR/CHF",
        baseRate: 0.965,
        volatility: 0.001,
        apiBase: "EUR",
        apiTarget: "CHF",
    },
    "AUD/JPY": {
        name: "AUD/JPY",
        baseRate: 104.85,
        volatility: 0.12,
        apiBase: "AUD",
        apiTarget: "JPY",
    },
    "EUR/CAD": {
        name: "EUR/CAD",
        baseRate: 1.465,
        volatility: 0.0011,
        apiBase: "EUR",
        apiTarget: "CAD",
    },
    "USD/CHF": {
        name: "USD/CHF",
        baseRate: 0.885,
        volatility: 0.001,
        apiBase: "USD",
        apiTarget: "CHF",
    },
    "CAD/JPY": {
        name: "CAD/JPY",
        baseRate: 114.85,
        volatility: 0.13,
        apiBase: "CAD",
        apiTarget: "JPY",
    },
    "AUD/CAD": {
        name: "AUD/CAD",
        baseRate: 0.915,
        volatility: 0.0013,
        apiBase: "AUD",
        apiTarget: "CAD",
    },
};

export const useTradingStore = create<TradingState>()(
    persist(
        (set, get) => ({
            // Balance and user data
            balance: 43201,
            setBalance: (balance: number) => set({ balance }),
            addToBalance: (amount: number) => set((state) => ({ balance: state.balance + amount })),

            // Trading data
            currentRate: 1.095,
            setCurrentRate: (rate: number) => set({ currentRate: rate }),

            candlestickData: [] as CandlestickData[],
            setCandlestickData: (data: CandlestickData[] | ((prev: CandlestickData[]) => CandlestickData[])) => {
                if (typeof data === 'function') {
                    set((state) => {
                        const newData = data(state.candlestickData);
                        return { candlestickData: Array.isArray(newData) ? newData : [] };
                    });
                } else {
                    const newData = Array.isArray(data) ? data : [];
                    set({ candlestickData: newData });
                }
            },
            addCandlestick: (candle: CandlestickData) => set((state) => ({
                candlestickData: Array.isArray(state.candlestickData) ? [...state.candlestickData, candle].slice(-200) : [candle] // Збільшено з 50 до 200
            })),

            // Chart viewport
            chartViewport: { offset: 0, isLocked: false },
            setChartViewport: (viewport: ChartViewport) => set({ chartViewport: viewport }),
            lockChart: () => set((state) => ({ chartViewport: { ...state.chartViewport, isLocked: true } })),
            unlockChart: () => set({ chartViewport: { offset: 0, isLocked: false } }),

            // Chart zoom
            chartZoom: { timeframeIndex: 1, visibleCandles: 50 }, // Початково 10s, 50 свічок
            setChartZoom: (zoom: ChartZoom) => set({ chartZoom: zoom }),
            zoomIn: () => set((state) => {
                const currentIndex = state.chartZoom.timeframeIndex;
                if (currentIndex > 0) {
                    return {
                        chartZoom: {
                            timeframeIndex: currentIndex - 1,
                            visibleCandles: Math.min(200, Math.floor(state.chartZoom.visibleCandles * 1.2))
                        }
                    };
                }
                return state;
            }),
            zoomOut: () => set((state) => {
                const currentIndex = state.chartZoom.timeframeIndex;
                if (currentIndex < TIMEFRAMES.length - 1) {
                    return {
                        chartZoom: {
                            timeframeIndex: currentIndex + 1,
                            visibleCandles: Math.max(20, Math.floor(state.chartZoom.visibleCandles * 0.8))
                        }
                    };
                }
                return state;
            }),

            // Trading settings
            timeframe: 25, // Початково 25 секунд
            setTimeframe: (timeframe: number) => set({ timeframe }),

            amount: "10",
            setAmount: (amount: string) => set({ amount }),

            selectedPair: "EUR/USD",
            setSelectedPair: (pair: string) => set({ selectedPair: pair }),

            chartType: "line",
            setChartType: (type: 'candlestick' | 'line') => set({ chartType: type }),

            // Trades
            activeTrades: [],
            setActiveTrades: (trades: Trade[]) => set({ activeTrades: Array.isArray(trades) ? trades : [] }),
            addActiveTrade: (trade: Trade) => set((state) => ({
                activeTrades: Array.isArray(state.activeTrades) ? [...state.activeTrades, trade] : [trade]
            })),
            removeActiveTrade: (tradeId: string) => set((state) => ({
                activeTrades: Array.isArray(state.activeTrades) ? state.activeTrades.filter(t => t.id !== tradeId) : []
            })),
            updateActiveTrade: (tradeId: string, updates: Partial<Trade>) => set((state) => ({
                activeTrades: Array.isArray(state.activeTrades) ? state.activeTrades.map(t => t.id === tradeId ? { ...t, ...updates } : t) : []
            })),

            tradeHistory: [],
            setTradeHistory: (trades: Trade[]) => set({ tradeHistory: trades }),
            addToTradeHistory: (trades: Trade[]) => set((state) => ({
                tradeHistory: [...state.tradeHistory, ...trades].slice(-50)
            })),

            // UI state
            showTradeResult: false,
            setShowTradeResult: (show: boolean) => set({ showTradeResult: show }),

            lastTradeResult: null,
            setLastTradeResult: (result: TradeResult | null) => set({ lastTradeResult: result }),

            // Last trade result for Payout display
            lastTradeDisplay: null,
            setLastTradeDisplay: (display: { isWin: boolean; profit: number; percentage: number } | null) => set({ lastTradeDisplay: display }),
            clearLastTradeDisplay: () => set({ lastTradeDisplay: null }),

            showPairDropdown: false,
            setShowPairDropdown: (show: boolean) => set({ showPairDropdown: show }),

            showFundsModal: false,
            setShowFundsModal: (show: boolean) => set({ showFundsModal: show }),

            // Trading button state
            isTradingDisabled: false,
            setIsTradingDisabled: (disabled: boolean) => set({ isTradingDisabled: disabled }),

            // Currency pairs
            currencyPairs: CURRENCY_PAIRS,

            // Promo modal state
            completedTradesCount: 0,
            promoModalVisible: false,
            promoModalShown: false,
            setPromoModalVisible: (visible: boolean) => set({ promoModalVisible: visible, isTradingDisabled: visible ? true : get().isTradingDisabled }),

            // Welcome bonus modal state
            welcomeBonusModalVisible: false,
            setWelcomeBonusModalVisible: (visible: boolean) => set({ welcomeBonusModalVisible: visible }),

            // Trading actions
            handleTrade: (direction: 'up' | 'down') => {
                const state = get();
                const { balance, amount, currentRate, selectedPair, timeframe, chartType, candlestickData, activeTrades, isTradingDisabled, promoModalVisible } = state;

                // Перевіряємо, чи є активні угоди або кнопки заблоковані
                const hasActiveTrades = activeTrades.some(trade => trade.status === 'active');
                if (hasActiveTrades || isTradingDisabled || promoModalVisible) {
                    return; // Не дозволяємо нові угоди, поки є активні або кнопки заблоковані
                }

                if (Number(amount) > balance) {
                    set({ showFundsModal: true });
                    return;
                }

                // Блокуємо кнопки торгів
                set({ isTradingDisabled: true });

                // Віднімаємо кошти від балансу при відкритті угоди
                set({ balance: balance - Number(amount) });

                const now = new Date();
                const tradeType = direction === "up" ? "buy" : "sell";

                // Отримуємо поточний індекс угоди та напрямок за сценарієм
                const tradeIndex = getCurrentTradeIndex();
                const scenarioDirection = getScenarioDirection(tradeIndex);

                // Використовуємо ціну останньої свічки якщо є дані, інакше currentRate
                const entryPrice = candlestickData.length > 0
                    ? candlestickData[candlestickData.length - 1].close
                    : currentRate;

                const newTrade: Trade = {
                    id: `trade_${now.getTime()}`,
                    type: tradeType,
                    entryPrice: entryPrice, // Використовуємо ціну останньої свічки
                    entryTime: now.toLocaleTimeString(),
                    entryTimestamp: now.getTime(),
                    amount,
                    status: "active",
                    pair: selectedPair,
                    timeframe,
                    chartType,
                    scenarioDirection, // Зберігаємо напрямок за сценарієм
                    tradeIndex, // Зберігаємо індекс угоди
                };

                // Збільшуємо лічильник угод
                incrementTradeIndex();

                state.addActiveTrade(newTrade);
            },

            checkExpiredTrades: (currentPrice: number, currentTime: number) => {
                const state = get();
                const { activeTrades, selectedPair, timeframe, currencyPairs } = state;
                const currentPair = currencyPairs[selectedPair];

                const stillActive: Trade[] = [];
                const toClose: Trade[] = [];

                if (!Array.isArray(activeTrades)) {
                    return;
                }

                activeTrades.forEach((trade) => {
                    if (trade.pair !== selectedPair) {
                        stillActive.push(trade);
                        return;
                    }

                    const tradeDuration = currentTime - trade.entryTimestamp;
                    if (tradeDuration >= timeframe * 1000) {
                        // === СЦЕНАРІЇ УВІМКНЕНІ ===
                        const tradeIndex = trade.tradeIndex ?? 0;

                        // Генеруємо сценарійну ціну на основі timeframe та волатильності
                        const scenarioPrice = generateScenarioPrice(
                            tradeIndex,
                            trade.timeframe,
                            trade.entryPrice,
                            currentPair.volatility
                        );

                        const isWinning = shouldTradeWin(
                            tradeIndex,
                            trade.type,
                            trade.timeframe,
                            trade.entryPrice,
                            scenarioPrice
                        );

                        // === СЦЕНАРІЇ ВИМКНЕНІ ===
                        // Використовуємо випадкову логіку замість сценарію
                        // const priceDirection = currentPrice > trade.entryPrice ? "up" : "down";
                        // const tradeDirection = trade.type === "buy" ? "up" : "down";

                        // let winChance = 0.3;
                        // if (priceDirection === tradeDirection) {
                        //     winChance = 0.75;
                        // }

                        // const priceChange = Math.abs(currentPrice - trade.entryPrice);
                        // const significantMove = priceChange > currentPair.volatility * 0.3;

                        // if (significantMove && priceDirection === tradeDirection) {
                        //     winChance = 0.85;
                        // }

                        // const isWinning = Math.random() < winChance;

                        // При виграші: повертаємо початковий amount + прибуток 92%
                        // При програші: 0 (кошти вже списані при відкритті угоди)
                        const profit = isWinning ? Number(trade.amount) * 1.92 : 0;

                        const closedTrade: Trade = {
                            ...trade,
                            status: "closed",
                            exitPrice: scenarioPrice, // Використовуємо сценарійну ціну
                            exitTime: new Date(currentTime).toLocaleTimeString(),
                            exitTimestamp: currentTime,
                            profit,
                            duration: tradeDuration,
                        };

                        toClose.push(closedTrade);

                        // Calculate percentage for display
                        const percentage = isWinning ? 92 : -100;

                        set((state) => ({
                            balance: state.balance + profit,
                            lastTradeResult: {
                                trade: closedTrade,
                                isWin: isWinning,
                                profit,
                            },
                            showTradeResult: false, // Don't show modal
                            lastTradeDisplay: {
                                isWin: isWinning,
                                profit,
                                percentage,
                            },
                        }));
                    } else {
                        stillActive.push(trade);
                    }
                });

                if (toClose.length > 0) {
                    set((state) => ({
                        activeTrades: stillActive,
                        tradeHistory: [...state.tradeHistory, ...toClose].slice(-50),
                        isTradingDisabled: false, // Розблоковуємо кнопки після завершення угод
                    }));

                    // Update completed trades count and show promo modal after 3 trades (only once)
                    // Skip modal if VITE_SCENARIO_CYCLE_MODE is true
                    const { completedTradesCount, promoModalShown } = get();
                    const newCount = completedTradesCount + toClose.length;
                    const isCycleMode = import.meta.env.VITE_SCENARIO_CYCLE_MODE === 'true';
                    if (newCount >= 3 && !promoModalShown && !isCycleMode) {
                        set({ promoModalVisible: true, promoModalShown: true, completedTradesCount: newCount });
                    } else {
                        set({ completedTradesCount: newCount });
                    }
                } else {
                    set({
                        activeTrades: stillActive,
                        isTradingDisabled: stillActive.length === 0 ? false : state.isTradingDisabled, // Розблоковуємо тільки якщо немає активних угод
                    });
                }
            },
        }),
        {
            name: 'trading-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                balance: state.balance,
                tradeHistory: state.tradeHistory,
                completedTradesCount: state.completedTradesCount,
                promoModalShown: state.promoModalShown,
            }),
            merge: (persistedState: unknown, currentState: TradingState) => {
                // Міграція: якщо баланс дорівнює 1000, встановлюємо на 43201
                const persisted = persistedState as Partial<TradingState>;
                if (persisted?.balance === 1000) {
                    persisted.balance = 43201;
                }
                return { ...currentState, ...persisted };
            },
        }
    )
);
