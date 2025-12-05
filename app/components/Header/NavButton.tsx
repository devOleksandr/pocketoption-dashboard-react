import { forwardRef, type ReactNode } from 'react'

interface NavButtonProps {
    onClick?: () => void
    href?: string
    className?: string
    children: ReactNode
    'aria-label'?: string
}

const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(({
    onClick,
    href,
    className,
    children,
    'aria-label': ariaLabel
}, ref) => {
    const handleClick = () => {
        if (onClick) {
            onClick()
        } else if (href) {
            window.location.href = href
        }
    }

    return (
        <button
            ref={ref}
            className={className}
            onClick={handleClick}
            aria-label={ariaLabel}
        >
            {children}
        </button>
    )
})

NavButton.displayName = 'NavButton'

export default NavButton
