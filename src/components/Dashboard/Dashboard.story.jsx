import React, { useState } from 'react';
/*
import uuidv1 from 'uuid/v1';
*/
import { text, boolean } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
/*
import { Button } from 'carbon-components-react';
import moment from 'moment';
*/

import {
  getIntervalChartData,
  getPeriodChartData,
  chartData,
  tableColumns,
  tableData,
} from '../../utils/sample';
import { COLORS, CARD_SIZES, CARD_TYPES } from '../../constants/LayoutConstants';

import Dashboard from './Dashboard';

const timeOffset = new Date().getTime() - chartData.dataItemToMostRecentTimestamp.temperature;

const originalCards = [
  {
    title: 'Facility Metrics',
    id: 'facilitycard',
    size: CARD_SIZES.SMALL,
    type: CARD_TYPES.VALUE,
    availableActions: {
      delete: true,
    },
    content: {
      attributes: [
        { label: 'Comfort Level', dataSourceId: 'comfortLevel', unit: '%' },
        { label: 'Utilization', dataSourceId: 'utilization', unit: '%' },
        { label: 'Pressure', dataSourceId: 'pressure', unit: 'mb' },
      ],
    },
    values: {
      comfortLevel: 89,
      utilization: 76,
      pressure: 21.4,
    },
  },
  {
    title: 'Humidity',
    id: 'facilitycard-xs',
    size: CARD_SIZES.XSMALL,
    type: CARD_TYPES.VALUE,
    availableActions: {
      delete: true,
    },
    content: {
      attributes: [
        {
          dataSourceId: 'humidity',
          unit: '%',
          thresholds: [
            { comparison: '<', value: '40', color: 'red' },
            { comparison: '<', value: '70', color: 'green' },
            { comparison: '>=', value: '70', color: 'red' },
          ],
        },
      ],
    },
    values: {
      humidity: 62.1,
    },
  },
  {
    title: 'Utilization',
    id: 'facilitycard-xs2',
    size: CARD_SIZES.XSMALL,
    type: CARD_TYPES.VALUE,
    availableActions: {
      delete: true,
    },
    content: {
      attributes: [{ dataSourceId: 'utilization', label: 'Average', unit: '%' }],
    },
    values: {
      utilization: 76,
    },
  },
  {
    title: 'Alert Count',
    id: 'facilitycard-xs3',
    size: CARD_SIZES.XSMALL,
    type: CARD_TYPES.VALUE,
    availableActions: {
      delete: true,
    },
    content: {
      attributes: [
        {
          label: 'weekly',
          dataSourceId: 'alertCount',
          secondaryValue: { dataSourceId: 'alertCountTrend', trend: 'up', color: 'green' },
        },
      ],
    },
    values: { alertCount: 35, alertCountTrend: 13 },
  },
  {
    title: 'Comfort Level',
    id: 'facilitycard-comfort-level',
    size: CARD_SIZES.XSMALL,
    type: CARD_TYPES.VALUE,
    availableActions: {
      delete: true,
    },
    content: {
      attributes: [
        {
          dataSourceId: 'comfortLevel',
          thresholds: [
            { comparison: '=', value: 'Good', icon: 'icon--checkmark--solid', color: 'green' },
            { comparison: '=', value: 'Bad', icon: 'icon--close--solid', color: 'red' },
          ],
        },
      ],
    },
    values: { comfortLevel: 'Bad' },
  },
  {
    title: 'Alerts (Section 2)',
    tooltip: 'This view showcases the variety of alert severities present in your context.',
    id: 'facilitycard-pie',
    size: CARD_SIZES.SMALL,
    type: CARD_TYPES.PIE,
    availableActions: {
      delete: true,
    },
    content: {
      title: 'Alerts',
      data: [
        { label: 'Sev 3', value: 2, color: COLORS.RED },
        { label: 'Sev 2', value: 7, color: COLORS.PURPLE },
        { label: 'Sev 1', value: 32, color: COLORS.BLUE },
      ],
    },
  },
  {
    title: 'Foot Traffic',
    id: 'facilitycard-xs4',
    size: CARD_SIZES.XSMALL,
    type: CARD_TYPES.VALUE,
    availableActions: {
      delete: true,
    },
    content: {
      attributes: [
        {
          title: 'weekly',
          dataSourceId: 'footTraffic',
          secondaryValue: { dataSourceId: 'footTrafficTrend', trend: 'down', color: 'red' },
        },
      ],
    },
    values: { footTraffic: 13572, footTrafficTrend: '22%' },
  },
  {
    title: 'Health',
    id: 'facilitycard-health',
    size: CARD_SIZES.XSMALLWIDE,
    type: CARD_TYPES.VALUE,
    availableActions: {
      delete: true,
    },
    content: {
      attributes: [
        {
          dataSourceId: 'health',
          thresholds: [
            { comparison: '=', value: 'Healthy', icon: 'icon--checkmark--solid', color: 'green' },
            { comparison: '=', value: 'Unhealthy', icon: 'icon--close--solid', color: 'red' },
          ],
        },
      ],
    },
    values: { health: 'Healthy' },
  },
  {
    title: 'Temperature',
    id: 'facility-temperature-timeseries',
    size: CARD_SIZES.MEDIUM,
    type: CARD_TYPES.TIMESERIES,
    content: {
      series: [
        {
          label: 'Temperature',
          dataSourceId: 'temperature',
        },
      ],
      xLabel: 'Time',
      yLabel: 'Temperature (˚F)',
      timeDataSourceId: 'timestamp',
    },
    values: getIntervalChartData('day', 7, { min: 10, max: 100 }, 100),
    interval: 'hour',
    timeRange: 'last7Days',
    availableActions: { range: true },
  },
  {
    title: 'Alerts',
    id: 'alert-table1',
    size: CARD_SIZES.LARGE,
    type: CARD_TYPES.TABLE,
    availableActions: {
      expand: true,
    },
    content: {
      data: tableData,
      columns: tableColumns,
    },
  },
  {
    title: 'Alerts (Weekly)',
    id: 'xlarge-bar-alerts',
    size: CARD_SIZES.LARGE,
    type: CARD_TYPES.BAR,
    availableActions: {
      delete: true,
      expand: true,
    },
    content: {
      data: [
        {
          label: 'Sev 1',
          values: chartData.events
            .filter((i, idx) => idx < 7)
            .map(i => ({
              x: new Date(i.timestamp + timeOffset).toISOString(),
              y: Math.ceil(i.pressure / 10),
            })),
          color: COLORS.BLUE,
        },
        {
          label: 'Sev 2',
          values: chartData.events
            .filter((i, idx) => idx < 7)
            .map(i => ({
              x: new Date(i.timestamp + timeOffset).toISOString(),
              y: Math.ceil(i.humidity / 10),
            })),
          color: COLORS.PURPLE,
        },
        {
          label: 'Sev 3',
          values: chartData.events
            .filter((i, idx) => idx < 7)
            .map(i => ({
              x: new Date(i.timestamp + timeOffset).toISOString(),
              y: Math.ceil(i.temperature / 10),
            })),
          color: COLORS.RED,
        },
      ],
    },
  },
  {
    title: 'Alerts (Section 1)',
    id: 'facilitycard-donut',
    size: CARD_SIZES.SMALL,
    type: CARD_TYPES.DONUT,
    availableActions: {
      delete: true,
    },
    content: {
      title: 'Alerts',
      data: [
        { label: 'Sev 3', value: 6, color: COLORS.RED },
        { label: 'Sev 2', value: 9, color: COLORS.PURPLE },
        { label: 'Sev 1', value: 18, color: COLORS.BLUE },
      ],
    },
  },
  {
    title: 'Environment',
    id: 'facility-multi-timeseries',
    size: CARD_SIZES.LARGE,
    type: CARD_TYPES.TIMESERIES,
    content: {
      series: [
        {
          label: 'Temperature',
          dataSourceId: 'temperature',
          // color: text('color', COLORS.PURPLE),
        },
        {
          label: 'Pressure',
          dataSourceId: 'pressure',
          // color: text('color', COLORS.PURPLE),
        },
      ],
      xLabel: 'Time',
      yLabel: 'Temperature (˚F)',
      timeDataSourceId: 'timestamp',
    },
    values: getIntervalChartData('month', 12, { min: 10, max: 100 }, 100),
    interval: 'month',
    timeRange: 'lastYear',
    availableActions: { range: true },
  },
];

