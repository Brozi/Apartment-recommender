import {
  DATA_CHEAPEST_DISTRICTS,
  DATA_EXPENSIVE_DISTRICTS,
} from "../lib/constants";
import { useLoaderData } from "react-router";
import InfoBox from "../components/info-box/info-box";
import styles from "./kpis-page.module.css";
import BarChart from "../components/charts/bar-chart";
import LineChart from "../components/charts/line-chart";
import { replaceUnderscores, roundToTwo } from "../lib/utils";
import type { DashboardKpisResponse } from "../lib/types";

export default function KpisPage() {
  const dashboard = useLoaderData() as DashboardKpisResponse;

  const infoBoxes = dashboard.info_boxes.map((infoBox) => ({
    ...infoBox,
    firstLineValue: roundToTwo(infoBox.firstLineValue),
    secondLineValue: roundToTwo(infoBox.secondLineValue),
  }));

  const finishingState = dashboard.finishing_state.map((entry) => ({
    ...entry,
    state: replaceUnderscores(entry.state),
  }));

  return (
    <>
      <section className={styles.boxInfoGrid}>
        {infoBoxes.map((infoBox) => (
          <InfoBox
            key={infoBox.id}
            title={infoBox.title}
            firstLineTitle={infoBox.firstLineTitle}
            firstLineValue={infoBox.firstLineValue}
            secondLineTitle={infoBox.secondLineTitle}
            secondLineValue={infoBox.secondLineValue}
            unit={infoBox.unit}
          />
        ))}
      </section>

      <section className={styles.chartGrid}>
        <BarChart
          title="Offers by build year range"
          data={dashboard.build_year}
          xAxisKey="range"
          bars={[{ dataKey: "count", color: "var(--clr-chart-red)" }]}
        />
        <BarChart
          title="Offers by number of rooms"
          data={dashboard.rooms}
          xAxisKey="rooms"
          bars={[{ dataKey: "count", color: "var(--clr-chart-red)" }]}
        />
        <BarChart
          title="Offers by finishing status"
          data={finishingState}
          xAxisKey="state"
          bars={[{ dataKey: "count", color: "var(--clr-chart-red)" }]}
        />
        <BarChart
          title="Most expensive districts (per m²)"
          data={DATA_EXPENSIVE_DISTRICTS}
          xAxisKey="district"
          bars={[
            { dataKey: "average", color: "var(--clr-chart-red)" },
            { dataKey: "median", color: "var(--clr-chart-green)" },
          ]}
        />
        <BarChart
          title="Cheapest districts (per m²)"
          data={DATA_CHEAPEST_DISTRICTS}
          xAxisKey="district"
          bars={[
            { dataKey: "average", color: "var(--clr-chart-red)" },
            { dataKey: "median", color: "var(--clr-chart-green)" },
          ]}
        />
        <LineChart
          title="New offers: Last 30 days"
          data={dashboard.new_offers_timeline}
          xAxisKey="date"
          lines={[{ dataKey: "offers", color: "var(--clr-chart-red)" }]}
        />
      </section>
    </>
  );
}
