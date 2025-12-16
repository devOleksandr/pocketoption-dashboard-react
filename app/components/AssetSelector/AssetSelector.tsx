import { useState, useEffect, useRef, type FC } from 'react';
import { useTradingStore } from '~/stores';
import styles from './AssetSelector.module.scss';

export const AssetSelector: FC = () => {
    const {
        showPairDropdown,
        setShowPairDropdown,
        selectedPair,
        setSelectedPair,
        currencyPairs
    } = useTradingStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'asset' | 'payout'>('payout');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [activeCategory, setActiveCategory] = useState<'currencies' | 'commodities' | 'stocks' | 'indices' | 'favorites' | 'schedule'>('currencies');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    // Закрытие дропдауна при клике вне его
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setShowPairDropdown(false);
            }
        };

        if (showPairDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showPairDropdown, setShowPairDropdown]);

    // Всегда возвращаем активную категорию к currencies при открытии
    useEffect(() => {
        if (showPairDropdown) {
            setActiveCategory('currencies');
        }
    }, [showPairDropdown]);

    // Позиционирование дропдауна
    useEffect(() => {
        if (showPairDropdown && triggerRef.current && dropdownRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            dropdownRef.current.style.top = `${triggerRect.bottom + 10}px`;
            dropdownRef.current.style.left = `${triggerRect.left}px`;
        }
    }, [showPairDropdown]);

    const handlePairSelect = (pair: string) => {
        setSelectedPair(pair);
        setShowPairDropdown(false);
        setSearchQuery('');
    };

    // Все доступные валютные пары (активные + неактивные)
    // Активные пары (из CURRENCY_PAIRS) - БЕЗ OTC
    const activePairs = Object.keys(currencyPairs);
    
    // Неактивные пары - те же самые, но с " OTC" в названии
    const inactivePairs = activePairs.map(pair => `${pair} OTC`);
    
    const allPairs = [...activePairs, ...inactivePairs];

    // Определяем, является ли пара активной (есть в CURRENCY_PAIRS и БЕЗ " OTC" в конце)
    const isActivePair = (pair: string): boolean => {
        // Убираем " OTC" из конца названия для проверки
        const pairWithoutOtc = pair.replace(/ OTC$/, '');
        return pairWithoutOtc in currencyPairs && !pair.endsWith(' OTC');
    };
    
    // Получаем базовое название пары (без OTC)
    const getBasePairName = (pair: string): string => {
        return pair.replace(/ OTC$/, '');
    };

    // Фильтрация пар
    const filteredPairs = allPairs.filter(pair =>
        pair.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Сортировка пар
    const sortedPairs = [...filteredPairs].sort((a, b) => {
        const aActive = isActivePair(a);
        const bActive = isActivePair(b);
        
        if (sortBy === 'asset') {
            // При сортировке по asset: сначала активные, потом неактивные, все по алфавиту
            if (aActive && !bActive) return -1;
            if (!aActive && bActive) return 1;
            const result = a.localeCompare(b);
            return sortDirection === 'asc' ? result : -result;
        } else {
            // Сортировка по выплате: активные пары имеют payout, неактивные - N/A
            // Активные пары всегда выше неактивных
            if (aActive && !bActive) return -1;
            if (!aActive && bActive) return 1;
            
            // Если обе активные, сортируем по payout
            if (aActive && bActive) {
                const aBase = getBasePairName(a);
                const bBase = getBasePairName(b);
                const aPayout = currencyPairs[aBase]?.payout || 0;
                const bPayout = currencyPairs[bBase]?.payout || 0;
                
                // Сначала сортируем по payout
                if (aPayout !== bPayout) {
                    if (sortDirection === 'asc') {
                        // При возрастании: меньшие значения идут первыми
                        // Если aPayout < bPayout, возвращаем отрицательное число (a идет перед b)
                        return aPayout - bPayout;
                    } else {
                        // При убывании: большие значения идут первыми
                        // Если bPayout > aPayout, возвращаем положительное число (b идет перед a)
                        return bPayout - aPayout;
                    }
                }
                
                // Если payout одинаковый, сортируем по алфавиту для стабильности
                // При возрастании: A-Z, при убывании: Z-A
                const result = a.localeCompare(b);
                return sortDirection === 'asc' ? result : -result;
            }
            
            // Если обе неактивные, сортируем по алфавиту (они внизу)
            const result = a.localeCompare(b);
            return sortDirection === 'asc' ? result : -result;
        }
    });

    // Получение кодов валют из пары (например, "EUR/USD" -> ["EUR", "USD"])
    const getCurrencyCodes = (pair: string): string[] => {
        return pair.split('/');
    };

    // Получение CSS класса для флага валюты (используем библиотеку flag-icons)
    const getFlagClass = (currency: string): string => {
        const currencyLower = currency.toLowerCase();
        // Маппинг валют на коды стран для flag-icons
        const currencyToCountry: Record<string, string> = {
            'eur': 'eu',
            'usd': 'us',
            'aud': 'au',
            'cad': 'ca',
            'jpy': 'jp',
            'chf': 'ch',
            'gbp': 'gb',
            'nzd': 'nz',
            'sek': 'se',
            'nok': 'no',
            'dkk': 'dk',
            'pln': 'pl',
            'czk': 'cz',
            'huf': 'hu',
            'ron': 'ro',
            'try': 'tr',
            'rub': 'ru',
            'inr': 'in',
            'cny': 'cn',
            'cnh': 'cn',
            'krw': 'kr',
            'sgd': 'sg',
            'hkd': 'hk',
            'thb': 'th',
            'myr': 'my',
            'idr': 'id',
            'php': 'ph',
            'vnd': 'vn',
            'pkr': 'pk',
            'bdt': 'bd',
            'lkr': 'lk',
            'mxn': 'mx',
            'brl': 'br',
            'ars': 'ar',
            'clp': 'cl',
            'cop': 'co',
            'pen': 'pe',
            'egp': 'eg',
            'zar': 'za',
            'ngn': 'ng',
            'kes': 'ke',
            'mad': 'ma',
            'tnd': 'tn',
            'aed': 'ae',
            'sar': 'sa',
            'qar': 'qa',
            'omr': 'om',
            'bhd': 'bh',
            'yer': 'ye',
            'lbp': 'lb',
            'jod': 'jo',
            'dzd': 'dz',
            'uah': 'ua',
        };
        const countryCode = currencyToCountry[currencyLower] || currencyLower;
        return `fi fi-${countryCode}`;
    };

    return (
        <>
            <div className="chart-type">
                <div 
                    ref={triggerRef}
                    className="chart-type__main" 
                    onClick={() => setShowPairDropdown(!showPairDropdown)}
                >
                    <span className="chart-type__name">{selectedPair}</span>
                    <i className="chart-type__arrow"></i>
                </div>

                <div className="chart-type__icons">
                    <div className="chart-type__icon-btn">
                        <img src="/assets/images/newPictures/icon1.svg" alt="Chart type" />
                    </div>
                    <div className="chart-type__icon-btn">
                        <i className="fa fa-sliders" aria-hidden="true"></i>
                    </div>
                    <div className="chart-type__icon-btn">
                        <i className="fa fa-paint-brush" aria-hidden="true"></i>
                    </div>
                    <div className="chart-type__icon-btn">
                        <i className="fa fa-ellipsis-h" aria-hidden="true"></i>
                    </div>
                    <div className="chart-type__icon-btn">
                        <img src="/assets/images/newPictures/icon2.svg" alt="Layout" />
                    </div>
                </div>
            </div>

            {showPairDropdown && (
                <>
                    <div 
                        className={styles.dropDownModalWrap}
                        onClick={() => setShowPairDropdown(false)}
                    ></div>
                    <div 
                        ref={dropdownRef}
                        className={`${styles.dropDownModal} ${styles.dropDownModalQuotesList}`}
                    >
                        <div className={styles.assetsBlock}>
                            {/* Левая колонка - навигация */}
                            <div className={`${styles.assetsBlockCol} ${styles.assetsBlockColNav}`}>
                                <div className={styles.scrollbarContainer}>
                                    <div className={styles.assetsBlockNav}>
                                        <a 
                                            className={`${styles.assetsBlockNavItem} ${styles.assetsBlockNavItemCurrency} ${activeCategory === 'currencies' ? styles.assetsBlockNavItemActive : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setActiveCategory('currencies');
                                            }}
                                        >
                                            <span className={styles.assetsBlockNavIconWrap}>
                                                <i className={`${styles.assetsBlockNavIcon} fa fa-usd`}></i>
                                            </span>
                                            <span className={styles.assetsBlockNavItemLabel}>Currencies</span>
                                        </a>
                                        <a 
                                            className={`${styles.assetsBlockNavItem} ${styles.assetsBlockNavItemCommodity} ${activeCategory === 'commodities' ? styles.assetsBlockNavItemActive : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                // Отключено — ничего не происходит
                                            }}
                                        >
                                            <span className={styles.assetsBlockNavIconWrap}>
                                                <i className={`${styles.assetsBlockNavIcon} fa fa-tint`}></i>
                                            </span>
                                            <span className={styles.assetsBlockNavItemLabel}>Commodities</span>
                                        </a>
                                        <a 
                                            className={`${styles.assetsBlockNavItem} ${styles.assetsBlockNavItemStock} ${activeCategory === 'stocks' ? styles.assetsBlockNavItemActive : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                // Отключено - ничего не происходит
                                            }}
                                        >
                                            <span className={styles.assetsBlockNavIconWrap}>
                                                <i className={`${styles.assetsBlockNavIcon} fa fa-file-text-o`}></i>
                                            </span>
                                            <span className={styles.assetsBlockNavItemLabel}>Stocks</span>
                                        </a>
                                        <a 
                                            className={`${styles.assetsBlockNavItem} ${styles.assetsBlockNavItemIndex} ${activeCategory === 'indices' ? styles.assetsBlockNavItemActive : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                // Отключено - ничего не происходит
                                            }}
                                        >
                                            <span className={styles.assetsBlockNavIconWrap}>
                                                <svg className={styles.svgIcon} xmlns="http://www.w3.org/2000/svg" width="18px" viewBox="0 0 512 512">
                                                    <path d="M490.6 110.6H333.3c-28.5 0-42.8 34.4-22.6 54.6l43.2 43.2-97.7 97.8-97.7-97.7c-16.7-16.7-43.6-16.7-60.3 0L6.6 299.9c-8.3 8.3-8.3 21.8 0 30.1l30.1 30.1c8.3 8.3 21.8 8.3 30.1 0l61.4-61.4 97.7 97.7c16.7 16.7 43.6 16.7 60.3 0l127.9-127.9 43.2 43.2c20.1 20.1 54.6 5.9 54.6-22.6V132c0-11.8-9.5-21.4-21.3-21.4z"></path>
                                                </svg>
                                            </span>
                                            <span className={styles.assetsBlockNavItemLabel}>Indices</span>
                                        </a>
                                        <a 
                                            className={`${styles.assetsBlockNavItem} ${styles.assetsBlockNavItemFavorites} ${activeCategory === 'favorites' ? styles.assetsBlockNavItemActive : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                // Отключено - ничего не происходит
                                            }}
                                        >
                                            <span className={styles.assetsBlockNavIconWrap}>
                                                <i className={`${styles.assetsBlockNavIcon} fa fa-star`}></i>
                                            </span>
                                            <span className={styles.assetsBlockNavItemLabel}>Favorites</span>
                                        </a>
                                    </div>
                                    <div className={`${styles.assetsBlockNav} ${styles.assetsBlockNavBottom}`}>
                                        <a 
                                            className={`${styles.assetsBlockNavItem} ${styles.assetsBlockNavItemCalendar} ${activeCategory === 'schedule' ? styles.assetsBlockNavItemActive : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                // Отключено - ничего не происходит
                                            }}
                                        >
                                            <span className={styles.assetsBlockNavIconWrap}>
                                                <i className={`${styles.assetsBlockNavIcon} fa fa-calendar-o`}></i>
                                            </span>
                                            <span className={styles.assetsBlockNavItemLabel}>Schedule</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Правая колонка - контент */}
                            {activeCategory === 'currencies' && (
                                <div className={`${styles.assetsBlockCol} ${styles.assetsBlockColBody}`}>
                                    {/* Фильтры и поиск */}
                                    <div className={`${styles.assetsBlockFilters} ${styles.filters}`}>
                                        <div className={`${styles.filtersSearchBlock} ${styles.search}`}>
                                            <input
                                                className={styles.searchField}
                                                type="text"
                                                placeholder="Search"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                autoComplete="off"
                                            />
                                            <i className={`${styles.searchIcon} fa fa-search`}></i>
                                        </div>
                                    </div>

                                    {/* Кнопки сортировки */}
                                    <div className={styles.assetsBlockFiltersSortBlock}>
                                        <a
                                            className={`${styles.sortBlockItem} ${styles.sortBlockItemSortAlphabet} ${sortBy === 'asset' ? styles.sortBlockItemActive : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (sortBy === 'asset') {
                                                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                                } else {
                                                    setSortBy('asset');
                                                    setSortDirection('asc');
                                                }
                                            }}
                                        >
                                            Asset
                                            {sortBy === 'asset' && (
                                                <i className={`${styles.sortBlockIcon} fa fa-caret-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                                            )}
                                        </a>
                                        <a
                                            className={`${styles.sortBlockItem} ${styles.sortBlockItemSortProfit} ${sortBy === 'payout' ? styles.sortBlockItemActive : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (sortBy === 'payout') {
                                                    // Переключаем направление сортировки
                                                    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                                                    setSortDirection(newDirection);
                                                } else {
                                                    // Устанавливаем сортировку по payout с направлением по убыванию (desc)
                                                    setSortBy('payout');
                                                    setSortDirection('desc');
                                                }
                                            }}
                                        >
                                            Payout
                                            {sortBy === 'payout' && (
                                                <i className={`${styles.sortBlockIcon} fa fa-caret-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                                            )}
                                        </a>
                                    </div>

                                    {/* Список активов */}
                                    <div className={styles.assetsBlockBodyWrap}>
                                        <div className={styles.assetsBlockBody}>
                                            <div className={styles.scrollbarContainer}>
                                                <div className={styles.assetsBlockBodyCurrency}>
                                                    <ul className={`${styles.assetsBlockAlist} ${styles.alist} ${styles.alistCurrency}`}>
                                                        {sortedPairs.length === 0 ? (
                                                            <li className={styles.alistItem}>
                                                                <div className={styles.alistNoResults}>No pairs found</div>
                                                            </li>
                                                        ) : (
                                                            sortedPairs.map((pair) => {
                                                                const basePairName = getBasePairName(pair);
                                                                const [base, target] = getCurrencyCodes(basePairName);
                                                                const isSelected = basePairName === selectedPair;
                                                                const isActive = isActivePair(pair);
                                                                return (
                                                                    <li 
                                                                        key={pair}
                                                                        className={`${styles.alistItem} ${isSelected ? styles.alistItemActive : ''} ${!isActive ? styles.alistItemNoActive : ''}`}
                                                                    >
                                                                        <a 
                                                                            className={styles.alistLink}
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                if (isActive) {
                                                                                    handlePairSelect(basePairName);
                                                                                }
                                                                            }}
                                                                        >
                                                                            <span className={styles.alistIconWrap}>
                                                                                <i className={`${styles.alistIcon} fa fa-star-o add`}></i>
                                                                            </span>
                                                                            <span className={`${styles.alistFlag} ${styles.flag} ${styles.flagTwo}`}>
                                                                                <span className={getFlagClass(base)}></span>
                                                                                <span className={getFlagClass(target)}></span>
                                                                            </span>
                                                                            <span className={styles.alistLabel}>
                                                                                {pair}
                                                                            </span>
                                                                            <span className={styles.alistPayout}>
                                                                                {isActive ? (
                                                                                    <span>+{currencyPairs[basePairName]?.payout || 92}%</span>
                                                                                ) : (
                                                                                    <span className={styles.alistScheduleInfo}>
                                                                                        <i className={`fa fa-minus-circle ${styles.alistScheduleInfoIcon}`}></i>
                                                                                        <span className={styles.alistScheduleInfoText}>N/A</span>
                                                                                    </span>
                                                                                )}
                                                                            </span>
                                                                        </a>
                                                                    </li>
                                                                );
                                                            })
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Для других категорий показываем пустое состояние */}
                            {activeCategory !== 'currencies' && (
                                <div className={`${styles.assetsBlockCol} ${styles.assetsBlockColBody}`}>
                                    <div className={styles.assetsBlockBodyWrap}>
                                        <div className={styles.assetsBlockBody}>
                                            <div className={styles.scrollbarContainer}>
                                                <div className={styles.alistNoResults}>
                                                    {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} coming soon
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

