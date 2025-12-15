import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    shouldTradeWin,
    generateScenarioPrice,
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
    payout?: number;
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

    // Trades panel visibility
    showTradesPanel: boolean;
    setShowTradesPanel: (show: boolean) => void;

    // Finance menu visibility
    showFinanceMenu: boolean;
    setShowFinanceMenu: (show: boolean) => void;

    // Trades menu visibility
    showTradesMenu: boolean;
    setShowTradesMenu: (show: boolean) => void;

}

export const CURRENCY_PAIRS: Record<string, CurrencyPair> = {
    // Основные пары из оригинального списка
    "EUR/USD": {
        name: "EUR/USD",
        baseRate: 1.095,
        volatility: 0.001,
        apiBase: "EUR",
        apiTarget: "USD",
        payout: 92,
    },
    "AUD/USD": {
        name: "AUD/USD",
        baseRate: 0.665,
        volatility: 0.0015,
        apiBase: "AUD",
        apiTarget: "USD",
        payout: 86,
    },
    "EUR/AUD": {
        name: "EUR/AUD",
        baseRate: 1.645,
        volatility: 0.0012,
        apiBase: "EUR",
        apiTarget: "AUD",
        payout: 92,
    },
    "EUR/JPY": {
        name: "EUR/JPY",
        baseRate: 169.85,
        volatility: 0.15,
        apiBase: "EUR",
        apiTarget: "JPY",
        payout: 92,
    },
    "EUR/CHF": {
        name: "EUR/CHF",
        baseRate: 0.965,
        volatility: 0.001,
        apiBase: "EUR",
        apiTarget: "CHF",
        payout: 89,
    },
    "AUD/JPY": {
        name: "AUD/JPY",
        baseRate: 104.85,
        volatility: 0.12,
        apiBase: "AUD",
        apiTarget: "JPY",
        payout: 31,
    },
    "EUR/CAD": {
        name: "EUR/CAD",
        baseRate: 1.465,
        volatility: 0.0011,
        apiBase: "EUR",
        apiTarget: "CAD",
        payout: 92,
    },
    "USD/CHF": {
        name: "USD/CHF",
        baseRate: 0.885,
        volatility: 0.001,
        apiBase: "USD",
        apiTarget: "CHF",
        payout: 92,
    },
    "CAD/JPY": {
        name: "CAD/JPY",
        baseRate: 114.85,
        volatility: 0.13,
        apiBase: "CAD",
        apiTarget: "JPY",
        payout: 92,
    },
    "AUD/CAD": {
        name: "AUD/CAD",
        baseRate: 0.915,
        volatility: 0.0013,
        apiBase: "AUD",
        apiTarget: "CAD",
        payout: 86,
    },

    // Дополнительные пары из HTML списка
    "AED/CNY": {
        name: "AED/CNY",
        baseRate: 1.95,
        volatility: 0.002,
        apiBase: "AED",
        apiTarget: "CNY",
        payout: 92,
    },
    "AUD/CHF": {
        name: "AUD/CHF",
        baseRate: 0.585,
        volatility: 0.0012,
        apiBase: "AUD",
        apiTarget: "CHF",
        payout: 92,
    },
    "AUD/NZD": {
        name: "AUD/NZD",
        baseRate: 1.095,
        volatility: 0.0015,
        apiBase: "AUD",
        apiTarget: "NZD",
        payout: 92,
    },
    "BHD/CNY": {
        name: "BHD/CNY",
        baseRate: 19.05,
        volatility: 0.003,
        apiBase: "BHD",
        apiTarget: "CNY",
        payout: 92,
    },
    "CAD/CHF": {
        name: "CAD/CHF",
        baseRate: 0.655,
        volatility: 0.0011,
        apiBase: "CAD",
        apiTarget: "CHF",
        payout: 86,
    },
    "EUR/HUF": {
        name: "EUR/HUF",
        baseRate: 385.50,
        volatility: 2.5,
        apiBase: "EUR",
        apiTarget: "HUF",
        payout: 91,
    },
    "EUR/NZD": {
        name: "EUR/NZD",
        baseRate: 1.785,
        volatility: 0.0018,
        apiBase: "EUR",
        apiTarget: "NZD",
        payout: 92,
    },
    "EUR/RUB": {
        name: "EUR/RUB",
        baseRate: 105.25,
        volatility: 1.2,
        apiBase: "EUR",
        apiTarget: "RUB",
        payout: 92,
    },
    "GBP/JPY": {
        name: "GBP/JPY",
        baseRate: 189.45,
        volatility: 0.18,
        apiBase: "GBP",
        apiTarget: "JPY",
        payout: 92,
    },
    "KES/USD": {
        name: "KES/USD",
        baseRate: 0.0065,
        volatility: 0.0001,
        apiBase: "KES",
        apiTarget: "USD",
        payout: 92,
    },
    "LBP/USD": {
        name: "LBP/USD",
        baseRate: 0.000067,
        volatility: 0.000001,
        apiBase: "LBP",
        apiTarget: "USD",
        payout: 69,
    },
    "MAD/USD": {
        name: "MAD/USD",
        baseRate: 0.098,
        volatility: 0.001,
        apiBase: "MAD",
        apiTarget: "USD",
        payout: 92,
    },
    "TND/USD": {
        name: "TND/USD",
        baseRate: 0.315,
        volatility: 0.003,
        apiBase: "TND",
        apiTarget: "USD",
        payout: 87,
    },
    "USD/ARS": {
        name: "USD/ARS",
        baseRate: 1025.50,
        volatility: 15.0,
        apiBase: "USD",
        apiTarget: "ARS",
        payout: 88,
    },
    "USD/BDT": {
        name: "USD/BDT",
        baseRate: 119.85,
        volatility: 0.8,
        apiBase: "USD",
        apiTarget: "BDT",
        payout: 85,
    },
    "USD/CAD": {
        name: "USD/CAD",
        baseRate: 1.385,
        volatility: 0.0012,
        apiBase: "USD",
        apiTarget: "CAD",
        payout: 77,
    },
    "USD/CLP": {
        name: "USD/CLP",
        baseRate: 985.25,
        volatility: 8.5,
        apiBase: "USD",
        apiTarget: "CLP",
        payout: 55,
    },
    "USD/COP": {
        name: "USD/COP",
        baseRate: 4285.75,
        volatility: 35.0,
        apiBase: "USD",
        apiTarget: "COP",
        payout: 92,
    },
    "USD/DZD": {
        name: "USD/DZD",
        baseRate: 135.25,
        volatility: 1.2,
        apiBase: "USD",
        apiTarget: "DZD",
        payout: 68,
    },
    "USD/IDR": {
        name: "USD/IDR",
        baseRate: 15685.50,
        volatility: 125.0,
        apiBase: "USD",
        apiTarget: "IDR",
        payout: 92,
    },
    "USD/INR": {
        name: "USD/INR",
        baseRate: 83.25,
        volatility: 0.6,
        apiBase: "USD",
        apiTarget: "INR",
        payout: 83,
    },
    "USD/JPY": {
        name: "USD/JPY",
        baseRate: 155.25,
        volatility: 1.2,
        apiBase: "USD",
        apiTarget: "JPY",
        payout: 57,
    },
    "USD/MXN": {
        name: "USD/MXN",
        baseRate: 17.85,
        volatility: 0.15,
        apiBase: "USD",
        apiTarget: "MXN",
        payout: 80,
    },
    "USD/PKR": {
        name: "USD/PKR",
        baseRate: 285.75,
        volatility: 2.5,
        apiBase: "USD",
        apiTarget: "PKR",
        payout: 92,
    },
    "USD/RUB": {
        name: "USD/RUB",
        baseRate: 95.85,
        volatility: 1.5,
        apiBase: "USD",
        apiTarget: "RUB",
        payout: 92,
    },
    "USD/SGD": {
        name: "USD/SGD",
        baseRate: 1.345,
        volatility: 0.008,
        apiBase: "USD",
        apiTarget: "SGD",
        payout: 92,
    },
    "USD/THB": {
        name: "USD/THB",
        baseRate: 36.85,
        volatility: 0.25,
        apiBase: "USD",
        apiTarget: "THB",
        payout: 92,
    },
    "YER/USD": {
        name: "YER/USD",
        baseRate: 0.004,
        volatility: 0.0001,
        apiBase: "YER",
        apiTarget: "USD",
        payout: 92,
    },
    "ZAR/USD": {
        name: "ZAR/USD",
        baseRate: 0.053,
        volatility: 0.0008,
        apiBase: "ZAR",
        apiTarget: "USD",
        payout: 92,
    },
    "GBP/AUD": {
        name: "GBP/AUD",
        baseRate: 1.925,
        volatility: 0.0018,
        apiBase: "GBP",
        apiTarget: "AUD",
        payout: 91,
    },
    "USD/CNH": {
        name: "USD/CNH",
        baseRate: 7.285,
        volatility: 0.05,
        apiBase: "USD",
        apiTarget: "CNH",
        payout: 92,
    },
    "EUR/GBP": {
        name: "EUR/GBP",
        baseRate: 0.855,
        volatility: 0.008,
        apiBase: "EUR",
        apiTarget: "GBP",
        payout: 90,
    },
    "GBP/USD": {
        name: "GBP/USD",
        baseRate: 1.275,
        volatility: 0.012,
        apiBase: "GBP",
        apiTarget: "USD",
        payout: 87,
    },
    "USD/BRL": {
        name: "USD/BRL",
        baseRate: 5.185,
        volatility: 0.045,
        apiBase: "USD",
        apiTarget: "BRL",
        payout: 68,
    },
    "USD/MYR": {
        name: "USD/MYR",
        baseRate: 4.685,
        volatility: 0.035,
        apiBase: "USD",
        apiTarget: "MYR",
        payout: 49,
    },
    "JOD/CNY": {
        name: "JOD/CNY",
        baseRate: 10.15,
        volatility: 0.08,
        apiBase: "JOD",
        apiTarget: "CNY",
        payout: 86,
    },
    "CHF/JPY": {
        name: "CHF/JPY",
        baseRate: 175.25,
        volatility: 1.5,
        apiBase: "CHF",
        apiTarget: "JPY",
        payout: 73,
    },
    "QAR/CNY": {
        name: "QAR/CNY",
        baseRate: 1.985,
        volatility: 0.015,
        apiBase: "QAR",
        apiTarget: "CNY",
        payout: 92,
    },
    "USD/PHP": {
        name: "USD/PHP",
        baseRate: 56.85,
        volatility: 0.45,
        apiBase: "USD",
        apiTarget: "PHP",
        payout: 76,
    },
    "NZD/JPY": {
        name: "NZD/JPY",
        baseRate: 95.25,
        volatility: 0.8,
        apiBase: "NZD",
        apiTarget: "JPY",
        payout: 71,
    },
    "UAH/USD": {
        name: "UAH/USD",
        baseRate: 0.027,
        volatility: 0.0005,
        apiBase: "UAH",
        apiTarget: "USD",
        payout: 87,
    },
    "NZD/USD": {
        name: "NZD/USD",
        baseRate: 0.615,
        volatility: 0.008,
        apiBase: "NZD",
        apiTarget: "USD",
        payout: 62,
    },
    "EUR/TRY": {
        name: "EUR/TRY",
        baseRate: 35.85,
        volatility: 0.45,
        apiBase: "EUR",
        apiTarget: "TRY",
        payout: 72,
    },
    "SAR/CNY": {
        name: "SAR/CNY",
        baseRate: 1.925,
        volatility: 0.015,
        apiBase: "SAR",
        apiTarget: "CNY",
        payout: 77,
    },
    "CHF/NOK": {
        name: "CHF/NOK",
        baseRate: 11.85,
        volatility: 0.12,
        apiBase: "CHF",
        apiTarget: "NOK",
        payout: 63,
    },
    "USD/VND": {
        name: "USD/VND",
        baseRate: 24585.0,
        volatility: 185.0,
        apiBase: "USD",
        apiTarget: "VND",
        payout: 91,
    },
    "USD/EGP": {
        name: "USD/EGP",
        baseRate: 48.85,
        volatility: 0.35,
        apiBase: "USD",
        apiTarget: "EGP",
        payout: 79,
    },
    "NGN/USD": {
        name: "NGN/USD",
        baseRate: 0.00125,
        volatility: 0.00002,
        apiBase: "NGN",
        apiTarget: "USD",
        payout: 77,
    },
    "OMR/CNY": {
        name: "OMR/CNY",
        baseRate: 18.95,
        volatility: 0.15,
        apiBase: "OMR",
        apiTarget: "CNY",
        payout: 77,
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
            // Promo modal also controls trading availability
            setPromoModalVisible: (visible: boolean) => set({
                promoModalVisible: visible,
                // вимикаємо кнопки під час модалки, інакше дивимося на активні угоди
                isTradingDisabled: visible ? true : get().activeTrades.some(t => t.status === 'active'),
            }),

            // Trades panel visibility
            showTradesPanel: false,
            setShowTradesPanel: (show: boolean) => set({ showTradesPanel: show }),

            // Finance menu visibility
            showFinanceMenu: false,
            setShowFinanceMenu: (show: boolean) => set({ showFinanceMenu: show }),

            // Trades menu visibility
            showTradesMenu: false,
            setShowTradesMenu: (show: boolean) => set({ showTradesMenu: show }),

            // Trading actions
            handleTrade: (direction: 'up' | 'down') => {
                const state = get();
                const { balance, amount, currentRate, selectedPair, timeframe, chartType, candlestickData, isTradingDisabled, promoModalVisible, activeTrades } = state;

                const hasActiveTrades = Array.isArray(activeTrades) && activeTrades.some(trade => trade.status === 'active');

                // Не дозволяємо нові угоди, якщо вже є активні або кнопки вимкнені
                if (hasActiveTrades || isTradingDisabled || promoModalVisible) {
                    return;
                }

                if (Number(amount) > balance) {
                    set({ showFundsModal: true });
                    return;
                }

                // Віднімаємо кошти від балансу при відкритті угоди
                set({ balance: balance - Number(amount) });

                const now = new Date();
                const tradeType = direction === "up" ? "buy" : "sell";

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
                };

                state.addActiveTrade(newTrade);
                set({ isTradingDisabled: true });
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
                        // Генеруємо сценарійну ціну на основі timeframe та волатильності
                        const scenarioPrice = generateScenarioPrice(
                            trade.type,
                            trade.timeframe,
                            trade.entryPrice,
                            currentPair.volatility
                        );

                        const isWinning = shouldTradeWin();

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

                        // При виграші: повертаємо початковий amount + прибуток (payout%)
                        // При програші: 0 (кошти вже списані при відкритті угоди)
                        const payout = currentPair?.payout || 92;
                        const profitMultiplier = 1 + (payout / 100); // Например, для 92% = 1.92
                        const profit = isWinning ? Number(trade.amount) * profitMultiplier : 0;

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
                        const percentage = isWinning ? payout : -100;

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
                        // Якщо залишились активні — тримаємо кнопки вимкненими
                        isTradingDisabled: stillActive.some(t => t.status === 'active'),
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
                    // Тримаємо стан кнопок відповідно до наявності активних угод
                    set({
                        activeTrades: stillActive,
                        isTradingDisabled: stillActive.some(t => t.status === 'active'),
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
