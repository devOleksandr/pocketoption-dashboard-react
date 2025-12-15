import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import Layout from '~/components/Layout/Layout';
import { useTradingStore } from '~/stores';
import styles from './balance-history.module.scss';
import type { Route } from './+types/balance-history';

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Balance History - Pocket Land" },
        { name: "description", content: "Balance History page" },
    ];
}

type TransactionFilter = 'all' | 'deposit' | 'withdrawal' | 'internal_transfer';

export default function BalanceHistory() {
    const link = import.meta.env.VITE_LINK || "https://pocketoption.com/en/cabinet/";
    const { transactions, pendingWithdrawalTimers, updateTransactionStatus, setPendingWithdrawalTimers } = useTradingStore();
    const [selectedFilter, setSelectedFilter] = useState<TransactionFilter>('all');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const filteredTransactions = selectedFilter === 'all' 
        ? transactions 
        : transactions.filter(t => t.type === selectedFilter);

    // Восстановление таймеров для pending транзакций при монтировании
    useEffect(() => {
        const pendingTransactions = transactions.filter(t => t.status === 'pending' && t.type === 'withdrawal');
        const now = Date.now();
        
        pendingTransactions.forEach(t => {
            // Проверяем, есть ли уже таймер для этой транзакции
            if (pendingWithdrawalTimers.has(t.id)) {
                return;
            }
            
            try {
                // Парсим дату в формате "2025-04-06 19:58:05"
                const [datePart, timePart] = t.date.split(' ');
                const [year, month, day] = datePart.split('-').map(Number);
                const [hours, minutes, seconds] = timePart.split(':').map(Number);
                const transactionDate = new Date(year, month - 1, day, hours, minutes, seconds).getTime();
                const elapsed = now - transactionDate;
                const maxDelay = 5 * 60 * 1000; // 5 минут максимум
                
                if (elapsed >= maxDelay) {
                    // Если прошло больше 5 минут, сразу установить completed
                    updateTransactionStatus(t.id, 'completed');
                } else {
                    // Пересчитать оставшееся время и запустить таймер
                    const remainingTime = maxDelay - elapsed;
                    const timer = setTimeout(() => {
                        updateTransactionStatus(t.id, 'completed');
                    }, remainingTime);
                    
                    const timers = new Map(pendingWithdrawalTimers);
                    timers.set(t.id, timer);
                    setPendingWithdrawalTimers(timers);
                }
            } catch (e) {
                console.error('Error restoring timer for transaction', t.id, e);
            }
        });
    }, []); // Только при монтировании

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    return (
        <Layout>
            <div className={`${styles.siteContentIn} site-content-in js-site-content`}>
                <div id="content" className={`${styles.content} content balance-history`}>
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
                            <li>
                                <Link to="/cabinet/withdrawal" data-layout='{"event":"gtm_events","ga4_event_name":"finance__withdrawal"}'>
                                    Withdrawal
                                </Link>
                            </li>
                            <li className="active">
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
                                    <div className="panel-title">Balance History</div>
                                </div>
                                <div className="panel-body" id="trading-history">
                                    <div className={styles.blockTopWrap}>
                                        <ul className={styles.subMenu}>
                                            <li>
                                                <a 
                                                    className={`btn btn-default ${selectedFilter === 'deposit' ? 'active' : ''}`}
                                                    href={`${link}balance-history/?t=d`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setSelectedFilter('deposit');
                                                    }}
                                                >
                                                    Deposits
                                                </a>
                                            </li>
                                            <li>
                                                <a 
                                                    className={`btn btn-default ${selectedFilter === 'withdrawal' ? 'active' : ''}`}
                                                    href={`${link}balance-history/?t=w`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setSelectedFilter('withdrawal');
                                                    }}
                                                >
                                                    Withdrawal
                                                </a>
                                            </li>
                                            <li>
                                                <a 
                                                    className={`btn btn-default ${selectedFilter === 'internal_transfer' ? 'active' : ''}`}
                                                    href={`${link}balance-history/?t=it`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setSelectedFilter('internal_transfer');
                                                    }}
                                                >
                                                    Internal transfers
                                                </a>
                                            </li>
                                            <li className="active">
                                                <a 
                                                    className={`btn btn-default ${selectedFilter === 'all' ? 'active' : ''}`}
                                                    href={`${link}balance-history/`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setSelectedFilter('all');
                                                    }}
                                                >
                                                    All Types
                                                </a>
                                            </li>
                                        </ul>
                                        <div className={styles.filtersBlock}>
                                            <form action={`${link}balance-history/`} method="get" acceptCharset="utf-8">
                                                <input type="hidden" name="t" value="" />
                                                <div className={styles.filtersBlockRow}>
                                                    <div className={`${styles.filtersBlockCol} ${styles.filtersBlockColDatepicker}`}>
                                                        <div 
                                                            id="reportrange" 
                                                            className={`form-control ${styles.reportrange}`}
                                                            data-date="2025-12-15 19:03:54"
                                                            data-opens="left"
                                                            data-max-date="2025-12-15"
                                                        >
                                                            <input type="hidden" name="date_from" value="2025-04-06" />
                                                            <input type="hidden" name="date_to" value="2025-12-15" />
                                                            <i className="fa fa-calendar"></i>&nbsp;
                                                            <span>
                                                                <span id="date-start">2025-04-06</span> - <span id="date-end">2025-12-15</span>
                                                            </span>
                                                            <b className="caret"></b>
                                                        </div>
                                                    </div>
                                                    <div className={`${styles.filtersBlockCol} ${styles.filtersBlockColBtn}`}>
                                                        <button type="submit" className="btn btn-primary" onClick={(e) => e.preventDefault()}>
                                                            Apply
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                    <table className={`table ${styles.tableAdaptive}`}>
                                        <colgroup>
                                            <col style={{ width: '12%' }} />
                                            <col style={{ width: '16%' }} />
                                            <col style={{}} />
                                            <col style={{ width: '12%' }} />
                                            <col style={{ width: '12%' }} />
                                            <col style={{ width: '12%' }} />
                                            <col style={{ width: '20%' }} />
                                        </colgroup>
                                        <thead>
                                            <tr>
                                                <th><div className={styles.trId}>ID</div></th>
                                                <th>Date</th>
                                                <th>Amount</th>
                                                <th>Method</th>
                                                <th>Type</th>
                                                <th>Status</th>
                                                <th>Bonus amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTransactions.map((transaction) => (
                                                <>
                                                    <tr 
                                                        key={transaction.id} 
                                                        className={`${styles.jsParent} ${styles.parent}`}
                                                        onClick={() => toggleRow(transaction.id)}
                                                    >
                                                        <td>
                                                            <div className={`${styles.flex} ${styles.flexAic}`}>
                                                                <div 
                                                                    className={`${styles.openBtn} ${styles.jsOpenBtn} ${styles.inlineFlex} ${styles.flexAic}`}
                                                                    title="More details"
                                                                >
                                                                    <svg className="svg-icon info-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M6 0C2.68594 0 0 2.68594 0 6C0 9.31406 2.68594 12 6 12C9.31406 12 12 9.31406 12 6C12 2.68594 9.31406 0 6 0ZM6 3C6.41414 3 6.75 3.33586 6.75 3.75C6.75 4.16414 6.41414 4.5 6 4.5C5.58586 4.5 5.25 4.16484 5.25 3.75C5.25 3.33516 5.58516 3 6 3ZM6.9375 9H5.0625C4.75313 9 4.5 8.74922 4.5 8.4375C4.5 8.12578 4.75195 7.875 5.0625 7.875H5.4375V6.375H5.25C4.93945 6.375 4.6875 6.12305 4.6875 5.8125C4.6875 5.50195 4.94063 5.25 5.25 5.25H6C6.31055 5.25 6.5625 5.50195 6.5625 5.8125V7.875H6.9375C7.24805 7.875 7.5 8.12695 7.5 8.4375C7.5 8.74805 7.24922 9 6.9375 9Z" fill="currentColor"></path>
                                                                    </svg>
                                                                </div>
                                                                {transaction.id}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={styles.adaptiveLabel}>Date</span>
                                                            {transaction.date}
                                                        </td>
                                                        <td>
                                                            <span className={styles.adaptiveLabel}>Amount</span>
                                                            ${transaction.amount.toFixed(2)}
                                                        </td>
                                                        <td>
                                                            <span className={styles.adaptiveLabel}>Method</span>
                                                            {transaction.method}
                                                        </td>
                                                        <td>
                                                            <span className={styles.adaptiveLabel}>Type</span>
                                                            {transaction.type === 'deposit' ? 'Deposit' : transaction.type === 'withdrawal' ? 'Withdrawal' : 'Internal Transfer'}
                                                        </td>
                                                        <td>
                                                            <span className={styles.adaptiveLabel}>Status</span>
                                                            <div className={`label ${
                                                                transaction.status === 'completed' 
                                                                    ? styles.labelSuccess 
                                                                    : transaction.status === 'pending' 
                                                                    ? styles.labelPending 
                                                                    : styles.labelFailed
                                                            }`}>
                                                                {transaction.status === 'completed' ? 'Completed' : transaction.status === 'pending' ? 'Pending' : 'Failed'}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className={`${styles.flex} ${styles.flexAic}`}>
                                                                <span className={styles.adaptiveLabel}>Bonus amount</span>
                                                                ${transaction.bonusAmount.toFixed(2)}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {expandedRows.has(transaction.id) && transaction.paymentAmount && (
                                                        <tr className={`${styles.jsChild} ${styles.fullInfoTr}`}>
                                                            <td colSpan={2}>
                                                                <div className={`${styles.fullInfo} ${styles.trId}`}>
                                                                    <div className={styles.fullInfoKey}>Payment Amount</div>
                                                                    <div className={styles.fullInfoVal}>{transaction.paymentAmount}</div>
                                                                </div>
                                                            </td>
                                                            <td colSpan={2}>
                                                                <div className={styles.fullInfo}>
                                                                    <div className={styles.fullInfoKey}>Account Details</div>
                                                                    <div className={styles.fullInfoVal}>{transaction.accountDetails}</div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className={styles.fullInfo}>
                                                                    <div className={styles.fullInfoKey}>Get help</div>
                                                                    <div className={styles.fullInfoVal}>
                                                                        <a 
                                                                            href={`${link}support/create?o=10,31,85&a=form&field=deposit_id&id=${transaction.id}`}
                                                                            target="_blank"
                                                                            className="btn btn-green"
                                                                            onClick={(e) => e.preventDefault()}
                                                                        >
                                                                            Contact support
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td colSpan={2}>
                                                                <div className={styles.fullInfo}>
                                                                    <div className={styles.fullInfoKey}>Comment</div>
                                                                    <div className={styles.fullInfoVal}>{transaction.comment}</div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className={styles.pullRight}>
                                        <ul className={`pagination ${styles.mT0} ${styles.mB10}`}>
                                        </ul>
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
        </Layout>
    );
}

