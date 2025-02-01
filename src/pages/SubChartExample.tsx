import { SciChartReact } from "scichart-react";
import { drawGridExample } from "./subChartDraw";

export default function SubChartExample() {
    return (
        <main>
            <SciChartReact
                style={{ width: "100%", height: "100%" }}
                initChart={drawGridExample}
            />
        </main>
    )
}