import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { FC } from 'react';
import styles from './WithdrawalModal.module.scss';

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    method: string;
}

export const WithdrawalModal: FC<WithdrawalModalProps> = ({ isOpen, onClose, amount, method }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            // Автоматическое закрытие и перенаправление через 2-3 секунды
            const timer = setTimeout(() => {
                onClose();
                navigate('/cabinet/balance-history');
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose, navigate]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Withdrawal Request</h3>
                    <button className={styles.closeButton} onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z" fill="#F8F8FB"></path>
                        </svg>
                    </button>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.message}>
                        Ваш вывод в обработке
                    </div>
                    <div className={styles.details}>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Amount:</span>
                            <span className={styles.detailValue}>${amount.toFixed(2)}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Method:</span>
                            <span className={styles.detailValue}>{method}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.modalFooter}>
                    <button className={styles.okButton} onClick={() => {
                        onClose();
                        navigate('/cabinet/balance-history');
                    }}>
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WithdrawalModal;

