import { type FC } from 'react';
import { Link, useLocation } from 'react-router';
import { useTradingStore } from '~/stores';
import SidebarItem from '../SidebarItem/SidebarItem';

const LeftSidebar: FC = () => {
    const link = import.meta.env.VITE_LINK || "https://pocketoption.com/en/cabinet/";
    const { showFinanceMenu, setShowFinanceMenu } = useTradingStore();
    const location = useLocation();
    const isTradingActive = location.pathname === '/' || location.pathname === '/trading';
    const isFinanceActive = location.pathname === '/cabinet/withdrawal' || location.pathname === '/cabinet/balance-history';

    const createFaIcon = (className: string, color?: string) => (
        <i className={className} style={color ? { color } : undefined} aria-hidden="true"></i>
    );

    const handleFinanceClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setShowFinanceMenu(!showFinanceMenu);
    };

    const handleInactiveClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
    };

    const navItems = [
        { text: 'Trading', icon: 'fa fa-line-chart', isActive: isTradingActive, href: '/', useLink: true },
        { text: 'Finance', icon: 'fa fa-dollar', isActive: isFinanceActive, onClick: handleFinanceClick },
        { text: 'Profile', icon: 'fa fa-user', onClick: handleInactiveClick },
        { text: 'Market', icon: '/assets/images/newPictures/market.svg', onClick: handleInactiveClick },
        { text: 'Achievements', icon: createFaIcon('fa fa-diamond', '#ffffff'), badge: { variant: 'bell' as const }, onClick: handleInactiveClick },
        { text: 'Tournaments', icon: '/assets/images/newPictures/tournament.svg', onClick: handleInactiveClick },
        { text: 'Chat', icon: 'fa fa-comments-o', badge: { variant: 'count' as const, value: 4 }, onClick: handleInactiveClick },
        { text: 'Help', icon: createFaIcon('fa fa-question-circle', '#ffffff'), badge: { variant: 'bell' as const }, onClick: handleInactiveClick },
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
                        {navItems.map((item) => {
                            if (item.useLink && item.href) {
                                // Для Trading используем Link
                                return (
                                    <li key={item.text} className={`main-nav__item ${item.isActive ? 'main-nav__item--active' : ''}`}>
                                        <Link to={item.href} className="main-nav__link" onClick={() => setShowFinanceMenu(false)}>
                                            <div className="main-nav__icon">
                                                {typeof item.icon === 'string' ? (
                                                    <i className={item.icon}></i>
                                                ) : (
                                                    item.icon
                                                )}
                                            </div>
                                            {item.text && <span className="main-nav__text">{item.text}</span>}
                                        </Link>
                                    </li>
                                );
                            }
                            
                            // Для остальных используем SidebarItem
                            return (
                                <SidebarItem
                                    key={item.text}
                                    href={link}
                                    icon={item.icon}
                                    text={item.text}
                                    isActive={item.isActive}
                                    badge={item.badge}
                                    onClick={item.onClick}
                                />
                            );
                        })}
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
