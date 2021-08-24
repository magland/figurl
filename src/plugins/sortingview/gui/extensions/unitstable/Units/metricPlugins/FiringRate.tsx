import sortingviewTaskFunctionIds from 'plugins/sortingview/sortingviewTaskFunctionIds';
import React from 'react';
import { SortingUnitMetricPlugin } from "../../../../pluginInterface";

const FiringRate = (record: any) => {
    return (
        <span>{record !== undefined ? record.rate : ''}</span>
    );
}

const plugin: SortingUnitMetricPlugin = {
    type: 'SortingUnitMetric',
    name: 'FiringRate',
    label: 'Firing rate (Hz)',
    columnLabel: 'Firing rate (Hz)',
    tooltip: 'Average num. events per second',
    hitherFnName: sortingviewTaskFunctionIds.getFiringData,
    hitherOpts: {
        useClientCache: true
    },
    metricFnParams: {},
    component: FiringRate,
    isNumeric: true,
    getValue: (record: any) => record.count
}

export default plugin