import { type FC } from 'react';
import SidebarItem from '../SidebarItem/SidebarItem';

const BottomNavigation: FC = () => {
    const link = import.meta.env.VITE_LINK || "https://pocketoption.com/en/cabinet/";

    return (
        <div className="bottom-navigation">
            <nav className="bottom-nav">
                <div className="bottom-nav__content">
                    <ul className="bottom-nav__list">
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
                            text="Social"
                        />
                        <SidebarItem
                            href={link}
                            icon="fas fa-bullseye"
                            text="Express"
                        />
                        <SidebarItem
                            href={link}
                            icon="fas fa-trophy"
                            text="Tournaments"
                        />
                        <SidebarItem
                            href={link}
                            icon="fas fa-hourglass-half"
                            text="Pending"
                        />
                    </ul>
                </div>
            </nav>
        </div>
    );
};

export default BottomNavigation;