const StatefulDashboard = ({ ...props }) => {
  const [cards, setCards] = useState(originalCards);

  /*
  const handleAdd = () => {
    setCards([
      ...cards,
      {
        title: 'SMALL', // faker.company.companyName(),
        id: uuidv1(),
        size: CARD_SIZES.SMALL,
        type: CARD_TYPES.VALUE,
        content: [
          { title: 'Comfort Level', value: 89, unit: '%' },
          { title: 'Utilization', value: 76, unit: '%' },
          { title: 'Number of Alerts', value: 17 },
        ],
      },
    ]);
  };
  */

  const handleCardAction = (id, type, payload) => {
    console.log(id, type, payload);
    if (type === 'DELETE_CARD') {
      setCards(cards.filter(i => i.id !== id));
    }
    if (type === 'OPEN_EXPANDED_CARD') {
      setCards(cards.map(i => (i.id === id ? { ...i, isExpanded: true } : i)));
    }
    if (type === 'CLOSE_EXPANDED_CARD') {
      setCards(cards.map(i => (i.id === id ? { ...i, isExpanded: false } : i)));
    }
    if (type === 'CHANGE_TIME_RANGE') {
      const { range } = payload;
      const cardRange =
        range === 'last24Hours'
          ? { interval: 'hour', num: 24 }
          : range === 'last7Days'
          ? { interval: 'day', num: 7 }
          : range === 'lastMonth'
          ? { interval: 'day', num: 30 }
          : range === 'lastQuarter'
          ? { interval: 'week', num: 12 }
          : range === 'lastYear'
          ? { interval: 'month', num: 12 }
          : range === 'thisWeek'
          ? { interval: 'day', period: 'week' }
          : range === 'thisMonth'
          ? { interval: 'day', period: 'month' }
          : range === 'thisQuarter'
          ? { interval: 'week', period: 'quarter' }
          : range === 'thisYear'
          ? { interval: 'month', period: 'year' }
          : { interval: 'day', num: 7 };

      setCards(
        cards.map(i =>
          i.id === id
            ? {
                ...i,
                interval: cardRange.interval,
                timeRange: range,
                values: cardRange.period
                  ? getPeriodChartData(
                      cardRange.interval,
                      cardRange.period,
                      { min: 10, max: 100 },
                      100
                    )
                  : getIntervalChartData(
                      cardRange.interval,
                      cardRange.num,
                      { min: 10, max: 100 },
                      100
                    ),
              }
            : i
        )
      );
    }
    if (type === 'table_card_row_action') {
      console.log(id, type, payload);
    }
  };

  /*
  return (
    <div>
      <Button style={{ margin: '20px 0 0 20px' }} onClick={handleAdd}>
        Add card
      </Button>
      <Dashboard cards={cards} onCardAction={handleCardAction} {...props} />
    </div>
  );
  */
  return <Dashboard cards={cards} onCardAction={handleCardAction} {...props} />;
};

