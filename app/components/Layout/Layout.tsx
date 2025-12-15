import { type FC, type ReactNode } from 'react';
import Header from '../Header/Header';
import LeftSidebar from '../LeftSidebar/LeftSidebar';
import styles from './Layout.module.scss';

interface LayoutProps {
    children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
    return (
        <>
            <Header />
            <div className="wrapper__bottom">
                <LeftSidebar />
                <div className="site-content left-shadow">
                    {children}
                </div>
            </div>
        </>
    );
};

export default Layout;

