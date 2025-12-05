import { type FC } from 'react';
import { useTradingStore } from '~/stores';

const Header: FC = () => {
  const { balance } = useTradingStore();
  const link = import.meta.env.VITE_LINK || "https://pocketoption.com/en/cabinet/";

  return (
    <>
      {/* Desktop Header */}
      <header className="site-header site-header--desktop">
        <a href={link} className="site-header__logo">
          <svg width="202" height="30" viewBox="0 0 250 37" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '100%', height: 'auto' }}>
            <path fillRule="evenodd" clipRule="evenodd" d="M247.459 18.8994C247.459 15.5084 245.676 12.9092 242.537 12.9092C239.952 12.9092 236.894 14.4053 236.894 18.8979V26.6239H234.404V11.1589H236.894V13.1035C238.426 11.2392 240.753 10.7308 242.717 10.7308C247.147 10.7308 250.041 13.479 250 18.4304C249.998 18.5561 249.989 18.8117 249.979 19.0586V26.6239H247.459V18.8994Z" fill="white"></path>
            <path fillRule="evenodd" clipRule="evenodd" d="M223.653 10.7308C228.179 10.7308 231.853 14.3907 231.853 18.8994C231.853 23.4081 228.179 27.0695 223.653 27.0695C219.126 27.0695 215.451 23.4081 215.451 18.8994C215.451 14.3907 219.126 10.7308 223.653 10.7308ZM223.653 12.7543C226.862 12.7543 229.467 15.5084 229.467 18.8994C229.467 22.2919 226.862 25.046 223.653 25.046C220.444 25.046 217.839 22.2919 217.839 18.8994C217.839 15.5084 220.444 12.7543 223.653 12.7543Z" fill="white"></path>
            <path fillRule="evenodd" clipRule="evenodd" d="M212.592 11.1633H210.046V26.6283H212.592V11.1633ZM211.319 5.6143C212.292 5.6143 213.081 6.40034 213.081 7.369C213.081 8.33766 212.292 9.1237 211.319 9.1237C210.347 9.1237 209.558 8.33766 209.558 7.369C209.558 6.40034 210.347 5.6143 211.319 5.6143Z" fill="white"></path>
            <path fillRule="evenodd" clipRule="evenodd" d="M207.452 25.8042L206.904 26.095C202.968 28.2632 198.696 26.976 198.505 21.9544H198.499V13.4162H195.542V11.1808H198.499V5.6143H201.047V11.1808H205.592V13.4162H201.047V21.4752C201.047 25.3747 204.252 25.0752 205.557 23.9166L207.452 25.8042Z" fill="white"></path>
            <path fillRule="evenodd" clipRule="evenodd" d="M181.047 12.9852C182.518 11.5884 184.51 10.7308 186.701 10.7308C191.227 10.7308 194.903 14.3907 194.903 18.8994C194.903 23.4081 191.227 27.0695 186.701 27.0695C184.51 27.0695 182.518 26.2118 181.047 24.8151V32.3248H178.5V11.1589H181.047V12.9852ZM186.701 12.7543C189.91 12.7543 192.515 15.5084 192.515 18.8994C192.515 22.2919 189.91 25.0459 186.701 25.0459C183.492 25.0459 180.887 22.2919 180.887 18.8994C180.887 15.5084 183.492 12.7543 186.701 12.7543Z" fill="white"></path>
            <path fillRule="evenodd" clipRule="evenodd" d="M164.751 5.39529C170.72 5.39529 175.566 10.224 175.566 16.1704C175.566 22.1168 170.72 26.944 164.751 26.944C158.779 26.944 153.933 22.1168 153.933 16.1704C153.933 10.224 158.779 5.39529 164.751 5.39529ZM164.751 7.63504C169.207 7.63504 172.824 11.46 172.824 16.1704C172.824 20.8807 169.207 24.7057 164.751 24.7057C160.293 24.7057 156.676 20.8807 156.676 16.1704C156.676 11.46 160.293 7.63504 164.751 7.63504Z" fill="white"></path>
            <path fillRule="evenodd" clipRule="evenodd" d="M152.549 25.556L151.999 25.8468C148.125 27.9814 142.951 27.1237 142.738 21.9517L142.706 20.945V14.2871H140.156V11.1152H142.811L143.106 5.71382H146.537V11.1152H150.515V14.2871H146.537V21.2256H146.549C146.531 23.9226 148.69 23.6216 149.865 22.8824L152.549 25.556Z" fill="white"></path>
            <path fillRule="evenodd" clipRule="evenodd" d="M131.154 26.9538C126.677 26.869 123.075 23.2778 123.075 18.8363C123.075 14.3948 126.695 10.7904 131.154 10.7904C135.611 10.7904 139.231 14.3948 139.231 18.8363C139.231 19.2863 139.195 19.7261 139.123 20.1556H127.069C127.581 22.0228 129.288 23.383 131.208 23.4312C133.021 23.4283 134.527 22.9958 135.726 21.9512L138.125 24.4306C137.993 24.5723 137.855 24.7067 137.715 24.8353C136.081 26.3095 133.842 26.9567 131.154 26.9538ZM135.187 17.517C134.676 15.6498 133.006 14.2282 131.154 14.2282C129.301 14.2282 127.581 15.6498 127.069 17.517H135.187Z" fill="white"></path>
            <path fillRule="evenodd" clipRule="evenodd" d="M111.672 17.5175L113.847 14.7956L117.508 11.0977H122.812L115.515 18.5504L123.431 26.6343H118.127L112.863 21.2577L112.018 21.9239L112.008 26.6343H108.064V5.71382H112.008V13.1636L111.672 17.5175Z" fill="white"></path>
            <path fillRule="evenodd" clipRule="evenodd" d="M103.423 25.7543C102.216 26.4716 100.805 26.8822 99.2986 26.8822C94.8397 26.8822 91.2212 23.2778 91.2212 18.8363C91.2212 14.3948 94.8397 10.7904 99.2986 10.7904C100.798 10.7904 102.203 11.198 103.407 11.9081C103.904 12.1989 104.881 12.9513 105.478 13.9681L102.8 16.5746C102.09 15.2085 100.823 14.2896 99.2986 14.2896C97.031 14.2896 95.3618 16.3262 95.3618 18.8363C95.3618 21.3463 97.031 23.383 99.2986 23.383C100.823 23.383 102.09 22.4626 102.8 21.098L105.475 23.7001C104.877 24.7126 103.904 25.4635 103.407 25.7543H103.423Z" fill="white"></path>
            <path fillRule="evenodd" clipRule="evenodd" d="M81.223 10.7904C85.6804 10.7904 89.3003 14.3948 89.3003 18.8363C89.3003 23.2778 85.6804 26.8822 81.223 26.8822C76.7641 26.8822 73.1442 23.2778 73.1442 18.8363C73.1442 14.3948 76.7641 10.7904 81.223 10.7904ZM81.223 14.2896C83.4891 14.2896 85.1113 16.3262 85.1113 18.8363C85.1113 21.3463 83.4891 23.383 81.223 23.383C78.9554 23.383 77.2584 21.3463 77.2584 18.8363C77.2584 16.3262 78.9554 14.2896 81.223 14.2896Z" fill="white"></path>
            <path fillRule="evenodd" clipRule="evenodd" d="M63.2387 5.71382C67.7327 5.71382 71.3761 9.74627 71.3761 14.2229C71.3761 14.2243 71.3761 14.2258 71.3761 14.2287C71.3761 18.7053 67.7327 22.916 63.2387 22.916H59.5967V26.6343H55.107V5.71382H63.2387ZM66.9217 14.2229C66.9217 11.9992 65.2642 9.79447 63.0319 9.79447H59.5967V18.8368H63.0319C65.2642 18.8368 66.9217 16.8673 66.9217 14.2272V14.2229Z" fill="white"></path>
            <path fillRule="evenodd" clipRule="evenodd" d="M22.8617 1.71209C28.8916 4.28817 33.0188 9.77219 33.0188 16.1033C33.0188 22.437 28.8902 27.921 22.8603 30.4945C16.8318 27.921 12.7017 22.437 12.7017 16.1033C12.7017 9.7709 16.8318 4.28688 22.8617 1.71209Z" fill="#002CD2"></path>
            <path fillRule="evenodd" clipRule="evenodd" d="M22.8564 1.71737C24.9461 0.59784 27.3297 0 29.8508 0C38.614 0 45.728 7.21819 45.728 16.1099C45.728 25.0003 38.614 32.2184 29.8508 32.2184C27.3297 32.2184 24.9461 31.6219 22.8551 30.501C28.1251 27.9263 31.7355 22.4422 31.7355 16.1099C31.7355 9.77748 28.1263 4.29345 22.8564 1.71737Z" fill="#0099FA"></path>
            <path fillRule="evenodd" clipRule="evenodd" d="M22.8729 30.4998C20.7819 31.6206 18.3971 32.2185 15.8773 32.2185H6.50692L2.28945 36.4977C1.90639 36.8864 1.32989 37.0026 0.828479 36.7921C0.327066 36.5817 0 36.0858 0 35.5345V2.07894C0 0.931006 0.917563 0 2.04893 0H15.9282C18.4314 0.00774761 20.7985 0.605608 22.8741 1.71739C17.6029 4.29218 13.9925 9.77621 13.9925 16.1086C13.9925 22.4423 17.6029 27.9263 22.8729 30.4998Z" fill="#1A4DDE"></path>
          </svg>
        </a>

        <div id="js-window-layout-switcher" className="window-layout-switcher"></div>
        <div id="js-fav-panel-switcher"></div>

        <div className="right-block">
          <div className="right-block__item bonus-btn-wrap" style={{ display: 'flex' }}>
            <a className="h-btn h-btn--bonus js-bonus-100" href={link}>
              <div className="h-btn__start">
                <img src="/css/header-buttons/bonus-icon.png" alt="" />
              </div>
              <div className="h-btn__end">
                <div className="h-btn__text">
                  Get 50% bonus
                </div>
                <div className="h-btn__text-small">
                  Open Real Account
                </div>
              </div>
            </a>
          </div>
          <div className="right-block__item js-try-demo-balance">
            <div className="demo-balance">
              <div className="demo-balance__content">
                <div className="demo-balance__top">
                  <span className="demo-balance__account">QT Real</span>
                  <span className="demo-balance__currency">USD</span>
                </div>
                <div className="demo-balance__bottom">
                  <span className="demo-balance__amount" title={`$${Math.floor(balance).toLocaleString()}`}>
                    ${Math.floor(balance).toLocaleString()}
                  </span>
                  <svg className="demo-balance__dropdown-icon" width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L0 0H8L4 6Z" fill="#ffffff"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="right-block__item deposit-btn-wrap">
            <a className="h-btn h-btn--deposit" href={link}>
              <div className="h-btn__start">
                <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 4H16V3C16 2.20435 15.6839 1.44129 15.1213 0.87868C14.5587 0.316071 13.7956 0 13 0H3C2.20435 0 1.44129 0.316071 0.87868 0.87868C0.316071 1.44129 0 2.20435 0 3V15C0 15.7956 0.316071 16.5587 0.87868 17.1213C1.44129 17.6839 2.20435 18 3 18H17C17.7956 18 18.5587 17.6839 19.1213 17.1213C19.6839 16.5587 20 15.7956 20 15V7C20 6.20435 19.6839 5.44129 19.1213 4.87868C18.5587 4.31607 17.7956 4 17 4ZM3 2H13C13.2652 2 13.5196 2.10536 13.7071 2.29289C13.8946 2.48043 14 2.73478 14 3V4H3C2.73478 4 2.48043 3.89464 2.29289 3.70711C2.10536 3.51957 2 3.26522 2 3C2 2.73478 2.10536 2.48043 2.29289 2.29289C2.48043 2.10536 2.73478 2 3 2ZM18 12H17C16.7348 12 16.4804 11.8946 16.2929 11.7071C16.1054 11.5196 16 11.2652 16 11C16 10.7348 16.1054 10.4804 16.2929 10.2929C16.4804 10.1054 16.7348 10 17 10H18V12ZM18 8H17C16.2044 8 15.4413 8.31607 14.8787 8.87868C14.3161 9.44129 14 10.2044 14 11C14 11.7956 14.3161 12.5587 14.8787 13.1213C15.4413 13.6839 16.2044 14 17 14H18V15C18 15.2652 17.8946 15.5196 17.7071 15.7071C17.5196 15.8946 17.2652 16 17 16H3C2.73478 16 2.48043 15.8946 2.29289 15.7071C2.10536 15.5196 2 15.2652 2 15V5.83C2.32127 5.94302 2.65943 6.00051 3 6H17C17.2652 6 17.5196 6.10536 17.7071 6.29289C17.8946 6.48043 18 6.73478 18 7V8Z" fill="currentColor"></path>
                </svg>
              </div>
              <div className="h-btn__end">
                <div className="h-btn__text">
                  Top up
                </div>
              </div>
            </a>
          </div>
          <div className="right-block__item">
            <a href={link} style={{ textDecoration: 'none' }}>
              <div className="header-avatar js-header-avatar">
                <div className="header-avatar__l">
                  <div className="user-avatar user-avatar--level--1 tooltip2" style={{ '--user-avatar-size': '42px' } as React.CSSProperties}>
                    <div className="user-avatar__profile-level-icon">
                    </div>
                    <div className="user-avatar__img-wrap user-avatar__img-wrap--demo">
                      <img src="/css/cabinet/no_avatar.png?v=1747309251&w=42" alt="" className="user-avatar__img" />
                    </div>

                    <div className="profile-level" style={{ '--profile-level-size': '42px' } as React.CSSProperties}>
                    </div>
                    <div className="tooltip-content position-down">
                      <div className="tooltip-text">Demo</div>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="site-header site-header--mobile">
        <div className="mobile-header__left">
          <a href={link} style={{ textDecoration: 'none' }}>
            <div className="header-avatar js-header-avatar">
              <div className="header-avatar__l">
                <div className="user-avatar user-avatar--level--1 tooltip2" style={{ '--user-avatar-size': '32px' } as React.CSSProperties}>
                  <div className="user-avatar__profile-level-icon"></div>
                  <div className="user-avatar__img-wrap user-avatar__img-wrap--demo">
                    <img src="/css/cabinet/no_avatar.png?v=1747309251&w=32" alt="" className="user-avatar__img" />
                  </div>
                  <div className="profile-level" style={{ '--profile-level-size': '32px' } as React.CSSProperties}></div>
                  <div className="tooltip-content position-down">
                    <div className="tooltip-text">Demo</div>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>

        <div className="mobile-header__center">
          <a href={link} className="gift-icon-btn">
            <img src="/css/header-buttons/bonus-icon.png" alt="Gift" />
          </a>

          <div className="demo-balance">
            <div className="demo-balance__content">
              <div className="demo-balance__top">
                <span className="demo-balance__account">QT Real</span>
                <span className="demo-balance__currency">USD</span>
              </div>
              <div className="demo-balance__bottom">
                <span className="demo-balance__amount" title={`$${Math.floor(balance).toLocaleString()}`}>
                  ${Math.floor(balance).toLocaleString()}
                </span>
                <svg className="demo-balance__dropdown-icon" width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6L0 0H8L4 6Z" fill="#ffffff"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mobile-header__right">
          <a className="deposit-btn" href={link}>
            <div className="deposit-btn__icon">
              <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 4H16V3C16 2.20435 15.6839 1.44129 15.1213 0.87868C14.5587 0.316071 13.7956 0 13 0H3C2.20435 0 1.44129 0.316071 0.87868 0.87868C0.316071 1.44129 0 2.20435 0 3V15C0 15.7956 0.316071 16.5587 0.87868 17.1213C1.44129 17.6839 2.20435 18 3 18H17C17.7956 18 18.5587 17.6839 19.1213 17.1213C19.6839 16.5587 20 15.7956 20 15V7C20 6.20435 19.6839 5.44129 19.1213 4.87868C18.5587 4.31607 17.7956 4 17 4ZM3 2H13C13.2652 2 13.5196 2.10536 13.7071 2.29289C13.8946 2.48043 14 2.73478 14 3V4H3C2.73478 4 2.48043 3.89464 2.29289 3.70711C2.10536 3.51957 2 3.26522 2 3C2 2.73478 2.10536 2.48043 2.29289 2.29289C2.48043 2.10536 2.73478 2 3 2ZM18 12H17C16.7348 12 16.4804 11.8946 16.2929 11.7071C16.1054 11.5196 16 11.2652 16 11C16 10.7348 16.1054 10.4804 16.2929 10.2929C16.4804 10.1054 16.7348 10 17 10H18V12ZM18 8H17C16.2044 8 15.4413 8.31607 14.8787 8.87868C14.3161 9.44129 14 10.2044 14 11C14 11.7956 14.3161 12.5587 14.8787 13.1213C15.4413 13.6839 16.2044 14 17 14H18V15C18 15.2652 17.8946 15.5196 17.7071 15.7071C17.5196 15.8946 17.2652 16 17 16H3C2.73478 16 2.48043 15.8946 2.29289 15.7071C2.10536 15.5196 2 15.2652 2 15V5.83C2.32127 5.94302 2.65943 6.00051 3 6H17C17.2652 6 17.5196 6.10536 17.7071 6.29289C17.8946 6.48043 18 6.73478 18 7V8Z" fill="currentColor"></path>
              </svg>
            </div>
            <div className="deposit-btn__text">Top up</div>
          </a>
        </div>
      </header>
    </>
  );
};

export default Header;