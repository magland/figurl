import sortingviewTaskFunctionIds from 'plugins/sortingview/sortingviewTaskFunctionIds';
import React from 'react';
import { SortingUnitMetricPlugin } from "../../../../pluginInterface";

const UnitSnrs = (record: any) => {
    return (
        <span>{record !== undefined ? record.toFixed(2) : ''}</span>
    );
}

const plugin: SortingUnitMetricPlugin = {
    type: 'SortingUnitMetric',
    name: 'UnitSnrs',
    label: 'SNR',
    columnLabel: 'SNR',
    tooltip: 'Unit SNR (peak-to-peak amp of mean waveform / est. std. dev on peak chan)',
    hitherFnName: sortingviewTaskFunctionIds.getUnitSnrs,
    metricFnParams: {},
    hitherOpts: {
        useClientCache: true
    },
    component: UnitSnrs,
    isNumeric: true,
    getValue: (record: any) => record
}

export default plugin