import { type FC, useEffect, useState } from 'react';
import { useTradingStore } from '~/stores';
import './DesktopTimeframeSelector.scss';

const PRESET_TIMEFRAMES = [
    { value: 3, label: 'S3' },
    { value: 15, label: 'S15' },
    { value: 30, label: 'S30' },
    { value: 60, label: 'M1' },
    { value: 180, label: 'M3' },
    { value: 300, label: 'M5' },
    { value: 1800, label: 'M30' },
    { value: 3600, label: 'H1' },
    { value: 14400, label: 'H4' },
];

interface DesktopTimeframeSelectorProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DesktopTimeframeSelector: FC<DesktopTimeframeSelectorProps> = ({ isOpen, onClose }) => {
    const { timeframe, setTimeframe } = useTradingStore();
    const [position, setPosition] = useState({ top: 61.3906, left: 836 });

    // Позиционируем модальное окно относительно поля TIME
    useEffect(() => {
        if (isOpen) {
            const timeField = document.querySelector('.trading-side-panel__time-display');
            if (timeField) {
                const rect = timeField.getBoundingClientRect();
                // Позиционируем слева от поля TIME, на том же уровне
                setPosition({
                    top: 61.3906, // Фиксированная позиция
                    left: rect.left - 220 // Ширина модалки (200px) + отступ (20px)
                });
            }
        }
    }, [isOpen]);

    // Convert seconds to hours, minutes, seconds
    const getTimeComponents = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return { hours, minutes, seconds };
    };

    const { hours, minutes, seconds } = getTimeComponents(timeframe);

    const updateTimeframe = (newHours: number, newMinutes: number, newSeconds: number) => {
        const totalSeconds = newHours * 3600 + newMinutes * 60 + newSeconds;
        if (totalSeconds >= 5 && totalSeconds <= 36000) {
            setTimeframe(totalSeconds);
        }
    };

    const handleHoursChange = (delta: number) => {
        const newHours = Math.max(0, Math.min(10, hours + delta));
        updateTimeframe(newHours, minutes, seconds);
    };

    const handleMinutesChange = (delta: number) => {
        const newMinutes = Math.max(0, Math.min(59, minutes + delta));
        updateTimeframe(hours, newMinutes, seconds);
    };

    const handleSecondsChange = (delta: number) => {
        const newSeconds = Math.max(0, Math.min(59, seconds + delta));
        updateTimeframe(hours, minutes, newSeconds);
    };

    const handlePresetSelect = (value: number) => {
        setTimeframe(value);
        // Можно закрыть модалку после выбора, или оставить открытой
        // onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="desktop-timeframe-selector-overlay" onClick={onClose}>
            <div
                className="desktop-timeframe-selector"
                onClick={(e) => e.stopPropagation()}
                style={{
                    top: `${position.top}px`,
                    left: `${position.left}px`
                }}
            >
                {/* Time Controls */}
                <div className="desktop-timeframe-selector__time-controls">
                    <div className="desktop-timeframe-selector__time-column">
                        <button
                            className="desktop-timeframe-selector__time-btn desktop-timeframe-selector__time-btn--plus"
                            onClick={() => handleHoursChange(1)}
                        >
                            +
                        </button>
                        <div className="desktop-timeframe-selector__time-value">
                            {hours.toString().padStart(2, '0')}
                        </div>
                        <button
                            className="desktop-timeframe-selector__time-btn desktop-timeframe-selector__time-btn--minus"
                            onClick={() => handleHoursChange(-1)}
                        >
                            −
                        </button>
                    </div>
                    <div className="desktop-timeframe-selector__time-separator">:</div>
                    <div className="desktop-timeframe-selector__time-column">
                        <button
                            className="desktop-timeframe-selector__time-btn desktop-timeframe-selector__time-btn--plus"
                            onClick={() => handleMinutesChange(1)}
                        >
                            +
                        </button>
                        <div className="desktop-timeframe-selector__time-value">
                            {minutes.toString().padStart(2, '0')}
                        </div>
                        <button
                            className="desktop-timeframe-selector__time-btn desktop-timeframe-selector__time-btn--minus"
                            onClick={() => handleMinutesChange(-1)}
                        >
                            −
                        </button>
                    </div>
                    <div className="desktop-timeframe-selector__time-separator">:</div>
                    <div className="desktop-timeframe-selector__time-column">
                        <button
                            className="desktop-timeframe-selector__time-btn desktop-timeframe-selector__time-btn--plus"
                            onClick={() => handleSecondsChange(1)}
                        >
                            +
                        </button>
                        <div className="desktop-timeframe-selector__time-value">
                            {seconds.toString().padStart(2, '0')}
                        </div>
                        <button
                            className="desktop-timeframe-selector__time-btn desktop-timeframe-selector__time-btn--minus"
                            onClick={() => handleSecondsChange(-1)}
                        >
                            −
                        </button>
                    </div>
                </div>

                {/* Preset Buttons Grid */}
                <div className="desktop-timeframe-selector__presets">
                    {PRESET_TIMEFRAMES.map((preset) => (
                        <button
                            key={preset.value}
                            className={`desktop-timeframe-selector__preset-btn ${timeframe === preset.value ? 'desktop-timeframe-selector__preset-btn--active' : ''}`}
                            onClick={() => handlePresetSelect(preset.value)}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
