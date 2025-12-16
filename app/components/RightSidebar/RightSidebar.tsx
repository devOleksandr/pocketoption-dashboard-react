import { type FC } from 'react';
import SidebarItem from '../SidebarItem/SidebarItem';
import { useTradingStore } from '~/stores';

const RightSidebar: FC = () => {
    const link = import.meta.env.VITE_LINK || "https://pocketoption.com/en/cabinet/";
    const { showTradesPanel, setShowTradesPanel, activeTrades } = useTradingStore();

    const handleTradesClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setShowTradesPanel(!showTradesPanel);
    };

    // Подсчитываем количество активных трейдов
    const activeTradesCount = activeTrades.filter(trade => trade.status === 'active').length;

    return (
        <div className="right-sidebar show-text js-right-sidebar">
            <nav className="main-nav">
                <div className="main-nav__top">
                    <ul className="main-nav__list">
                        <SidebarItem
                            href={link}
                            icon="fa fa-history"
                            text="Trades"
                            isActive={showTradesPanel}
                            onClick={handleTradesClick}
                            badge={activeTradesCount > 0 ? { variant: 'count', value: activeTradesCount } : undefined}
                        />
                        <SidebarItem
                            href={link}
                            icon="fa fa-signal"
                            text="Signals"
                        />
                        <SidebarItem
                            href={link}
                            icon="fa fa-users"
                            text="Social Trading"
                        />
                        <SidebarItem
                            href={link}
                            icon="fa fa-bullseye"
                            text="Express Trades"
                        />
                        <SidebarItem
                            href={link}
                            icon="fa fa-hourglass-o"
                            text="Pending Trades"
                        />
                        <SidebarItem
                            href={link}
                            icon="fa fa-keyboard-o"
                            text="Hotkeys"
                        />
                    </ul>
                </div>

                <div className="main-nav__bottom">
                    <ul className="main-nav__list main-nav__list--auth">
                        <SidebarItem
                            href={link}
                            icon="fa fa-expand"
                            text="Full screen"
                        />
                        <SidebarItem
                            href={link}
                            icon="fa fa-arrow-left"
                            isBackArrow={true}
                        />
                    </ul>
                </div>
            </nav>
        </div>
    );
};

export default RightSidebar;
