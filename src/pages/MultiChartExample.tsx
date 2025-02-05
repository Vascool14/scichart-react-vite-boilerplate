import { useEffect, useState } from "react";
import { drawExample } from "./multiChartDraw"
import { SciChartSurface } from "scichart";

// Adjust these values as needed
const rowsNumber = 20;
const columnsNumber = 15;
const totalCharts = rowsNumber * columnsNumber;

// Generate an array of div IDs for each chart
const chartIds = Array.from({ length: totalCharts }, (_, i) => `chart-${i}`);

const App = () => {
    const [ scsList, setScsList ] = useState<SciChartSurface[]>([]);

    useEffect(() => {
        // Create a chart for each div id
        chartIds.forEach((id) => {
            drawExample(id).then(({ sciChartSurface }) => {
                setScsList((prev) => [...prev, sciChartSurface]);
            });
        });

        return () => {
            // Dispose of each chart when the component unmounts
            scsList.forEach((scs) => scs.delete());
        }
    }, []);

    return (
        <main style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${columnsNumber}, 1fr)`, 
            gridTemplateRows: `repeat(${rowsNumber}, 1fr)`,
            gap: 4,
        }}>
            {chartIds.map((id) => 
                <div key={id} id={id} className="chart-item" />
            )}
        </main>
    );
};

export default App;
