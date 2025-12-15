import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Layout from '~/components/Layout/Layout';
import { WithdrawalModal } from '~/components';
import { useTradingStore } from '~/stores';
import styles from './withdrawal.module.scss';
import type { Route } from './+types/withdrawal';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Withdrawal - Pocket Land" },
        { name: "description", content: "Withdrawal page" },
    ];
}

type PaymentMethod = 'BTC' | 'ETH' | 'USDT' | 'TRX';

const PAYMENT_METHODS: { value: PaymentMethod; label: string; placeholder: string }[] = [
    { value: 'BTC', label: 'Bitcoin (BTC)', placeholder: 'Bitcoin (BTC) address' },
    { value: 'ETH', label: 'Ethereum', placeholder: 'Ethereum address' },
    { value: 'USDT', label: 'USDT', placeholder: 'USDT address' },
    { value: 'TRX', label: 'TRX', placeholder: 'TRX address' },
];

export default function Withdrawal() {
    const link = import.meta.env.VITE_LINK || "https://pocketoption.com/en/cabinet/";
    const navigate = useNavigate();
    const { balance, processWithdrawal } = useTradingStore();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BTC');
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');
    const [errors, setErrors] = useState<{ amount?: string; address?: string }>({});
    const [showModal, setShowModal] = useState(false);
    const [withdrawalAmount, setWithdrawalAmount] = useState(0);
    const [withdrawalMethod, setWithdrawalMethod] = useState('');

    const selectedMethod = PAYMENT_METHODS.find(m => m.value === paymentMethod) || PAYMENT_METHODS[0];

    const validateForm = (): boolean => {
        const newErrors: { amount?: string; address?: string } = {};

        const amountNum = parseFloat(amount);

        if (!amount || isNaN(amountNum) || amountNum <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        } else if (amountNum < 10) {
            newErrors.amount = 'Minimum withdrawal amount is 10 USD';
        } else if (amountNum > balance) {
            newErrors.amount = 'Insufficient balance';
        }

        if (!address || address.trim() === '') {
            newErrors.address = 'Please enter your wallet address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleContinue = () => {
        if (!validateForm()) {
            return;
        }

        const amountNum = parseFloat(amount);
        const methodLabel = selectedMethod.label;

        const transaction = processWithdrawal(amountNum, methodLabel, address);

        if (transaction) {
            setWithdrawalAmount(amountNum);
            setWithdrawalMethod(methodLabel);
            setShowModal(true);
            // Очистить форму
            setAmount('');
            setAddress('');
            setErrors({});
        } else {
            setErrors({ amount: 'Failed to process withdrawal. Please try again.' });
        }
    };

    return (
        <Layout>
            <div className={`${styles.siteContentIn} site-content-in js-site-content`}>
                <div id="content" className={`${styles.content} content withdrawal`}>
                    <div className="page-top-tabs">
                        <ul>
                            <li>
                                <a
                                    href={`${link}deposit-step-1/`}
                                    data-deposit-source="page-tabs-deposit"
                                    data-layout='{"event":"gtm_events","ga4_event_name":"finance__deposit"}'
                                    onClick={(e) => e.preventDefault()}
                                    className={styles.inactiveTab}
                                >
                                    Deposit
                                </a>
                            </li>
                            <li className="active">
                                <Link to="/cabinet/withdrawal" data-layout='{"event":"gtm_events","ga4_event_name":"finance__withdrawal"}'>
                                    Withdrawal
                                </Link>
                            </li>
                            <li>
                                <Link to="/cabinet/balance-history" data-layout='{"event":"gtm_events","ga4_event_name":"finance__history"}'>
                                    History
                                    <div className="counter counter--pending-withdrawal js-counter--pending-withdrawal" style={{ display: 'none' }}>
                                        <span className="counter__number">0</span>
                                    </div>
                                </Link>
                            </li>
                            <li>
                                <a
                                    href={`${link}cashback/`}
                                    data-layout='{"event":"gtm_events","ga4_event_name":"finance__cashback"}'
                                    onClick={(e) => e.preventDefault()}
                                    className={styles.inactiveTab}
                                >
                                    Cashback
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`${link}promo/`}
                                    data-layout='{"event":"gtm_events","ga4_event_name":"finance__promocodes"}'
                                    onClick={(e) => e.preventDefault()}
                                    className={styles.inactiveTab}
                                >
                                    Promo codes
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`${link}my-safe/`}
                                    data-layout='{"event":"gtm_events","ga4_event_name":"finance__safe"}'
                                    onClick={(e) => e.preventDefault()}
                                    className={styles.inactiveTab}
                                >
                                    My Safe
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="panel box-border">
                                <div className={`${styles.panelHeading} panel-heading`}>
                                    <div className="panel-title">Withdrawal</div>
                                </div>
                                <div className="panel-body">
                                    <div id="wizard" className="bwizard clearfix">
                                        <div className={styles.withdrawalForm}>
                                            <div className={styles.balanceInfo}>
                                                <div className={styles.balanceItem}>
                                                    <span className={styles.balanceLabel}>Free Balance:</span>
                                                    <span className={styles.balanceValue}>{balance.toFixed(2)} USD</span>
                                                </div>
                                                <div className={styles.balanceItem}>
                                                    <span className={styles.balanceLabel}>Minimum withdrawal amount:</span>
                                                    <span className={styles.balanceValue}>10 USD</span>
                                                </div>
                                                <div className={styles.balanceItem}>
                                                    <span className={styles.balanceLabel}>Commission:</span>
                                                    <span className={styles.balanceValue}>0 USD</span>
                                                </div>
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Payment Method:</label>
                                                <select
                                                    className={styles.formSelect}
                                                    value={paymentMethod}
                                                    onChange={(e) => {
                                                        setPaymentMethod(e.target.value as PaymentMethod);
                                                        setAddress('');
                                                    }}
                                                >
                                                    {PAYMENT_METHODS.map((method) => (
                                                        <option key={method.value} value={method.value}>
                                                            {method.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>Amount:</label>
                                                <div className={styles.inputContainer}>
                                                    <div className={styles.amountInputWrapper}>
                                                        <input
                                                            type="number"
                                                            className={`${styles.formInput} ${errors.amount ? styles.inputError : ''}`}
                                                            value={amount}
                                                            onChange={(e) => {
                                                                setAmount(e.target.value);
                                                                if (errors.amount) {
                                                                    setErrors({ ...errors, amount: undefined });
                                                                }
                                                            }}
                                                            placeholder="0"
                                                            min="10"
                                                            step="0.01"
                                                        />
                                                        <span className={styles.currencySymbol}>$</span>
                                                    </div>
                                                    {errors.amount && (
                                                        <span className={styles.errorMessage}>{errors.amount}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.formLabel}>{selectedMethod.placeholder}:</label>
                                                <div className={styles.inputContainer}>
                                                    <input
                                                        type="text"
                                                        className={`${styles.formInput} ${errors.address ? styles.inputError : ''}`}
                                                        value={address}
                                                        onChange={(e) => {
                                                            setAddress(e.target.value);
                                                            if (errors.address) {
                                                                setErrors({ ...errors, address: undefined });
                                                            }
                                                        }}
                                                        placeholder={`Enter ${selectedMethod.label} address`}
                                                    />
                                                    {errors.address && (
                                                        <span className={styles.errorMessage}>{errors.address}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={styles.formActions}>
                                                <button
                                                    className={styles.continueButton}
                                                    type="button"
                                                    onClick={handleContinue}
                                                >
                                                    Continue
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`${styles.footer} footer`}>
                    <div className="footer__in">
                        <div className="footer">
                            <div className="footer__top"></div>
                            <div className="footer__bottom">
                                <ul className="footer__nav">
                                    <li><a href={`${link}about-us/`} onClick={(e) => e.preventDefault()}>About us</a></li>
                                    <li><a href={`${link}support/`} onClick={(e) => e.preventDefault()}>Help</a></li>
                                    <li><a href={`${link}public-offer/`} onClick={(e) => e.preventDefault()}>Terms and Conditions</a></li>
                                    <li><a href={`${link}aml-policy/`} onClick={(e) => e.preventDefault()}>AML and KYC policy</a></li>
                                    <li><a href={`${link}privacy-policy/`} onClick={(e) => e.preventDefault()}>Privacy policy</a></li>
                                    <li><a href={`${link}payment-policy/`} onClick={(e) => e.preventDefault()}>Payment policy</a></li>
                                    <li><a href={`${link}responsibility-disclosure/`} onClick={(e) => e.preventDefault()}>Information disclosure</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <WithdrawalModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                amount={withdrawalAmount}
                method={withdrawalMethod}
            />
        </Layout>
    );
}

