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
        <div className="chart-type__media">
          <img src={`/assets/images/pars/${selectedIdx + 1}.png`} alt="" />
        </div>
        <span className="chart-type__name">{selectedPair}</span>
        <i className="chart-type__arrow"></i>
      </div>

      {showPairDropdown && (
        <div className="chart-type__dropdown">
          {Object.keys(currencyPairs).map((pair, idx) => (
            <div
              key={pair}
              onClick={() => handlePairSelect(pair)}
              className="chart-type__dropdown-item"
            >
              <img src={`/assets/images/pars/${(idx % 10) + 1}.png`} alt="" />
              {pair}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
