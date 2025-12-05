import { type FC } from 'react';
import SidebarItem from '../SidebarItem/SidebarItem';

const RightSidebar: FC = () => {
    const link = import.meta.env.VITE_LINK || "https://pocketoption.com/en/cabinet/";

    return (
        <div className="right-sidebar show-text js-right-sidebar">
            <nav className="main-nav">
                <div className="main-nav__top">
                    <ul className="main-nav__list">
                        <SidebarItem
                            href={link}
                            icon="fas fa-history"
                            text="Trades"
                        />
                        <SidebarItem
                            href={link}
                            icon="fas fa-broadcast-tower"
                            text="Signals"
                        />
                        <SidebarItem
                            href={link}
                            icon="fas fa-users"
                            text="Social Trading"
                        />
                        <SidebarItem
                            href={link}
                            icon="fas fa-bullseye"
                            text="Express Trades"
                        />
                        <SidebarItem
                            href={link}
                            icon="fas fa-hourglass-half"
                            text="Pending Trades"
                        />
                        <SidebarItem
                            href={link}
                            icon="fas fa-keyboard"
                            text="Hotkeys"
                        />
                    </ul>
                </div>

                <div className="main-nav__bottom">
                    <ul className="main-nav__list main-nav__list--auth">
                        <SidebarItem
                            href={link}
                            icon="fas fa-expand"
                            text="Full screen"
                        />
                        <SidebarItem
                            href={link}
                            icon="fas fa-arrow-left"
                            isBackArrow={true}
                        />
                    </ul>
                </div>
            </nav>
        </div>
    );
};

export default RightSidebar;
