import { type FC } from 'react';
import { useTradingStore } from '~/stores';

interface ChartTypeProps {
  redirectPairs?: string[];
  redirectUrl?: string;
}

export const ChartType: FC<ChartTypeProps> = ({
  redirectPairs = [],
  redirectUrl = ""
}) => {
  const {
    showPairDropdown,
    setShowPairDropdown,
    selectedPair,
    setSelectedPair,
    currencyPairs
  } = useTradingStore();

  const pairKeys = Object.keys(currencyPairs);
  const selectedIdx = pairKeys.indexOf(selectedPair);

  const handlePairSelect = (pair: string) => {
    if (redirectPairs.includes(pair)) {
      window.location.href = redirectUrl;
    } else {
      setSelectedPair(pair);
      setShowPairDropdown(false);
    }
  };

  return (
    <div className="chart-type">
      <div className="chart-type__main" onClick={() => setShowPairDropdown(!showPairDropdown)}>
        <span className="chart-type__name">{selectedPair} OTC</span>
        <i className="chart-type__arrow"></i>
      </div>

      <div className="chart-type__icons">
        <div className="chart-type__icon-btn">
          <img src="/assets/images/newPictures/icon1.svg" alt="Chart type" />
        </div>
        <div className="chart-type__icon-btn">
          <i className="fa fa-sliders" aria-hidden="true"></i>
        </div>
        <div className="chart-type__icon-btn">
          <i className="fa fa-paint-brush" aria-hidden="true"></i>
        </div>
        <div className="chart-type__icon-btn">
          <i className="fa fa-ellipsis-h" aria-hidden="true"></i>
        </div>
        <div className="chart-type__icon-btn">
          <img src="/assets/images/newPictures/icon2.svg" alt="Layout" />
        </div>
      </div>

      {showPairDropdown && (
        <div className="chart-type__dropdown">
          {Object.keys(currencyPairs).map((pair, idx) => (
            <div
              key={pair}
              onClick={() => handlePairSelect(pair)}
              className="chart-type__dropdown-item"
            >
              {pair} OTC
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
