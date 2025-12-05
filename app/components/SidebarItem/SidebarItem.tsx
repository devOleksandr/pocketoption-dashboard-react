import { type FC, type ReactNode } from 'react';

type BadgeConfig =
    | { variant: 'bell' }
    | { variant: 'count'; value: number | string };

interface SidebarItemProps {
    href: string;
    icon: string | ReactNode;
    text?: string;
    isActive?: boolean;
    isBackArrow?: boolean;
    className?: string;
    badge?: BadgeConfig;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    href,
    icon,
    text,
    isActive = false,
    isBackArrow = false,
    className = '',
    badge
}) => {
    const linkClass = `main-nav__link ${isBackArrow ? 'main-nav__link--back' : ''} ${className}`.trim();
    const itemClass = `main-nav__item ${isActive ? 'main-nav__item--active' : ''}`.trim();

    const renderBadge = () => {
        if (!badge) return null;

        if (badge.variant === 'bell') {
            return (
                <span className="main-nav__badge main-nav__badge--bell" aria-label="Notification">
                    <i className="fa fa-bell" aria-hidden="true"></i>
                </span>
            );
        }

        return (
            <span className="main-nav__badge main-nav__badge--pill" aria-label="Unread messages">
                {badge.value}
            </span>
        );
    };

    return (
        <li className={itemClass}>
            <a href={href} className={linkClass}>
                <div className="main-nav__icon">
                    {typeof icon === 'string'
                        ? (() => {
                              const trimmedIcon = icon.trim();
                              const isFontAwesome =
                                  trimmedIcon.startsWith('fa ') ||
                                  trimmedIcon.startsWith('fas ') ||
                                  trimmedIcon.startsWith('far ') ||
                                  trimmedIcon.startsWith('fab ');

                              if (isFontAwesome) {
                                  return <i className={trimmedIcon}></i>;
                              }

                              return <img src={trimmedIcon} alt={text || 'Icon'} />;
                          })()
                        : icon}
                    {renderBadge()}
                </div>
                {text && <span className="main-nav__text">{text}</span>}
            </a>
        </li>
    );
};

export default SidebarItem;
