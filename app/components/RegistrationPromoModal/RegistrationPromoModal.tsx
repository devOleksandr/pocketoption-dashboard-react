import { type FC } from 'react';
import { useTradingStore } from '~/stores';
import styles from './RegistrationPromoModal.module.scss';

export const RegistrationPromoModal: FC = () => {
    const { promoModalVisible, setPromoModalVisible } = useTradingStore();
    const registerLink = import.meta.env.VITE_LINK || 'https://example.com/register';

    if (!promoModalVisible) return null;

    return (
        <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Registration required">
            <div className={styles.modalContent}>
                <div className={styles.boxWrapper}>
                    <img
                        src="/assets/images/modal/box.png"
                        alt="Gift box"
                        className={styles.boxImage}
                    />
                    <img
                        src="/assets/images/modal/bonus-50.png"
                        alt="50% bonus"
                        className={styles.bonusBadge}
                    />
                </div>

                <div className={styles.contentMain}>
                    <h3 className={styles.title}>To continue, register for free!</h3>
                </div>

                <div className={styles.mainInner}>
                    <p className={styles.info}>Use promo code</p>
                    <div className={styles.promoCodeContainer}>
                        <span className={styles.promoCode}>GPTTRADER50</span>
                    </div>
                    <p className={styles.bonusText}>and get +50% on your first deposit!</p>
                </div>

                <a href={registerLink} className={styles.registerButton}>Registration</a>
            </div>
        </div>
    );
};

export default RegistrationPromoModal;


