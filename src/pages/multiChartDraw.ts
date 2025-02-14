import {
    SciChartSurface,
    NumericAxis,
    ESeriesType,
    Thickness,
    SciChartJSLightTheme,
    EAutoRange,
} from "scichart";
import { SimpleSciChartLoader } from "../SimpleSciChartLoader";

import {
    createRenderableSeries,
    getDataSeriesTypeForRenderableSeries,
    prePopulateData,
} from "../utils";

const COLORS = [ "#FFCC0088", "#FF000088", "#FF006688", "#FF00CC88", "#CC00FF88", "#6600FF88", "#0066FF88", "#00FFFF88", "#00FF6688", "#FFFF0088" ];

// AXIS OPTIMISATION OPTIONS
export const optimisedAxesOptions = {
    useNativeText: true,
    useSharedCache: true,
    drawMajorTickLines: false,
    drawMinorTickLines: false,
    drawMinorGridLines: false,
    autoRange: EAutoRange.Once
}

export async function drawExample(divId: string) {
    const { wasmContext, sciChartSurface } = await SciChartSurface.create(divId, {
        theme: new SciChartJSLightTheme(),
        loader: new SimpleSciChartLoader(),
        padding: Thickness.fromNumber(1),
    });

    // Create X-axis
    const xAxis = new NumericAxis(wasmContext, {
        // isVisible: false,
        ...optimisedAxesOptions,
        labelPrecision: 0,
    });
    sciChartSurface.xAxes.add(xAxis);

    // Create Y-axis
    const yAxis = new NumericAxis(wasmContext, {
        // isVisible: false,
        ...optimisedAxesOptions,
        labelPrecision: 0
    });
    sciChartSurface.yAxes.add(yAxis);

    // Pick a series type for this chart (for demo, we cycle through a small set)
    const seriesTypes = [
        ESeriesType.LineSeries,
        ESeriesType.ScatterSeries,
        ESeriesType.ColumnSeries,
        ESeriesType.BandSeries
    ];
    const seriesType = seriesTypes[Math.floor(Math.random() * seriesTypes.length)];

    // Create a renderable series (using a helper function)
    const { dataSeries, rendSeries } = createRenderableSeries(wasmContext, seriesType, xAxis.id, yAxis.id);
    const seriesColor = parseInt(divId[divId.length - 1]) % COLORS.length;
    rendSeries.stroke = COLORS[seriesColor];    

    // Populate the data series with some initial data
    const dataSeriesType = getDataSeriesTypeForRenderableSeries(seriesType);
    const initialPoints = 500;
    const xValues = Array.from({ length: initialPoints }, (_, i) => i);
    prePopulateData(dataSeries, dataSeriesType, xValues, true);

    // Add the renderable series to the chart
    sciChartSurface.renderableSeries.add(rendSeries);

    return { wasmContext, sciChartSurface };
};
