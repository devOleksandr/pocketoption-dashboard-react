import { useEffect, useCallback, useRef, useState, type FC } from 'react';
import { useTradingStore, type CandlestickData, type Trade } from '~/stores';
import Header from '../Header/Header';
import LeftSidebar from '../LeftSidebar/LeftSidebar';
import RightSidebar from '../RightSidebar/RightSidebar';
import { ChartType } from '../ChartType/ChartType';
import { TradingChart } from '../TradingChart/TradingChart';
import { TradingSidePanel } from '../TradingSidePanel/TradingSidePanel';
import { TradeTimersBar } from '../TradeTimersBar/TradeTimersBar';
import { InsufficientFundsModal } from '../InsufficientFundsModal/InsufficientFundsModal';
import BottomNavigation from '../BottomNavigation/BottomNavigation';
import { type Direction } from '~/utils/scenarioManager';
import { WelcomeBonusModal } from '../WelcomeBonusModal/WelcomeBonusModal';

export const TradingPage: FC = () => {
    const [isLive] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const {
        currentRate,
        setCurrentRate,
        candlestickData,
        setCandlestickData,
        addCandlestick,
        selectedPair,
        currencyPairs,
        checkExpiredTrades,
        timeframe,
        setActiveTrades,
        chartViewport,
        activeTrades,
        promoModalShown,
        setWelcomeBonusModalVisible
    } = useTradingStore();

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Get current pair config
    const currentPair = currencyPairs[selectedPair];

    // Generate realistic candlestick data
    const generateCandlestick = useCallback((
        prevClose: number,
        timestamp: string,
        timestampMs: number,
        forceDirection?: Direction
    ) => {
        const volatility = currentPair.volatility;
        const open = prevClose;

        let close: number;
        let high: number;
        let low: number;

        if (forceDirection) {
            // Примусовий напрямок руху графіка за сценарієм (більш плавний)
            const baseChange = volatility * 0.3; // Базовий рух
            const randomChange = (Math.random() - 0.5) * volatility * 0.4; // Випадкові коливання
            const totalChange = baseChange + randomChange;

            if (forceDirection === 'up') {
                // Графік йде вгору: close > open, але з природними коливаннями
                close = open + Math.abs(totalChange); // Завжди позитивний рух
                high = Math.max(open, close) + Math.random() * volatility * 0.2;
                low = Math.min(open, close) - Math.random() * volatility * 0.1;
            } else {
                // Графік йде вниз: close < open, але з природними коливаннями
                close = open - Math.abs(totalChange); // Завжди негативний рух
                high = Math.max(open, close) + Math.random() * volatility * 0.1;
                low = Math.min(open, close) - Math.random() * volatility * 0.2;
            }
        } else {
            // Природний рух графіка
            const trend = (Math.random() - 0.5) * (volatility * 0.5);
            const change1 = (Math.random() - 0.5) * volatility;
            const change2 = (Math.random() - 0.5) * volatility;

            high = Math.max(open, open + Math.abs(change1), open + Math.abs(change2)) + Math.random() * volatility * 0.5;
            low = Math.min(open, open - Math.abs(change1), open - Math.abs(change2)) - Math.random() * volatility * 0.5;
            close = open + trend + (Math.random() - 0.5) * volatility;
        }

        const decimals = selectedPair === "USD/JPY" ? 2 : 5;

        return {
            time: timestamp,
            open: Number(open.toFixed(decimals)),
            high: Number(high.toFixed(decimals)),
            low: Number(low.toFixed(decimals)),
            close: Number(close.toFixed(decimals)),
            timestamp: timestampMs,
        };
    }, [currentPair.volatility, selectedPair]);


    // Force data initialization on client mount
    useEffect(() => {
        if (!isInitialized && (!Array.isArray(candlestickData) || candlestickData.length === 0)) {
            const initialData = [];
            let baseRate = currentPair.baseRate;
            setCurrentRate(baseRate);

            for (let i = 0; i < 100; i++) {
                const now = new Date(Date.now() - (100 - i) * 1000);
                const timestamp = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
                const candle = generateCandlestick(baseRate, timestamp, now.getTime());
                initialData.push(candle);
                baseRate = candle.close;
            }

            setCandlestickData(initialData);
            setCurrentRate(baseRate);
            setIsInitialized(true);
        }
    }, [isInitialized, selectedPair]);

    // Fetch real forex data тільки при зміні пари валют
    useEffect(() => {
        if (isInitialized && currentPair.apiBase && currentPair.apiTarget) {
            const fetchRealRate = async () => {
                try {
                    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${currentPair.apiBase}`);
                    const data = await response.json();

                    if (data.rates && currentPair.apiTarget && data.rates[currentPair.apiTarget]) {
                        const newRate = data.rates[currentPair.apiTarget];
                        setCurrentRate(newRate);
                        console.log(`Updated rate for ${selectedPair}: ${newRate}`);
                    }
                } catch (error) {
                    console.log('Failed to fetch real rate, using synthetic data:', error);
                }
            };

            fetchRealRate();
        }
    }, [selectedPair, isInitialized]);

    // Initialize data when pair changes
    useEffect(() => {
        setIsInitialized(false);
        const initialData = [];
        let baseRate = currentPair.baseRate;
        setCurrentRate(baseRate);

        for (let i = 0; i < 100; i++) {
            const now = new Date(Date.now() - (100 - i) * 1000);
            const timestamp = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
            const candle = generateCandlestick(baseRate, timestamp, now.getTime());
            initialData.push(candle);
            baseRate = candle.close;
        }

        setCandlestickData(initialData);
        setCurrentRate(baseRate);
        (setActiveTrades as any)((prev: Trade[]) => prev.filter((trade: Trade) => trade.pair !== selectedPair));
        setIsInitialized(true);
    }, [selectedPair, currentPair.baseRate, generateCandlestick, setCurrentRate, setCandlestickData, setActiveTrades]);

    // Set up real-time updates - синтетичні дані з оновленням курсу
    useEffect(() => {
        if (isLive && isInitialized) {
            // Задержка перед запуском обновлений, чтобы дать время инициализации
            const timeoutId = setTimeout(() => {
                // Використовуємо тільки синтетичні дані для імітації
                const now = new Date();
                const timestamp = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

                (setCandlestickData as any)((prev: CandlestickData[]) => {
                    const newCandle = generateCandlestick(
                        prev.length > 0 ? prev[prev.length - 1].close : currentRate,
                        timestamp,
                        now.getTime()
                    );
                    const updated = [...prev, newCandle];

                    // Оновлюємо поточний курс на основі нової свічки
                    setCurrentRate(newCandle.close);

                    return updated.slice(-200);
                });

                checkExpiredTrades(currentRate, now.getTime());

                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }

                // Збільшуємо інтервал до 5 секунд для імітації
                intervalRef.current = setInterval(() => {
                    const now = new Date();
                    const timestamp = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

                    (setCandlestickData as any)((prev: CandlestickData[]) => {
                        const newCandle = generateCandlestick(
                            prev.length > 0 ? prev[prev.length - 1].close : currentRate,
                            timestamp,
                            now.getTime()
                        );
                        const updated = [...prev, newCandle];

                        // Оновлюємо поточний курс на основі нової свічки
                        setCurrentRate(newCandle.close);

                        return updated.slice(-200);
                    });

                    checkExpiredTrades(currentRate, now.getTime());
                }, 1000); // 1 секунда для реалістичного руху графіка
            }, 1000);

            return () => {
                clearTimeout(timeoutId);
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isLive, timeframe, selectedPair, isInitialized]);

    // Ensure welcome-bonus modal shows when promo trigger occurs
    useEffect(() => {
        if (promoModalShown) {
            setWelcomeBonusModalVisible(true);
        }
    }, [promoModalShown, setWelcomeBonusModalVisible]);

    return (
        <>
            <Header />
            <div className="wrapper__bottom">
                <LeftSidebar />
                <div className="site-content left-shadow">
                    <div className="site-content-in js-site-content chart-main-block page-content" id="bar-chart">
                        <TradeTimersBar />
                        <div className="wrapper-inner">
                            <div className="chart">
                                <div className="chart-header">
                                    <ChartType />
                                </div>
                                <div className="chart-main">
                                    <TradingChart />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="trading-side-panel-wrapper">
                    <TradingSidePanel />
                </div>
                <RightSidebar />
            </div>

            {/* Mobile bottom navigation */}
            <BottomNavigation />

            <InsufficientFundsModal />
            <WelcomeBonusModal />
        </>
    );
};