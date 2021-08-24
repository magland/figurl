import sortingviewTaskFunctionIds from 'plugins/sortingview/sortingviewTaskFunctionIds';
import { LabboxExtensionContext } from '../../pluginInterface';

const CellComponent = (record: any) => {
    return (
        <span>{record}</span>
    );
}

export function activate(context: LabboxExtensionContext) {
    context.registerPlugin({
        type: 'SortingComparisonUnitMetric',
        name: 'BestMatch',
        label: 'Best match',
        columnLabel: 'Best match',
        tooltip: 'Best matching unit ID',
        hitherFnName: sortingviewTaskFunctionIds.getBestMatchingUnits,
        metricFnParams: {},
        hitherOpts: {
            useClientCache: true
        },
        component: CellComponent,
        isNumeric: false,
        getValue: (record: any) => record
    })
}