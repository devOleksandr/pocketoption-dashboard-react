import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTradingStore, type Trade, TIMEFRAMES } from '~/stores';

export const TradingChart: React.FC = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [dragStartOffset, setDragStartOffset] = useState(0);
    const animationFrameRef = useRef<number | null>(null);
    const returnTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Smooth animation state
    const [animatedData, setAnimatedData] = useState<any[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const animationStartTime = useRef<number>(0);
    const animationDuration = 1000; // 1 second animation

    const {
        candlestickData,
        selectedPair,
        chartType,
        activeTrades,
        currentRate,
        chartViewport,
        setChartViewport,
        unlockChart,
        chartZoom,
        zoomIn,
        zoomOut
    } = useTradingStore();


    // Smooth animation effect
    useEffect(() => {
        if (!Array.isArray(candlestickData) || candlestickData.length === 0) {
            return;
        }

        // If we have new data and we're not already animating, start animation
        if (candlestickData.length > 0 && !isAnimating) {
            const previousData = animatedData.length > 0 ? animatedData : candlestickData.slice(0, -1);
            const newCandle = candlestickData[candlestickData.length - 1];

            if (previousData.length > 0) {
                const lastCandle = previousData[previousData.length - 1];

                // Start animation from last candle to new candle
                setIsAnimating(true);
                animationStartTime.current = Date.now();

                const animate = () => {
                    const elapsed = Date.now() - animationStartTime.current;
                    const progress = Math.min(elapsed / animationDuration, 1);

                    // Easing function for smooth animation
                    const easeOutCubic = 1 - Math.pow(1 - progress, 3);

                    // Interpolate between last candle and new candle
                    const interpolatedCandle = {
                        ...newCandle,
                        close: lastCandle.close + (newCandle.close - lastCandle.close) * easeOutCubic,
                        high: lastCandle.high + (newCandle.high - lastCandle.high) * easeOutCubic,
                        low: lastCandle.low + (newCandle.low - lastCandle.low) * easeOutCubic,
                    };

                    setAnimatedData([...previousData.slice(0, -1), interpolatedCandle]);

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        // Animation complete
                        setAnimatedData(candlestickData);
                        setIsAnimating(false);
                    }
                };

                requestAnimationFrame(animate);
            } else {
                setAnimatedData(candlestickData);
            }
        }
    }, [candlestickData, isAnimating, animatedData]);

    // Drag-to-scroll handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStartX(e.clientX);
        setDragStartOffset(chartViewport.offset);
        setChartViewport({ ...chartViewport, isLocked: true });

        // Clear any pending return animation
        if (returnTimeoutRef.current) {
            clearTimeout(returnTimeoutRef.current);
            returnTimeoutRef.current = null;
        }
    }, [chartViewport, setChartViewport]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;

        const diff = (e.clientX - dragStartX) / 15;
        const maxOffset = Math.max(0, candlestickData.length - chartZoom.visibleCandles);
        const newOffset = Math.max(0, Math.min(maxOffset, dragStartOffset + diff));

        setChartViewport({ offset: newOffset, isLocked: true });
    }, [isDragging, dragStartX, dragStartOffset, candlestickData.length, chartZoom.visibleCandles, setChartViewport]);

    // Touch handlers for mobile drag-to-scroll
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const t = e.touches && e.touches[0];
        if (!t) return;
        setIsDragging(true);
        setDragStartX(t.clientX);
        setDragStartOffset(chartViewport.offset);
        setChartViewport({ ...chartViewport, isLocked: true });
    }, [chartViewport, setChartViewport]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging) return;
        const t = e.touches && e.touches[0];
        if (!t) return;
        e.preventDefault();
        const diff = (t.clientX - dragStartX) / 15;
        const maxOffset = Math.max(0, candlestickData.length - chartZoom.visibleCandles);
        const newOffset = Math.max(0, Math.min(maxOffset, dragStartOffset + diff));
        setChartViewport({ offset: newOffset, isLocked: true });
    }, [isDragging, dragStartX, dragStartOffset, candlestickData.length, chartZoom.visibleCandles, setChartViewport]);

    // handleTouchEnd will be defined after animateReturn is declared

    // Smooth return animation
    const animateReturn = useCallback(() => {
        const start = chartViewport.offset;
        const duration = 500; // ms
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // Ease-out cubic

            const newOffset = start * (1 - eased);
            setChartViewport({ offset: newOffset, isLocked: progress < 1 });

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                unlockChart();
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);
    }, [chartViewport.offset, setChartViewport, unlockChart]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);

        // Smooth return after 3 seconds
        returnTimeoutRef.current = setTimeout(() => {
            animateReturn();
        }, 3000);
    }, [animateReturn]);

    // Touch end mirrors mouse up, declared after animateReturn to satisfy linter
    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
        returnTimeoutRef.current = setTimeout(() => {
            animateReturn();
        }, 3000);
    }, [animateReturn]);

    // Zoom handlers
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.deltaY < 0) {
            // Scroll up - zoom in (менший часовий діапазон)
            zoomIn();
        } else {
            // Scroll down - zoom out (більший часовий діапазон)
            zoomOut();
        }
    }, [zoomIn, zoomOut]);

    // Add wheel event listener with passive: false
    useEffect(() => {
        const svgElement = document.querySelector('svg');
        if (svgElement) {
            const handleWheelNative = (e: WheelEvent) => {
                e.preventDefault();
                e.stopPropagation();

                if (e.deltaY < 0) {
                    zoomIn();
                } else {
                    zoomOut();
                }
            };

            svgElement.addEventListener('wheel', handleWheelNative, { passive: false });

            return () => {
                svgElement.removeEventListener('wheel', handleWheelNative);
            };
        }
    }, [zoomIn, zoomOut]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (returnTimeoutRef.current) {
                clearTimeout(returnTimeoutRef.current);
            }
        };
    }, []);

    if (!Array.isArray(candlestickData) || candlestickData.length === 0) {
        return (
            <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1f2e' }}>
                <div style={{ color: '#9ca3af' }}>No data available</div>
            </div>
        );
    }

    // Використовуємо анімовані дані якщо є анімація, інакше оригінальні
    const dataToUse = isAnimating && animatedData.length > 0 ? animatedData : candlestickData;

    // Показувати тільки видиму частину даних
    const startIndex = Math.max(0, dataToUse.length - chartZoom.visibleCandles - chartViewport.offset);
    const endIndex = dataToUse.length - chartViewport.offset;
    const visibleData = dataToUse.slice(startIndex, endIndex);

    const maxPrice = Math.max(...visibleData.map(d => d.high));
    const minPrice = Math.min(...visibleData.map(d => d.low));
    const priceRange = maxPrice - minPrice;
    const chartHeight = 500;

    // Find trade labels for chart (only active trades, history hidden)
    const getTradeLabels = () => {
        const activeForPair = Array.isArray(activeTrades)
            ? activeTrades.filter((t) => t.pair === selectedPair && t.status === 'active')
            : [];

        const labels: Array<{
            x: number;
            y: number;
            type: 'buy' | 'sell';
            trade: Trade;
            status: string;
        }> = [];

        activeForPair.forEach((trade) => {
            // Точка прив'язки: entry (active)
            let entryIndex = -1;
            let minTimeDiff = Infinity;
            const targetTime = trade.entryTimestamp;
            const targetPrice = trade.entryPrice;

            dataToUse.forEach((candle, index) => {
                const timeDiff = Math.abs(candle.timestamp - targetTime);
                if (timeDiff < minTimeDiff && timeDiff < 10000) { // 10 секунд максимум
                    minTimeDiff = timeDiff;
                    entryIndex = index;
                }
            });

            if (entryIndex !== -1) {
                // Якщо в зоні видимості — ставимо по індексу, інакше справа
                if (entryIndex >= startIndex && entryIndex < endIndex) {
                    const visibleIndex = entryIndex - startIndex;

                    labels.push({
                        x: visibleIndex,
                        y: targetPrice,
                        type: trade.type,
                        trade: trade,
                        status: trade.status || 'active',
                    });
                } else {
                    // Если сделка не в видимой области, показываем справа на цене входа
                    const rightPosition = Math.max(0, visibleData.length - 1);

                    labels.push({
                        x: rightPosition,
                        y: targetPrice,
                        type: trade.type,
                        trade: trade,
                        status: trade.status || 'active',
                    });
                }
            }
        });

        return labels;
    };

    const tradeLabels = getTradeLabels();

    // Підрахунок точок для area графіка
    const linePoints = visibleData.map((c, i) => {
        const x = (i / (visibleData.length - 1)) * 900; // Зменшено з 950 до 900 для більшого відступу
        const y = chartHeight - ((c.close - minPrice) / priceRange) * chartHeight;
        return `${x},${y}`;
    }).join(" ");

    // Створюємо path для area chart з заповненням
    const areaPath = visibleData.map((c, i) => {
        const x = (i / (visibleData.length - 1)) * 900; // Зменшено з 950 до 900 для більшого відступу
        const y = chartHeight - ((c.close - minPrice) / priceRange) * chartHeight;
        if (i === 0) return `M ${x} ${y}`;
        return `L ${x} ${y}`;
    }).join(" ") + ` L 900 ${chartHeight} L 0 ${chartHeight} Z`;

    // Определяем, мобильное ли устройство
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    if (isMobile) {
        // Для мобильных устройств - отдельный div для графика
        return (
            <div data-allow-horizontal="true" style={{
                position: "relative",
                width: "100%",
                height: "calc(100vh - 400px)", // Еще больше уменьшаем для таймфреймов
                maxHeight: "calc(100vh - 400px)", // Строгое ограничение
                overflow: "hidden",
                touchAction: 'pan-x', // разрешаем горизонтальный жест внутри графика
                WebkitOverflowScrolling: 'auto',
                backgroundImage: "url('/assets/images/mountains-dark-blue.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
            }}>
                <svg
                    data-allow-horizontal="true"
                    width="100%"
                    height="100%"
                    viewBox={`0 0 1000 ${chartHeight}`}
                    preserveAspectRatio="none"
                    style={{
                        overflow: "hidden",
                        height: "100%",
                        maxHeight: "calc(100vh - 400px)", // Еще больше уменьшаем для таймфреймов
                        cursor: isDragging ? 'grabbing' : 'grab',
                        touchAction: 'pan-x'
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                >
                    {/* Gradient definition for area chart */}
                    <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#406490', stopOpacity: 0.3 }} />
                            <stop offset="100%" style={{ stopColor: '#406490', stopOpacity: 0 }} />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <line
                            key={i}
                            x1={0}
                            y1={i * (chartHeight / 8)}
                            x2={1000}
                            y2={i * (chartHeight / 8)}
                            stroke="#2f3b53"
                            strokeWidth={1}
                            opacity={0.2}
                        />
                    ))}

                    {/* Vertical grid lines */}
                    {Array.from({ length: 20 }, (_, i) => (
                        <line
                            key={i}
                            x1={i * 50}
                            y1={0}
                            x2={i * 50}
                            y2={chartHeight}
                            stroke="#2f3b53"
                            strokeWidth={1}
                            opacity={0.15}
                        />
                    ))}


                    {/* --- Ось тут перемикається вигляд графіка --- */}
                    {chartType === "line" ? (
                        <>
                            {/* Area fill with gradient */}
                            <path
                                d={areaPath}
                                fill="url(#areaGradient)"
                            />
                            {/* Line on top */}
                            <polyline
                                fill="none"
                                stroke="#71b8ff"
                                strokeWidth="1.8"
                                points={linePoints}
                            />

                            {/* Current Price Indicator */}
                            {visibleData.length > 0 && (() => {
                                const lastCandle = visibleData[visibleData.length - 1];
                                const lastX = 900; // Змінено з 950 на 900
                                const lastY = chartHeight - ((lastCandle.close - minPrice) / priceRange) * chartHeight;

                                return (
                                    <g>
                                        {/* Horizontal line to right edge */}
                                        <line
                                            x1={lastX}
                                            y1={lastY}
                                            x2={1000}
                                            y2={lastY}
                                            stroke="#406490"
                                            strokeWidth="1"
                                            strokeDasharray="3,3"
                                            opacity={0.6}
                                        />

                                        {/* Vertical dashed line to time axis */}
                                        <line
                                            x1={lastX}
                                            y1={lastY}
                                            x2={lastX}
                                            y2={chartHeight}
                                            stroke="rgba(156, 163, 175, 0.4)"
                                            strokeWidth="1"
                                            strokeDasharray="4,4"
                                        />

                                        {/* Price dot: single circle, no border, pulse */}
                                        <defs>
                                            <style>{`
                                                @keyframes pricePulse {
                                                  0% { transform: scale(0.7); opacity: 0.65; }
                                                  100% { transform: scale(1); opacity: 1; }
                                                }
                                            `}</style>
                                        </defs>
                                        <g style={{ animation: 'pricePulse 0.5s ease-out' }}>
                                            <circle
                                                cx={lastX}
                                                cy={lastY}
                                                r="6"
                                                fill="#05b6f9"
                                            />
                                        </g>
                                    </g>
                                );
                            })()}

                            {/* Buy/Sell markers for active trades */}
                            {activeTrades.map((trade, idx) => {
                                if (!trade.entryPrice || !trade.entryTimestamp || visibleData.length < 2) return null;
                                // Find nearest candle by timestamp
                                let nearestIndex = 0;
                                let nearestDiff = Number.MAX_SAFE_INTEGER;
                                visibleData.forEach((c, i) => {
                                    const diff = Math.abs((c.timestamp ?? 0) - trade.entryTimestamp);
                                    if (diff < nearestDiff) {
                                        nearestDiff = diff;
                                        nearestIndex = i;
                                    }
                                });
                                const x = (nearestIndex / (visibleData.length - 1)) * 900;
                                const y = chartHeight - (((trade.status === 'closed' && trade.exitPrice ? trade.exitPrice : trade.entryPrice) - minPrice) / priceRange) * chartHeight;
                                const isBuy = trade.type === 'buy';
                                const fill = isBuy ? '#32ac40' : '#f3382c';
                                const stroke = isBuy ? '#1f8c2f' : '#c62820';
                                const label = isBuy ? 'B' : 'S';
                                return (
                                    <g key={`${trade.id}-${idx}`} transform={`translate(${x}, ${y})`}>
                                        <circle r="7" fill={fill} stroke="none" opacity={0.9} />
                                        <text
                                            x="0"
                                            y="3"
                                            textAnchor="middle"
                                            fontSize="9"
                                            fontWeight="700"
                                            fill="#ffffff"
                                        >
                                            {label}
                                        </text>
                                    </g>
                                );
                            })}
                        </>
                    ) : (
                        visibleData.map((candle, i) => {
                            const x = (i / (visibleData.length - 1)) * 900 // Змінено з 950 на 900
                            const candleWidth = Math.max(8, (900 / visibleData.length) * 0.7) // Змінено з 950 на 900
                            const yHigh = chartHeight - ((candle.high - minPrice) / priceRange) * chartHeight
                            const yLow = chartHeight - ((candle.low - minPrice) / priceRange) * chartHeight
                            const yOpen = chartHeight - ((candle.open - minPrice) / priceRange) * chartHeight
                            const yClose = chartHeight - ((candle.close - minPrice) / priceRange) * chartHeight
                            const isGreen = candle.close > candle.open
                            const bodyHeight = Math.max(Math.abs(yClose - yOpen), 2)
                            const bodyY = Math.min(yOpen, yClose)
                            return (
                                <g key={i}>
                                    <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={isGreen ? "#10b981" : "#ef4444"} strokeWidth={2} />
                                    <rect
                                        x={x - candleWidth / 2}
                                        y={bodyY}
                                        width={candleWidth}
                                        height={bodyHeight}
                                        fill={isGreen ? "#10b981" : "#ef4444"}
                                        stroke={isGreen ? "#059669" : "#dc2626"}
                                        strokeWidth={1}
                                    />
                                </g>
                            )
                        })
                    )}

                    {/* Expiration Time Lines for Active Trades */}
                    {tradeLabels.filter(label => label.status === "active").map((label, i) => {
                        const expirationTimestamp = label.trade.entryTimestamp + (label.trade.timeframe * 1000);
                        const timeDiff = expirationTimestamp - (candlestickData[0]?.timestamp || 0);
                        const expirationIndex = timeDiff / 1000; // Приблизний індекс
                        const expX = Math.min((expirationIndex / candlestickData.length) * 900, 900); // Змінено з 950 на 900

                        if (expX > 0 && expX <= 900) { // Змінено з 950 на 900
                            const expirationTime = new Date(expirationTimestamp).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false
                            });

                            return (
                                <g key={`expiration-${i}`}>
                                    {/* Вертикальна біла лінія */}
                                    <line
                                        x1={expX}
                                        y1={0}
                                        x2={expX}
                                        y2={chartHeight}
                                        stroke="#ffffff"
                                        strokeWidth="1"
                                        strokeDasharray="5,5"
                                        opacity={0.5}
                                    />

                                    {/* Текст "Expiration time" */}
                                    <text
                                        x={expX}
                                        y={-10}
                                        textAnchor="middle"
                                        fill="#ffffff"
                                        fontSize="10"
                                        fontWeight="500"
                                    >
                                        Expiration time
                                    </text>

                                    {/* Час закінчення */}
                                    <text
                                        x={expX}
                                        y={5}
                                        textAnchor="middle"
                                        fill="#ffffff"
                                        fontSize="11"
                                        fontWeight="bold"
                                    >
                                        {expirationTime}
                                    </text>
                                </g>
                            );
                        }
                        return null;
                    })}

                    {/* Trade Entry Points - Fixed Position */}
                    {tradeLabels.map((label, i) => {
                        // Исправляем расчет координат - используем правильный индекс
                        const x = (label.x / Math.max(visibleData.length - 1, 1)) * 900
                        const y = chartHeight - ((label.y - minPrice) / priceRange) * chartHeight
                        const boxY = y - 50 // Уменьшено расстояние от линии
                        const opacity = label.status === "active" ? 1 : 0.6

                        return (
                            <g key={`label-${i}`} opacity={opacity}>
                                {/* Маркер на линии графика */}
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="6"
                                    fill={label.type === "buy" ? "#22c55e" : "#ef4444"}
                                    stroke="none"
                                />

                                {/* Прямоугольник с суммой над маркером */}
                                <rect
                                    x={x - 60}
                                    y={boxY}
                                    width={120}
                                    height={35}
                                    fill={label.type === "buy" ? "#22c55e" : "#ef4444"}
                                    rx={8}
                                    stroke="#1e293b"
                                    strokeWidth={1}
                                />

                                {/* Сумма сделки и оставшееся время для активных сделок */}
                                <text
                                    x={x}
                                    y={boxY + 18}
                                    textAnchor="middle"
                                    fill="#ffffff"
                                    fontSize="18"
                                    fontWeight="bold"
                                >
                                    ${label.trade.amount}
                                </text>

                                {/* Оставшееся время для активных сделок */}
                                {label.status === 'active' && (() => {
                                    const now = Date.now();
                                    const expirationTime = label.trade.entryTimestamp + (label.trade.timeframe * 1000);
                                    const timeLeft = Math.max(0, Math.ceil((expirationTime - now) / 1000));
                                    const minutes = Math.floor(timeLeft / 60);
                                    const seconds = timeLeft % 60;
                                    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                                    return (
                                        <text
                                            x={x}
                                            y={boxY + 32}
                                            textAnchor="middle"
                                            fill="#ffffff"
                                            fontSize="16"
                                            fontWeight="600"
                                        >
                                            {timeString}
                                        </text>
                                    );
                                })()}

                                {/* Вертикальная пунктирная линия от маркера к прямоугольнику */}
                                <line
                                    x1={x}
                                    y1={y - 6}
                                    x2={x}
                                    y2={boxY + 35}
                                    stroke={label.type === "buy" ? "#22c55e" : "#ef4444"}
                                    strokeWidth="1"
                                    strokeDasharray="3,3"
                                    opacity={0.7}
                                />

                                {/* Tooltip */}
                                <title>
                                    {label.status === 'active'
                                        ? `${label.type.toUpperCase()}: Entry ${label.trade.entryPrice.toFixed(selectedPair === "USD/JPY" ? 2 : 5)} | Current ${currentRate?.toFixed(selectedPair === "USD/JPY" ? 2 : 5) || 'N/A'} | $${label.trade.amount} | ${label.trade.entryTime} | Active`
                                        : `${label.type.toUpperCase()}: Entry ${label.trade.entryPrice.toFixed(selectedPair === "USD/JPY" ? 2 : 5)} | Current ${label.y.toFixed(selectedPair === "USD/JPY" ? 2 : 5)} | $${label.trade.amount} | ${label.trade.entryTime}${label.trade.profit !== undefined ? ` | P&L: ${label.trade.profit.toFixed(2)}$` : ""}`
                                    }
                                </title>
                            </g>
                        )
                    })}
                </svg>

                {/* Current Price Label - right side */}
                {visibleData.length > 0 && (() => {
                    const lastCandle = visibleData[visibleData.length - 1];
                    const lastY = chartHeight - ((lastCandle.close - minPrice) / priceRange) * chartHeight;
                    const topPercent = (lastY / chartHeight) * 85; // 85% - висота SVG

                    return (
                        <div style={{
                            position: 'absolute',
                            right: '0px',
                            top: `${topPercent}%`,
                            transform: 'translateY(-50%)',
                            background: '#406490',
                            color: '#ffffff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            zIndex: 10
                        }}>
                            {lastCandle.close.toFixed(selectedPair === "USD/JPY" ? 2 : 5)}
                        </div>
                    );
                })()}


                {/* Price labels */}
                <div
                    style={{
                        position: "absolute",
                        right: "8px",
                        top: "16px",
                        height: "calc(100% - 64px)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        color: "rgba(156, 163, 175, 0.6)",
                    }}
                >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i}>
                            {(maxPrice - (i * priceRange) / 8).toFixed(selectedPair === "USD/JPY" ? 2 : 5)}
                        </div>
                    ))}
                </div>

                {/* Time labels */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "8px",
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        color: "rgba(156, 163, 175, 0.6)",
                    }}
                >
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                        const index = Math.floor((i * visibleData.length) / 5)
                        return (
                            <div key={i} style={{ padding: "2px 6px" }}>
                                {index < visibleData.length ? visibleData[index].time : ""}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Для десктопа - обычная структура
    return (
        <div style={{
            position: "relative",
            width: "100%",
            height: "100%",
            backgroundImage: "url('/assets/images/mountains-dark-blue.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
        }}>
            <svg
                width="100%"
                height="100%"
                viewBox={`0 0 1000 ${chartHeight}`}
                preserveAspectRatio="none"
                style={{ overflow: "visible", height: "85%", cursor: isDragging ? 'grabbing' : 'grab' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Gradient definition for area chart */}
                <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#406490', stopOpacity: 0.3 }} />
                        <stop offset="100%" style={{ stopColor: '#406490', stopOpacity: 0 }} />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <line
                        key={i}
                        x1={0}
                        y1={i * (chartHeight / 8)}
                        x2={1000}
                        y2={i * (chartHeight / 8)}
                        stroke="#2d3548"
                        strokeWidth={1}
                        opacity={0.25}
                    />
                ))}

                {/* Vertical grid lines */}
                {Array.from({ length: 20 }, (_, i) => (
                    <line
                        key={i}
                        x1={i * 50}
                        y1={0}
                        x2={i * 50}
                        y2={chartHeight}
                        stroke="#2d3548"
                        strokeWidth={1}
                        opacity={0.15}
                    />
                ))}

                {/* Chart content - same as mobile but without mobile-specific styling */}
                {chartType === "line" ? (
                    <>
                        {/* Area fill with gradient */}
                        <path
                            d={areaPath}
                            fill="url(#areaGradient)"
                        />
                        {/* Line on top */}
                        <polyline
                            fill="none"
                            stroke="#406490"
                            strokeWidth="1.5"
                            points={linePoints}
                        />

                        {/* Current Price Indicator */}
                        {visibleData.length > 0 && (() => {
                            const lastCandle = visibleData[visibleData.length - 1];
                            const lastX = 900;
                            const lastY = chartHeight - ((lastCandle.close - minPrice) / priceRange) * chartHeight;

                            return (
                                <g>
                                    {/* Horizontal line to right edge */}
                                    <line
                                        x1={lastX}
                                        y1={lastY}
                                        x2={1000}
                                        y2={lastY}
                                        stroke="#406490"
                                        strokeWidth="1"
                                        strokeDasharray="3,3"
                                        opacity={0.6}
                                    />

                                    {/* Vertical dashed line to time axis */}
                                    <line
                                        x1={lastX}
                                        y1={lastY}
                                        x2={lastX}
                                        y2={chartHeight}
                                        stroke="rgba(156, 163, 175, 0.4)"
                                        strokeWidth="1"
                                        strokeDasharray="4,4"
                                    />

                                    {/* Glowing dot - outer glow */}
                                    <circle
                                        cx={lastX}
                                        cy={lastY}
                                        r="8"
                                        fill="#4FC3F7"
                                        opacity={0.3}
                                    />
                                    {/* Glowing dot - inner circle */}
                                    <circle
                                        cx={lastX}
                                        cy={lastY}
                                        r="5"
                                        fill="#4FC3F7"
                                        stroke="#ffffff"
                                        strokeWidth="2"
                                    />
                                </g>
                            );
                        })()}
                    </>
                ) : (
                    visibleData.map((candle, i) => {
                        const x = (i / (visibleData.length - 1)) * 900
                        const candleWidth = Math.max(8, (900 / visibleData.length) * 0.7)
                        const yHigh = chartHeight - ((candle.high - minPrice) / priceRange) * chartHeight
                        const yLow = chartHeight - ((candle.low - minPrice) / priceRange) * chartHeight
                        const yOpen = chartHeight - ((candle.open - minPrice) / priceRange) * chartHeight
                        const yClose = chartHeight - ((candle.close - minPrice) / priceRange) * chartHeight
                        const isGreen = candle.close > candle.open
                        const bodyHeight = Math.max(Math.abs(yClose - yOpen), 2)
                        const bodyY = Math.min(yOpen, yClose)
                        return (
                            <g key={i}>
                                <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={isGreen ? "#10b981" : "#ef4444"} strokeWidth={2} />
                                <rect
                                    x={x - candleWidth / 2}
                                    y={bodyY}
                                    width={candleWidth}
                                    height={bodyHeight}
                                    fill={isGreen ? "#10b981" : "#ef4444"}
                                    stroke={isGreen ? "#059669" : "#dc2626"}
                                    strokeWidth={1}
                                />
                            </g>
                        )
                    })
                )}

                {/* Trade Entry Points */}
                {tradeLabels.map((label, i) => {
                    const x = (label.x / Math.max(visibleData.length - 1, 1)) * 900
                    const y = chartHeight - ((label.y - minPrice) / priceRange) * chartHeight
                    const boxY = y - 50
                    const opacity = label.status === "active" ? 1 : 0.6

                    return (
                        <g key={`label-${i}`} opacity={opacity}>
                            {/* Маркер на линии графика */}
                            <circle
                                cx={x}
                                cy={y}
                                r="6"
                                fill={label.type === "buy" ? "#22c55e" : "#ef4444"}
                                stroke="#ffffff"
                                strokeWidth="2"
                            />

                            {/* Прямоугольник с суммой над маркером */}
                            <rect
                                x={x - (isMobile ? 60 : 30)}
                                y={boxY}
                                width={isMobile ? 120 : 60}
                                height={isMobile ? 35 : 30}
                                fill={label.type === "buy" ? "#22c55e" : "#ef4444"}
                                rx={8}
                                stroke="#1e293b"
                                strokeWidth={1}
                            />

                            {/* Сумма сделки и оставшееся время для активных сделок */}
                            <text
                                x={x}
                                y={boxY + (isMobile ? 18 : 15)}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize={isMobile ? "18" : "12"}
                                fontWeight="bold"
                            >
                                ${label.trade.amount}
                            </text>

                            {/* Оставшееся время для активных сделок */}
                            {label.status === 'active' && (() => {
                                const now = Date.now();
                                const expirationTime = label.trade.entryTimestamp + (label.trade.timeframe * 1000);
                                const timeLeft = Math.max(0, Math.ceil((expirationTime - now) / 1000));
                                const minutes = Math.floor(timeLeft / 60);
                                const seconds = timeLeft % 60;
                                const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                                return (
                                    <text
                                        x={x}
                                        y={boxY + (isMobile ? 32 : 25)}
                                        textAnchor="middle"
                                        fill="#ffffff"
                                        fontSize={isMobile ? "16" : "10"}
                                        fontWeight="600"
                                    >
                                        {timeString}
                                    </text>
                                );
                            })()}

                            {/* Вертикальная пунктирная линия от маркера к прямоугольнику */}
                            <line
                                x1={x}
                                y1={y - 6}
                                x2={x}
                                y2={boxY + (isMobile ? 35 : 30)}
                                stroke={label.type === "buy" ? "#22c55e" : "#ef4444"}
                                strokeWidth="1"
                                strokeDasharray="3,3"
                                opacity={0.7}
                            />

                            {/* Tooltip */}
                            <title>
                                {label.status === 'active'
                                    ? `${label.type.toUpperCase()}: Entry ${label.trade.entryPrice.toFixed(selectedPair === "USD/JPY" ? 2 : 5)} | Current ${currentRate?.toFixed(selectedPair === "USD/JPY" ? 2 : 5) || 'N/A'} | $${label.trade.amount} | ${label.trade.entryTime} | Active`
                                    : `${label.type.toUpperCase()}: Entry ${label.trade.entryPrice.toFixed(selectedPair === "USD/JPY" ? 2 : 5)} | Current ${label.y.toFixed(selectedPair === "USD/JPY" ? 2 : 5)} | $${label.trade.amount} | ${label.trade.entryTime}${label.trade.profit !== undefined ? ` | P&L: ${label.trade.profit.toFixed(2)}$` : ""}`
                                }
                            </title>
                        </g>
                    )
                })}
            </svg>

            {/* Current Price Label - right side */}
            {visibleData.length > 0 && (() => {
                const lastCandle = visibleData[visibleData.length - 1];
                const lastY = chartHeight - ((lastCandle.close - minPrice) / priceRange) * chartHeight;
                const topPercent = (lastY / chartHeight) * 85;

                return (
                    <div style={{
                        position: 'absolute',
                        right: '0px',
                        top: `${topPercent}%`,
                        transform: 'translateY(-50%)',
                        background: '#406490',
                        color: '#ffffff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        zIndex: 10
                    }}>
                        {lastCandle.close.toFixed(selectedPair === "USD/JPY" ? 2 : 5)}
                    </div>
                );
            })()}

            {/* Price labels */}
            <div
                style={{
                    position: "absolute",
                    right: "8px",
                    top: "16px",
                    height: "calc(100% - 64px)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    color: "rgba(156, 163, 175, 0.6)",
                }}
            >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i}>
                        {(maxPrice - (i * priceRange) / 8).toFixed(selectedPair === "USD/JPY" ? 2 : 5)}
                    </div>
                ))}
            </div>

            {/* Time labels */}
            <div
                style={{
                    position: "absolute",
                    bottom: "8px",
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    color: "rgba(156, 163, 175, 0.6)",
                }}
            >
                {[0, 1, 2, 3, 4, 5].map((i) => {
                    const index = Math.floor((i * visibleData.length) / 5)
                    return (
                        <div key={i} style={{ padding: "2px 6px" }}>
                            {index < visibleData.length ? visibleData[index].time : ""}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};