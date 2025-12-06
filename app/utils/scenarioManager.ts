/**
 * Scenario Manager
 *
 * Оновлена логіка: графік підлаштовується під дію користувача (BUY або SELL),
 * тому кожна угода завершується в плюс.
 */

const STORAGE_KEY = 'tradeScenarioIndex';

export type Direction = 'up' | 'down';
export type TradeType = 'buy' | 'sell';

/**
 * Скидаємо збережений стан сценарію (необов'язково, але залишено для сумісності)
 */
export const resetScenario = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
};

/**
 * Будь-яка угода тепер виграє
 */
export const shouldTradeWin = (): boolean => true;

/**
 * Генеруємо ціну завершення так, щоб вона відповідала обраному напрямку
 */
export const generateScenarioPrice = (
    tradeType: TradeType,
    timeframe: number,
    entryPrice: number,
    volatility: number
): number => {
    const direction: Direction = tradeType === 'buy' ? 'up' : 'down';

    const normalizedTimeframe = Math.max(timeframe, 5);
    const normalizedVolatility = Math.max(volatility, 0.0001);

    const timeMultiplier = normalizedTimeframe / 15; // базовий timeframe 15s
    const relativeMove = normalizedVolatility * 0.01 * timeMultiplier;
    const priceDelta = Math.max(relativeMove * entryPrice, entryPrice * 0.0001);

    return direction === 'up'
        ? entryPrice + priceDelta
        : Math.max(entryPrice - priceDelta, 0);
};

/**
 * Повертаємо загальну інформацію про сценарій для інтерфейсу/дебагу
 */
export const getScenarioInfo = () => ({
    currentIndex: 0,
    direction: 'adaptive',
    isInWinZone: true,
    pattern: [],
    isCycleMode: true,
    nextWinningTrade: 'BUY or SELL',
});

