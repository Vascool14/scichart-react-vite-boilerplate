import {
    createRenderableSeries,
    getDataSeriesTypeForRenderableSeries,
    getSubChartPositionIndexes,
    prePopulateData,
} from "../utils";

import {
    BaseDataSeries,
    ECoordinateMode,
    EDataSeriesType,
    ESeriesType,
    IRenderableSeries,
    I2DSubSurfaceOptions,
    NumericAxis,
    Rect,
    RightAlignedOuterVerticallyStackedAxisLayoutStrategy,
    SciChartSubSurface,
    SciChartSurface,
    StackedColumnCollection,
    StackedColumnRenderableSeries,
    StackedMountainCollection,
    StackedMountainRenderableSeries,
    Thickness,
    TSciChart,
    SciChartJSLightTheme,
} from "scichart";

import { optimisedAxesOptions } from "./multiChartDraw"; // also test on subCharts

export type TMessage = {
    title: string;
    detail: string;
};

// theme overrides
const sciChartTheme = new SciChartJSLightTheme();

export const drawGridExample = async (
    rootElement: string | HTMLDivElement,
) => {
    const columnsNumber = 15;
    const rowsNumber = 20;
    const subChartsNumber = columnsNumber * rowsNumber;

    const dataSettings = {
        seriesCount: 3,
        initialPoints: 500,
    };

    const originalGetStrokeColor = sciChartTheme.getStrokeColor;
    let counter = 0;
    sciChartTheme.getStrokeColor = (index: number, max: number, context: TSciChart) => {
        const currentIndex = counter % subChartsNumber;
        counter += 3;
        return originalGetStrokeColor.call(sciChartTheme, currentIndex, subChartsNumber, context);
    };

    const originalGetFillColor = sciChartTheme.getFillColor;
    sciChartTheme.getFillColor = (index: number, max: number, context: TSciChart) => {
        const currentIndex = counter % subChartsNumber;
        counter += 3;
        return originalGetFillColor.call(sciChartTheme, currentIndex, subChartsNumber, context);
    };

    const { wasmContext, sciChartSurface: mainSurface } = await SciChartSurface.createSingle(rootElement, {
        theme: sciChartTheme,
    });

    const mainXAxis = new NumericAxis(wasmContext, {
        isVisible: false,
        id: "mainXAxis",
    });

    mainSurface.xAxes.add(mainXAxis);
    const mainYAxis = new NumericAxis(wasmContext, {
        isVisible: false,
        id: "mainYAxis",
    });
    mainSurface.yAxes.add(mainYAxis);

    const seriesTypes = [
        ESeriesType.LineSeries,
        ESeriesType.BubbleSeries,
        ESeriesType.StackedColumnSeries,
        ESeriesType.ColumnSeries,
        ESeriesType.StackedMountainSeries,
        ESeriesType.BandSeries,
        ESeriesType.ScatterSeries,
        ESeriesType.CandlestickSeries,
        // ESeriesType.TextSeries
    ];

    const subChartsMap: Map<
        SciChartSubSurface,
        { seriesType: ESeriesType; dataSeriesType: EDataSeriesType; dataSeriesArray: BaseDataSeries[] }
    > = new Map();

    const xValues = Array.from(new Array(dataSettings.initialPoints).keys());

    const initSubChart = (seriesType: ESeriesType, subChartIndex: number) => {
        // calculate sub-chart position and sizes
        const { rowIndex, columnIndex } = getSubChartPositionIndexes(subChartIndex, columnsNumber);
        const width = 1 / columnsNumber;
        const height = 1 / rowsNumber;

        const position = new Rect(columnIndex * width, rowIndex * height, width, height);

        // sub-surface configuration
        const subChartOptions: I2DSubSurfaceOptions = {
            id: `subChart-${subChartIndex}`,
            theme: sciChartTheme,
            position,
            parentXAxisId: mainXAxis.id,
            parentYAxisId: mainYAxis.id,
            coordinateMode:  ECoordinateMode.Relative,
            subChartPadding: Thickness.fromNumber(1),
            viewportBorder: {
                color: "rgba(150, 74, 148, 0.51)",
                border: 2,
            },
        };

        // create sub-surface
        const subChartSurface = mainSurface.addSubChart(subChartOptions);

        // add axes to the sub-surface
        const subChartXAxis = new NumericAxis(wasmContext, {
            id: `${subChartSurface.id}-XAxis`,
            // isVisible: false
            ...optimisedAxesOptions,
            labelPrecision: 0
        });

        subChartSurface.xAxes.add(subChartXAxis);

        const subChartYAxis = new NumericAxis(wasmContext, {
            id: `${subChartSurface.id}-YAxis`,
            // isVisible: false
            ...optimisedAxesOptions,
            labelPrecision: 0   
        });
        subChartSurface.yAxes.add(subChartYAxis);

        // add series to sub-surface
        const dataSeriesArray: BaseDataSeries[] = new Array(dataSettings.seriesCount);
        const dataSeriesType = getDataSeriesTypeForRenderableSeries(seriesType);

        let stackedCollection: IRenderableSeries | undefined = undefined;
        const positive = [ESeriesType.StackedColumnSeries, ESeriesType.StackedMountainSeries].includes(seriesType);

        for (let i = 0; i < dataSettings.seriesCount; i++) {
            const { dataSeries, rendSeries } = createRenderableSeries(
                wasmContext,
                seriesType,
                subChartXAxis.id,
                subChartYAxis.id
            );

            dataSeriesArray[i] = dataSeries;

            // add series to the sub-chart and apply additional configurations per series type
            if (seriesType === ESeriesType.StackedColumnSeries) {
                if (i === 0) {
                    stackedCollection = new StackedColumnCollection(wasmContext, {
                        dataPointWidth: 1,
                        xAxisId: subChartXAxis.id,
                        yAxisId: subChartYAxis.id,
                    });
                    subChartSurface.renderableSeries.add(stackedCollection);
                }
                (rendSeries as StackedColumnRenderableSeries).stackedGroupId = i.toString();
                if (stackedCollection) {
                    (stackedCollection as StackedColumnCollection).add(rendSeries as StackedColumnRenderableSeries);
                }
            } else if (seriesType === ESeriesType.StackedMountainSeries) {
                if (i === 0) {
                    stackedCollection = new StackedMountainCollection(wasmContext, {
                        xAxisId: subChartXAxis.id,
                        yAxisId: subChartYAxis.id,
                    });
                    subChartSurface.renderableSeries.add(stackedCollection);
                }
                (stackedCollection as StackedMountainCollection).add(rendSeries as StackedMountainRenderableSeries);
            } else if (seriesType === ESeriesType.ColumnSeries) {
                // create Stacked Y Axis
                if (i === 0) {
                    subChartSurface.layoutManager.rightOuterAxesLayoutStrategy =
                        new RightAlignedOuterVerticallyStackedAxisLayoutStrategy();
                    rendSeries.yAxisId = subChartYAxis.id;
                } else {
                    const additionalYAxis = new NumericAxis(wasmContext, {
                        id: `${subChartSurface.id}-YAxis${i}`,
                        isVisible: false,
                    });
                    subChartSurface.yAxes.add(additionalYAxis);
                    rendSeries.yAxisId = additionalYAxis.id;
                }

                subChartSurface.renderableSeries.add(rendSeries);
            } else {
                subChartSurface.renderableSeries.add(rendSeries);
            }

            // Generate points
            prePopulateData(dataSeries, dataSeriesType, xValues, positive);

            subChartSurface.zoomExtents(0);
        }

        subChartsMap.set(subChartSurface, { seriesType, dataSeriesType, dataSeriesArray });

        return positive;
    };

    // generate the subcharts grid
    for (let subChartIndex = 0; subChartIndex < subChartsNumber; ++subChartIndex) {
        const seriesType = seriesTypes[subChartIndex % seriesTypes.length];
        initSubChart(seriesType, subChartIndex);
    }

    return { sciChartSurface: mainSurface, wasmContext };
}