storiesOf('Dashboard (Experimental)', module)
  .add('basic', () => {
    return (
      <StatefulDashboard
        title={text('title', 'Munich Building')}
        lastUpdated={Date()}
        isEditable={boolean('isEditable', false)}
        isLoading={boolean('isLoading', false)}
        onBreakpointChange={action('onBreakpointChange')}
        onLayoutChange={action('onLayoutChange')}
      />
    );
  })
  .add('loading', () => {
    return (
      <StatefulDashboard
        title={text('title', 'Munich Building')}
        isEditable={boolean('isEditable', false)}
        isLoading={boolean('isLoading', true)}
      />
    );
  })
  .add('i18n labels', () => {
    return (
      <StatefulDashboard
        title={text('title', 'Munich Building')}
        lastUpdated={Date()}
        isEditable={boolean('isEditable', true)}
        i18n={{
          lastUpdatedLabel: text('lastUpdatedLabel', 'Last updated: '),
          noDataLabel: text('noDataLabel', 'No data is available for this time range.'),
          noDataShortLabel: text('noDataShortLabel', 'No data'),
          dayByHourLabel: text('dayByHourLabel', 'Last 24 hours'),
          weekByDayLabel: text('weekByDayLabel', 'Last week - Daily'),
          monthByDayLabel: text('monthByDayLabel', 'Last month - Daily'),
          monthByWeekLabel: text('monthByWeekLabel', 'Last month - Weekly'),
          yearByMonthLabel: text('yearByMonthLabel', 'Last year - Monthly'),
          editCardLabel: text('editCardLabel', 'Edit card'),
          cloneCardLabel: text('cloneCardLabel', 'Clone card'),
          deleteCardLabel: text('deleteCardLabel', 'Delete card'),
        }}
      />
    );
  })
  .add('only value cards', () => {
    const numberThresholds = [
      { comparison: '<', value: '40', color: 'red', icon: 'icon--close--solid' },
      { comparison: '<', value: '70', color: 'green', icon: 'icon--checkmark--solid' },
      { comparison: '<', value: '80', color: 'orange', icon: 'icon--warning--solid' },
      { comparison: '>=', value: '90', color: 'red', icon: 'icon--close--solid' },
    ];
    const stringThresholds = [
      { comparison: '=', value: 'Low', color: 'green' },
      { comparison: '=', value: 'Guarded', color: 'blue' },
      { comparison: '=', value: 'Elevated', color: 'gold' },
      { comparison: '=', value: 'High', color: 'orange' },
      { comparison: '=', value: 'Severe', color: 'red' },
    ];
    const stringThresholdsWithIcons = [
      { comparison: '=', value: 'Low', color: 'green', icon: 'icon--checkmark--solid' },
      { comparison: '=', value: 'Guarded', color: 'blue', icon: 'icon--checkmark--solid' },
      { comparison: '=', value: 'Elevated', color: 'gold', icon: 'icon--warning--solid' },
      { comparison: '=', value: 'High', color: 'orange', icon: 'icon--warning--solid' },
      { comparison: '=', value: 'Severe', color: 'red', icon: 'icon--close--solid' },
    ];
    const extraProps = {
      lastUpdated: 'Now',
    };
    const dashboards = [
      <Dashboard
        title="Single value / xsmall / units and precision"
        {...extraProps}
        cards={[
          ['value: 13', 13, null],
          ['value: 1352', 1352, 'steps'],
          ['value: 103.2', 103.2, '˚F'],
          ['value: 107324.3', 107324.3, 'kJ'],
          ['value: 1709384.1', 1709384.1, 'people'],
          ['value: false', false, null],
          ['value: true', true, null],
        ].map((v, idx) => ({
          title: `${v[0]} ${v[2] || ''}`,
          id: `xsmall-number-${idx}`,
          size: CARD_SIZES.XSMALL,
          type: CARD_TYPES.VALUE,
          content: {
            attributes: [{ dataSourceId: 'v', unit: v[2] }],
          },
          values: { v: v[1] },
        }))}
      />,
      <Dashboard
        title="Single value / xsmall / trend and label"
        {...extraProps}
        cards={[65.3, 48.7, 88.1, 103.2].map((v, idx) => ({
          title: 'Temperature',
          id: `xsmall-number-${idx}`,
          size: CARD_SIZES.XSMALL,
          type: CARD_TYPES.VALUE,
          content: {
            attributes: [
              {
                dataSourceId: 'v',
                secondaryValue:
                  idx === 2
                    ? { dataSourceId: 'v2', trend: 'up', color: 'green' }
                    : idx === 3
                    ? { trend: 'down', color: 'red' }
                    : undefined,
                label:
                  idx === 1
                    ? 'Weekly Avg'
                    : idx === 3
                    ? 'Long label that might not fit'
                    : undefined,
                unit: '˚F',
              },
            ],
          },
          values: { v, v2: '3.2' },
        }))}
      />,
      <Dashboard
        title="Single value / xsmall / numerical thresholds w/ icons"
        {...extraProps}
        cards={[38.2, 65.3, 77.7, 91].map((v, idx) => ({
          title: 'Humidity',
          id: `xsmall-number-threshold-${idx}`,
          size: CARD_SIZES.XSMALL,
          type: CARD_TYPES.VALUE,
          content: {
            attributes: [{ dataSourceId: 'v', unit: '%', thresholds: numberThresholds }],
          },
          values: { v },
        }))}
      />,
      <Dashboard
        title="Single value / xsmall / string thresholds without icons"
        {...extraProps}
        cards={stringThresholds
          .map(i => i.value)
          .map((v, idx) => ({
            title: 'Danger Level',
            id: `xsmall-string-threshold-${idx}`,
            size: CARD_SIZES.XSMALL,
            type: CARD_TYPES.VALUE,
            content: {
              attributes: [{ dataSourceId: 'v', thresholds: stringThresholds }],
            },
            values: { v },
          }))}
      />,
      <Dashboard
        title="Single value / xsmallwide / varied"
        {...extraProps}
        cards={[
          ['value: 13', 13, null],
          ['value: 1352', 1352, 'steps'],
          ['value: 103.2', 103.2, '˚F'],
          ['value: 107324.3', 107324.3, 'kJ'],
          ['value: 1709384.1', 1709384.1, 'people'],
          ['value: false', false, null],
          ['value: true', true, null],
        ]
          .map((v, idx) => ({
            title: `${v[0]} ${v[2] || ''}`,
            id: `xsmallwide-number-${idx}`,
            size: CARD_SIZES.XSMALLWIDE,
            type: CARD_TYPES.VALUE,
            content: {
              attributes: [{ dataSourceId: 'v', unit: v[2] }],
            },
            values: { v: v[1] },
          }))
          .concat(
            [65.3, 48.7, 88.1, 103.2].map((v, idx) => ({
              title: 'Temperature',
              id: `xsmallwide-number-trend-${idx}`,
              size: CARD_SIZES.XSMALLWIDE,
              type: CARD_TYPES.VALUE,
              content: {
                attributes: [
                  {
                    dataSourceId: 'v',
                    secondaryValue:
                      idx === 2
                        ? { dataSourceId: 'v2', trend: 'up', color: 'green' }
                        : idx === 3
                        ? { trend: 'down', color: 'red' }
                        : undefined,
                    label:
                      idx === 1
                        ? 'Weekly Avg'
                        : idx === 3
                        ? 'Long label that might not fit'
                        : undefined,
                    unit: '˚F',
                  },
                ],
              },
              values: { v, v2: 3.2 },
            }))
          )
          .concat(
            [38.2, 65.3, 77.7, 91].map((v, idx) => ({
              title: 'Humidity',
              id: `xsmallwide-number-threshold-${idx}`,
              size: CARD_SIZES.XSMALLWIDE,
              type: CARD_TYPES.VALUE,
              content: {
                attributes: [{ dataSourceId: 'v', unit: '%', thresholds: numberThresholds }],
              },
              values: { v },
            }))
          )
          .concat(
            stringThresholds
              .map(i => i.value)
              .map((v, idx) => ({
                title: 'Danger Level',
                id: `xsmallwide-string-threshold-${idx}`,
                size: CARD_SIZES.XSMALLWIDE,
                type: CARD_TYPES.VALUE,
                content: {
                  attributes: [{ dataSourceId: 'v', thresholds: stringThresholds }],
                },
                values: { v },
              }))
          )}
      />,
      <Dashboard
        title="Multi-value / xsmallwide / units and precision"
        {...extraProps}
        cards={[
          ['values: 89.2%, 76 mb', 89.2, '%', 'Comfort Level', 21.3, 'mb', 'Pressure'],
          ['values: 88.3˚F, Elevated', 88.3, '˚F', 'Temperature', 'Elevated', null, 'Danger Level'],
          [
            'values: 88.3˚F, Elevated',
            103.7,
            '˚F',
            'Temperature',
            1709384.1,
            'people',
            'Foot Traffic',
          ],
        ].map((v, idx) => ({
          title: v[0],
          id: `xsmallwide-multi-${idx}`,
          size: CARD_SIZES.XSMALLWIDE,
          type: CARD_TYPES.VALUE,
          content: {
            attributes: [
              {
                dataSourceId: 'v1',
                unit: v[2],
                label: v[3],
              },
              {
                dataSourceId: 'v2',
                unit: v[5],
                label: v[6],
              },
            ],
          },
          values: { v1: v[1], v2: v[4] },
        }))}
      />,
      <Dashboard
        title="Multi-value / xsmallwide / trend"
        {...extraProps}
        cards={[
          [
            'values: 89.2%, 76 mb',
            89.2,
            '%',
            'Comfort Level',
            2,
            'down',
            'red',
            21.3,
            'mb',
            'Pressure',
            215.2,
            'down',
            'red',
          ],
          [
            'values: 88.3˚F, Elevated',
            88.3,
            '˚F',
            'Temperature',
            4.1,
            'up',
            'green',
            'Elevated',
            null,
            'Danger Level',
            null,
            null,
            null,
          ],
          [
            'values: 88.3˚F, Elevated',
            103.7,
            '˚F',
            'Temperature',
            null,
            'up',
            'green',
            1709384.1,
            'people',
            'Foot Traffic',
            137982.2,
            'down',
            'red',
          ],
        ].map((v, idx) => ({
          title: v[0],
          id: `xsmallwide-multi-${idx}`,
          size: CARD_SIZES.XSMALLWIDE,
          type: CARD_TYPES.VALUE,
          content: {
            attributes: [
              {
                dataSourceId: 'v1',
                unit: v[2],
                label: v[3],
                secondaryValue:
                  v[5] !== null
                    ? {
                        dataSourceId: 'v1trend',
                        trend: v[5],
                        color: v[6],
                      }
                    : undefined,
              },
              {
                dataSourceId: 'v2',
                unit: v[8],
                label: v[9],
                secondaryValue:
                  v[11] !== null
                    ? {
                        dataSourceId: 'v2trend',
                        trend: v[11],
                        color: v[12],
                      }
                    : undefined,
              },
            ],
          },
          values: { v1: v[1], v1trend: v[4], v2: v[7], v2trend: v[10] },
        }))}
      />,
      <Dashboard
        title="Multi-value / xsmallwide / threshold"
        {...extraProps}
        cards={[
          [38.2, '%', 'Average', 65.3, '%', 'Max'],
          [77.2, '˚F', 'Average', 91.3, '˚F', 'Max'],
        ].map((v, idx) => ({
          title: 'Humidity',
          id: `xsmallwide-multi-number-threshold-${idx}`,
          size: CARD_SIZES.XSMALLWIDE,
          type: CARD_TYPES.VALUE,
          content: {
            attributes: [
              { dataSourceId: 'v1', unit: v[1], label: v[2], thresholds: numberThresholds },
              { dataSourceId: 'v2', unit: v[4], label: v[5], thresholds: numberThresholds },
            ],
          },
          values: { v1: v[0], v2: v[3] },
        }))}
      />,
      <Dashboard
        title="Multi-value / small"
        {...extraProps}
        cards={[
          [
            'Humidity',
            13634.56,
            'MWh',
            'YTD',
            null,
            1047.2,
            'MWh',
            'MTD',
            'up',
            314.5,
            'MWh',
            'Last Week',
            'down',
          ],
          [
            'Danger Level',
            'Severe',
            null,
            'Current',
            null,
            'Low',
            null,
            'Last Week',
            null,
            'High',
            null,
            'Last Month',
            null,
          ],
          [
            'Danger Level',
            'Low',
            null,
            'Current',
            null,
            'Severe',
            null,
            'Last Week',
            null,
            'Elevated',
            null,
            'Last Month',
            null,
          ],
        ].map((v, idx) => ({
          title: v[0],
          id: `xsmallwide-multi-number-threshold-${idx}`,
          size: CARD_SIZES.SMALL,
          type: CARD_TYPES.VALUE,
          content: {
            attributes: [
              {
                dataSourceId: 'v1',
                unit: v[2],
                label: v[3],
                thresholds:
                  idx === 1 ? stringThresholds : idx === 2 ? stringThresholdsWithIcons : undefined,
                secondaryValue:
                  v[4] !== null
                    ? {
                        dataSourceId: 'v1trend',
                        trend: v[4],
                        color: v[4] === 'down' ? 'red' : 'green',
                      }
                    : undefined,
              },
              {
                dataSourceId: 'v2',
                unit: v[6],
                label: v[7],
                thresholds:
                  idx === 1 ? stringThresholds : idx === 2 ? stringThresholdsWithIcons : undefined,
                secondaryValue:
                  v[8] !== null
                    ? {
                        dataSourceId: 'v2trend',
                        trend: v[8],
                        color: v[8] === 'down' ? 'red' : 'green',
                      }
                    : undefined,
              },
              {
                dataSourceId: 'v3',
                unit: v[10],
                label: v[11],
                thresholds:
                  idx === 1 ? stringThresholds : idx === 2 ? stringThresholdsWithIcons : undefined,
                secondaryValue:
                  v[12] !== null
                    ? { trend: v[12], color: v[12] === 'down' ? 'red' : 'green' }
                    : undefined,
              },
            ],
          },
          values: {
            v1: v[1],
            v1trend: v[1] / 5,
            v2: v[5],
            v2trend: v[5] / 5,
            v3: v[9],
          },
        }))}
      />,
    ];

    return (
      <div>
        {dashboards.map(i => [
          <div style={{ width: 1056, paddingBottom: 50 }}>
            <h1>&quot;Largest&quot; Rendering (1056px width)</h1>
            <hr />
            {i}
          </div>,
          <div style={{ width: 1057, paddingBottom: 50 }}>
            <h1>&quot;Tightest&quot; Rendering (1057px width)</h1>
            <hr />
            {i}
          </div>,
        ])}
      </div>
    );
  });
