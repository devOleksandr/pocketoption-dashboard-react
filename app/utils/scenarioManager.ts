/**
 * Scenario Manager - керує логікою торгівлі за заздалегідь визначеним сценарієм
 * 
 * Логіка:
 * - Базовий режим: Перші 3 угоди виграють якщо користувач слідує патерну (BUY, BUY, SELL), 4+ завжди програш
 * - Циклічний режим: Патерн [up, up, down, up] повторюється по колу, всі 4 угоди можуть виграти якщо напрямок правильний
 */

const STORAGE_KEY = 'tradeScenarioIndex';
const MAX_WINS = 3;

// Перевіряємо чи увімкнено циклічний режим через env змінну
const isCycleMode = import.meta.env.VITE_SCENARIO_CYCLE_MODE === 'true';

// Базовий патерн: [up, up, down] - 3 елементи
const BASE_PATTERN = ['up', 'up', 'down'] as const;
// Циклічний патерн: [up, up, down, up] - 4 елементи
const CYCLE_PATTERN = ['up', 'up', 'down', 'up'] as const;

// Вибираємо патерн залежно від режиму
const SCENARIO_PATTERN = isCycleMode ? CYCLE_PATTERN : BASE_PATTERN;

export type Direction = 'up' | 'down';
export type TradeType = 'buy' | 'sell';

/**
 * Отримати поточний індекс угоди з localStorage
 */
export const getCurrentTradeIndex = (): number => {
    if (typeof window === 'undefined') return 0;


    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
};


/**
 * Збільшити лічильник угод в localStorage
 */
export const incrementTradeIndex = (): number => {
    if (typeof window === 'undefined') return 0;

    const current = getCurrentTradeIndex();
    const next = current + 1;
    localStorage.setItem(STORAGE_KEY, next.toString());
    return next;
};

/**
 * Скинути сценарій (почати з початку)
 */
export const resetScenario = (): void => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(STORAGE_KEY, '0');
};

/**
 * Отримати напрямок руху графіка для конкретної угоди
 * @param tradeIndex - індекс угоди (0-based)
 * @returns 'up' або 'down'
 */
export const getScenarioDirection = (tradeIndex: number): Direction => {
    // Використовуємо циклічний патерн (базовий або циклічний залежно від режиму)
    const patternIndex = tradeIndex % SCENARIO_PATTERN.length;
    return SCENARIO_PATTERN[patternIndex];
};

/**
 * Визначити чи має виграти угода на основі сценарію
 * @param tradeIndex - індекс угоди (0-based)
 * @param tradeType - тип угоди ('buy' або 'sell')
 * @param timeframe - час угоди в секундах (5, 10, 15, 20, 25) - тільки для розрахунку руху
 * @param entryPrice - ціна входу в угоду
 * @param currentPrice - поточна ціна на момент завершення
 * @returns true якщо угода виграє, false якщо програє
 */
export const shouldTradeWin = (
    tradeIndex: number,
    tradeType: TradeType,
    timeframe: number,
    entryPrice: number,
    currentPrice: number
): boolean => {
    // Базовий режим: угоди 4+ (індекс 3+) завжди програють
    if (!isCycleMode) {
        if (tradeIndex >= MAX_WINS) {
            return false;
        }
    }
    // Циклічний режим: всі угоди можуть виграти, якщо напрямок правильний

    // Виграш якщо напрямок співпадає з типом угоди
    const direction = getScenarioDirection(tradeIndex);

    // BUY виграє коли графік йде вгору (up)
    // SELL виграє коли графік йде вниз (down)
    return (direction === 'up' && tradeType === 'buy') ||
        (direction === 'down' && tradeType === 'sell');
};

/**
 * Генерувати правильний рух ціни на основі сценарію та timeframe
 * @param tradeIndex - індекс угоди (0-based)
 * @param timeframe - час угоди в секундах
 * @param entryPrice - ціна входу
 * @param volatility - волатильність пари
 * @returns ціна на момент завершення угоди
 */
export const generateScenarioPrice = (
    tradeIndex: number,
    timeframe: number,
    entryPrice: number,
    volatility: number
): number => {
    const direction = getScenarioDirection(tradeIndex);

    // Розраховуємо зміну ціни на основі timeframe та волатильності
    // Чим довший timeframe, тим більший рух ціни
    const timeMultiplier = timeframe / 15; // Базовий timeframe 15s
    const baseMove = volatility * 0.01; // Базовий рух 1% від волатильності
    const priceMove = baseMove * timeMultiplier;

    // Визначаємо чи має бути протилежний рух (тільки для базового режиму)
    let shouldReverse = false;

    if (!isCycleMode) {
        // Базовий режим: індекси 3+ - протилежний рух
        shouldReverse = tradeIndex >= MAX_WINS;
    }
    // В циклічному режимі всі угоди рухаються за сценарієм

    if (shouldReverse) {
        const oppositeDirection = direction === 'up' ? 'down' : 'up';
        return oppositeDirection === 'up'
            ? entryPrice + (priceMove * entryPrice)
            : entryPrice - (priceMove * entryPrice);
    }

    // Рух за сценарієм
    return direction === 'up'
        ? entryPrice + (priceMove * entryPrice)
        : entryPrice - (priceMove * entryPrice);
};

/**
 * Отримати інформацію про поточний стан сценарію (для дебагу)
 */
export const getScenarioInfo = () => {
    const currentIndex = getCurrentTradeIndex();
    const direction = getScenarioDirection(currentIndex);

    let isInWinZone: boolean;
    if (isCycleMode) {
        // Циклічний режим: всі угоди можуть виграти, якщо напрямок правильний
        isInWinZone = true;
    } else {
        // Базовий режим: виграшна зона для перших 3 угод
        isInWinZone = currentIndex < MAX_WINS;
    }

    return {
        currentIndex,
        direction,
        isInWinZone,
        pattern: SCENARIO_PATTERN,
        isCycleMode,
        nextWinningTrade: isInWinZone ? (direction === 'up' ? 'BUY' : 'SELL') : 'NONE (all lose)',
    };
};

