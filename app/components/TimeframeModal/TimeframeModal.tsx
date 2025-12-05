import { type FC } from 'react';
import { useTradingStore } from '~/stores';

interface TimeframeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PRESET_TIMEFRAMES = [
    // Секунды
    { value: 5, label: 'S5' },
    { value: 15, label: 'S15' },
    { value: 30, label: 'S30' },

    // Минуты
    { value: 60, label: 'M1' },
    { value: 180, label: 'M3' },
    { value: 300, label: 'M5' },
    { value: 1800, label: 'M30' },

    // Часы
    { value: 3600, label: 'H1' },
    { value: 14400, label: 'H4' },
];

export const TimeframeModal: FC<TimeframeModalProps> = ({ isOpen, onClose }) => {
    const { timeframe, setTimeframe } = useTradingStore();

    const handlePresetSelect = (value: number) => {
        setTimeframe(value);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="timeframe-modal-overlay" onClick={onClose}>
            <div className="timeframe-modal" onClick={(e) => e.stopPropagation()}>
                {/* Preset Buttons */}
                <div className="timeframe-modal__presets">
                    {PRESET_TIMEFRAMES.map((preset) => (
                        <button
                            key={preset.value}
                            className={`preset-btn ${timeframe === preset.value ? 'preset-btn--active' : ''}`}
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