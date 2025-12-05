import { type FC } from 'react';
import { useTradingStore } from '~/stores';
import styles from './WelcomeBonusModal.module.scss';

export const WelcomeBonusModal: FC = () => {
    const { welcomeBonusModalVisible } = useTradingStore();
    const depositLink = import.meta.env.VITE_LINK || 'https://example.com/deposit';

    if (!welcomeBonusModalVisible) return null;

    return (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Welcome Bonus">
            <div className={styles.modalContent}>

                <div className={styles.welcomeBonusModal}>
                    <div className={styles.modalImg}>
                        <img
                            className={styles.boxImage}
                            src="/assets/images/modal/box.png"
                            alt="Gift box"
                            srcSet="/assets/images/modal/box.png 1x, /assets/images/modal/box.png 2x"
                        />
                        <img
                            className={styles.bonusImage}
                            src="/assets/images/modal/bonus-50.png"
                            alt="50% bonus"
                            srcSet="/assets/images/modal/bonus-50.png 1x, /assets/images/modal/bonus-50.png 2x"
                        />
                    </div>

                    <div className={styles.modalHeader}>
                        <div className={styles.modalTitle}>To continue, register for free! </div>
                        
                        <div className={styles.modalInner}>
                            <p className={styles.modalInfo}>Use promo code</p>
                            <div className={styles.promoCodeContainer}>
                                <span className={styles.promoCode}>GPTTRADER50</span>
                            </div>
                            <p className={styles.modalBonusText}>and get +50% on your first deposit!</p>
                        </div>
                    </div>



                    <div className={styles.btnWrap}>
                        <a href={depositLink} className={styles.btnGreen}>
                            Registration
                        </a>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default WelcomeBonusModal;

