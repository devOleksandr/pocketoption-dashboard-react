import { type FC } from 'react';
import SidebarItem from '../SidebarItem/SidebarItem';

const LeftSidebar: FC = () => {
    const link = import.meta.env.VITE_LINK || "https://pocketoption.com/en/cabinet/";

    const createFaIcon = (className: string, color?: string) => (
        <i className={className} style={color ? { color } : undefined} aria-hidden="true"></i>
    );

    const navItems = [
        { text: 'Trading', icon: 'fa fa-line-chart', isActive: true },
        { text: 'Finance', icon: 'fa fa-dollar' },
        { text: 'Profile', icon: 'fa fa-user' },
        { text: 'Market', icon: '/assets/images/newPictures/market.svg' },
        { text: 'Achievements', icon: createFaIcon('fa fa-diamond', '#ffffff'), badge: { variant: 'bell' as const } },
        { text: 'Tournaments', icon: '/assets/images/newPictures/tournament.svg' },
        { text: 'Chat', icon: 'fa fa-comments-o', badge: { variant: 'count' as const, value: 4 } },
        { text: 'Help', icon: createFaIcon('fa fa-question-circle', '#ffffff'), badge: { variant: 'bell' as const } },
    ];

    const promoItems = [
        { id: 'treasures', image: '/assets/images/newPictures/promo1.png' },
        { id: 'promo', image: '/assets/images/newPictures/promo2.png' },
    ];

    return (
        <div className="left-sidebar show-text js-left-sidebar">
            <nav className="main-nav">
                <div className="main-nav__top">
                    <ul className="main-nav__list">
                        {navItems.map((item) => (
                            <SidebarItem
                                key={item.text}
                                href={link}
                                icon={item.icon}
                                text={item.text}
                                isActive={item.isActive}
                                badge={item.badge}
                            />
                        ))}
                    </ul>
                </div>
                <div className="main-nav__bottom">
                    <div className="main-nav__promos">
                        {promoItems.map((promo) => (
                            <a key={promo.id} href={link} className="promo-card" aria-label="Promotion">
                                <img src={promo.image} alt="Promotion" />
                            </a>
                        ))}
                    </div>
                    <button type="button" className="main-nav__arrow" aria-label="Collapse sidebar">
                        <i className="fa fa-long-arrow-left" aria-hidden="true"></i>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default LeftSidebar;
