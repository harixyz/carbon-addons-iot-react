import React, { useRef } from 'react';
import moment from 'moment';
import { LineChart } from '@carbon/charts-react';
import '@carbon/charts/style.css';
import isEmpty from 'lodash/isEmpty';
import styled from 'styled-components';
import isNil from 'lodash/isNil';
import memoize from 'lodash/memoize';
import useDeepCompareEffect from 'use-deep-compare-effect';
import withSize from 'react-sizeme';

import { TimeSeriesCardPropTypes, CardPropTypes } from '../../constants/PropTypes';
import { CARD_SIZES } from '../../constants/LayoutConstants';
import Card from '../Card/Card';

import { generateSampleValues } from './timeSeriesUtils';

const LineChartWrapper = styled.div`
  padding-left: 16px;
  padding-right: 1rem;
  padding-top: ${props => (props.isLegendHidden ? '16px' : '0px')};
  padding-bottom: ${props => (!props.size === CARD_SIZES.MEDIUM ? '16px' : '0px')};
  position: absolute;
  width: 100%;
  height: ${props => props.contentHeight};

  &&& {
    .chart-wrapper g.x.axis g.tick text {
      transform: initial !important;
      text-anchor: initial !important;
    }
    .legend-wrapper {
      display: ${props => (props.isLegendHidden ? 'none' : 'inline-block')};
      height: ${props => (!props.size === CARD_SIZES.MEDIUM ? '40px' : '20px')} !important;
    }
    .chart-holder {
      width: 100%;
      height: 100%;
    }
  }
`;

const determineHeight = (size, measuredWidth) => {
  let height = '100%';
  switch (size) {
    case CARD_SIZES.MEDIUM:
    case CARD_SIZES.LARGE:
      if (measuredWidth && measuredWidth > 635) {
        height = '90%';
      }
      break;
    case CARD_SIZES.XLARGE:
      height = '90%';
      break;
    default:
      break;
  }
  return height;
};

const determinePrecision = (size, value, precision) => {
  // If it's an integer don't return extra values
  if (Number.isInteger(value)) {
    return 0;
  }
  // If the card is xsmall we don't have room for decimals!
  switch (size) {
    case CARD_SIZES.XSMALL:
      return Math.abs(value) > 9 ? 0 : precision;
    default:
  }
  return precision;
};

const formatChartData = (labels, series, values) => {
  return {
    labels,
    datasets: series.map(({ dataSourceId, label, color }) => ({
      label,
      backgroundColors: color ? [color] : null,
      data: values.map(i => i[dataSourceId]),
    })),
  };
};

const valueFormatter = (value, size, unit) => {
  const precision = determinePrecision(size, value, 1);
  let renderValue = value;
  if (typeof value === 'number') {
    renderValue =
      value > 1000000000000
        ? `${(value / 1000000000000).toFixed(precision)}T`
        : value > 1000000000
        ? `${(value / 1000000000).toFixed(precision)}B`
        : value > 1000000
        ? `${(value / 1000000).toFixed(precision)}M`
        : value > 1000
        ? `${(value / 1000).toFixed(precision)}K`
        : value.toFixed(precision);
  } else if (isNil(value)) {
    renderValue = '--';
  }
  return `${renderValue} ${unit || ''}`;
};

const memoizedGenerateSampleValues = memoize(generateSampleValues);

