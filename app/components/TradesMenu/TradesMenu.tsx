import { type FC, useEffect } from 'react';
import { useTradingStore } from '~/stores';
import styles from './TradesMenu.module.scss';

const TradesMenu: FC = () => {
    const { showTradesMenu, setShowTradesMenu } = useTradingStore();
    const link = import.meta.env.VITE_LINK || "https://pocketoption.com/en/cabinet/";

    useEffect(() => {
        if (!showTradesMenu) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Проверяем, что клик не по элементам Trades меню и не по Trades в сайдбаре
            if (
                !target.closest(`.${styles.menu}`) &&
                !target.closest('[data-trades-item]') &&
                !target.closest('.main-nav__item')
            ) {
                setShowTradesMenu(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowTradesMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showTradesMenu, setShowTradesMenu]);

    if (!showTradesMenu) return null;

    return (
        <div className={styles.menu} data-id="trades">
            <ul className={styles.list}>
                <li>
                    <a className={`${styles.link} ${styles.linkActive}`} href={`${link}trades/`}>
                        <div className={styles.icon}>
                            <i className="fas fa-history"></i>
                        </div>
                        <span>Trades</span>
                    </a>
                </li>
                <li>
                    <a className={styles.link} href={`${link}signals/`}>
                        <div className={styles.icon}>
                            <i className="fas fa-broadcast-tower"></i>
                        </div>
                        <span>Signals</span>
                    </a>
                </li>
                <li>
                    <a className={styles.link} href={`${link}social-trading/`}>
                        <div className={styles.icon}>
                            <i className="fas fa-users"></i>
                        </div>
                        <span>Social Trading</span>
                    </a>
                </li>
                <li>
                    <a className={styles.link} href={`${link}express-trades/`}>
                        <div className={styles.icon}>
                            <i className="fas fa-bullseye"></i>
                        </div>
                        <span>Express Trades</span>
                    </a>
                </li>
                <li>
                    <a className={styles.link} href={`${link}pending-trades/`}>
                        <div className={styles.icon}>
                            <i className="fas fa-hourglass-half"></i>
                        </div>
                        <span>Pending Trades</span>
                    </a>
                </li>
                <li>
                    <a className={styles.link} href={`${link}hotkeys/`}>
                        <div className={styles.icon}>
                            <i className="fas fa-keyboard"></i>
                        </div>
                        <span>Hotkeys</span>
                    </a>
                </li>
            </ul>
        </div>
    );
};

export default TradesMenu;
