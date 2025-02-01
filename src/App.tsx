import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import SubChartExample from "./pages/SubChartExample";
import MultiChartExample from "./pages/MultiChartExample";

function App() {
    return (
        <BrowserRouter>
            <nav>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/multichart">MultiChart</NavLink>
                <NavLink to="/subcharts">Subcharts</NavLink>
            </nav>

            <Routes>
                <Route path="/" element={<main><h2>Choose either MultiChart or SubCharts in the navbar</h2><p>This "home" page is here to better test deletion of charts and triggering of the grabage collector</p></main>} />
                <Route path="/multichart" element={<MultiChartExample />} />
                <Route path="/subcharts" element={<SubChartExample />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