const TimeSeriesCard = ({
  title,
  content: { series, timeDataSourceId, xLabel, yLabel, unit },
  size,
  interval,
  isEditable,
  values: valuesProp,
  locale,
  ...others
}) => {
  let chartRef = useRef();

  const values = isEditable ? memoizedGenerateSampleValues(series, timeDataSourceId) : valuesProp;

  const valueSort = values
    ? values.sort((left, right) =>
        moment.utc(left[timeDataSourceId]).diff(moment.utc(right[timeDataSourceId]))
      )
    : [];

  const sameYear =
    !isEmpty(values) &&
    moment(moment.unix(valueSort[0][timeDataSourceId] / 1000)).isSame(moment(), 'year') &&
    moment(moment.unix(valueSort[valueSort.length - 1][timeDataSourceId] / 1000)).isSame(
      moment(),
      'year'
    );

  const formatInterval = (timestamp, index, ticksInterval) => {
    // moment locale default to english
    moment.locale('en');
    if (locale) {
      moment.locale(locale);
    }
    const m = moment.unix(timestamp / 1000);

    return interval === 'hour' && index === 0
      ? m.format('DD MMM')
      : interval === 'hour' &&
        index !== 0 &&
        !moment(moment.unix(valueSort[index - ticksInterval].timestamp / 1000)).isSame(
          moment.unix(valueSort[index].timestamp / 1000),
          'day'
        )
      ? m.format('DD MMM')
      : interval === 'hour'
      ? m.format('HH:mm')
      : interval === 'day' && index === 0
      ? m.format('DD MMM')
      : interval === 'day' && index !== 0
      ? m.format('DD MMM')
      : interval === 'month' && !sameYear
      ? m.format('MMM YYYY')
      : interval === 'month' && sameYear && index === 0
      ? m.format('MMM YYYY')
      : interval === 'month' && sameYear
      ? m.format('MMM')
      : interval === 'year'
      ? m.format('YYYY')
      : interval === 'minute'
      ? m.format('HH:mm')
      : m.format('DD MMM YYYY');
  };

  const maxTicksPerSize = () => {
    switch (size) {
      case CARD_SIZES.SMALL:
        return 2;
      case CARD_SIZES.MEDIUM:
        return 4;
      case CARD_SIZES.WIDE:
      case CARD_SIZES.LARGE:
        return 6;
      case CARD_SIZES.XLARGE:
        return 14;
      default:
        return 10;
    }
  };

  const ticksInterval =
    Math.round(valueSort.length / maxTicksPerSize(size)) !== 0
      ? Math.round(valueSort.length / maxTicksPerSize(size))
      : 1;

  const labels = valueSort.map((i, idx) =>
    idx % ticksInterval === 0
      ? formatInterval(i[timeDataSourceId], idx, ticksInterval)
      : ' '.repeat(idx)
  );

  useDeepCompareEffect(
    () => {
      if (chartRef && chartRef.chart) {
        const chartData = formatChartData(labels, series, values);
        chartRef.chart.setData(chartData);
      }
    },
    [values, labels, series]
  );

  return (
    <withSize.SizeMe>
      {({ size: measuredSize }) => {
        const height = determineHeight(size, measuredSize.width);
        return (
          <Card
            title={title}
            size={size}
            {...others}
            isEditable={isEditable}
            isEmpty={isEmpty(values)}
          >
            {!others.isLoading && !isEmpty(values) ? (
              <LineChartWrapper
                size={size}
                contentHeight={height}
                isLegendHidden={series.length === 1}
              >
                <LineChart
                  ref={el => {
                    chartRef = el;
                  }}
                  data={formatChartData(labels, series, values)}
                  options={{
                    animations: false,
                    accessibility: false,
                    scales: {
                      x: {
                        title: xLabel,
                      },
                      y: {
                        title: yLabel,
                        formatter: axisValue => valueFormatter(axisValue, size, unit),
                        // numberOfTicks: 8,
                        yMaxAdjuster: yMaxValue => yMaxValue * 1.3,
                      },
                    },
                    legendClickable: true,
                    containerResizable: true,
                    tooltip: {
                      formatter: tooltipValue => valueFormatter(tooltipValue, size, unit),
                    },
                  }}
                  width="100%"
                  height="100%"
                />
              </LineChartWrapper>
            ) : null}
          </Card>
        );
      }}
    </withSize.SizeMe>
  );
};

TimeSeriesCard.propTypes = { ...CardPropTypes, ...TimeSeriesCardPropTypes };

TimeSeriesCard.defaultProps = {
  size: CARD_SIZES.MEDIUM,
  values: [],
};

export default TimeSeriesCard;
