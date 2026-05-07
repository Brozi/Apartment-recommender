import {
  DATA_BUILD_YEAR,
  DATA_CHEAPEST_DISTRICTS,
  DATA_EXPENSIVE_DISTRICTS,
  DATA_FINISHING_STATE,
  DATA_NEW_OFFERS_TIMELINE,
  DATA_ROOMS,
  INFO_BOX_DUMMY_DATA,
} from "../lib/constants";
import InfoBox from "../components/info-box/info-box";
import styles from "./kpis-page.module.css";
import BarChart from "../components/charts/bar-chart";
import LineChart from "../components/charts/line-chart";

export default function KpisPage() {
  return (
    <>
      <section className={styles.boxInfoGrid}>
        {INFO_BOX_DUMMY_DATA.map((infoBox) => (
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
          title="Num offers in build year range"
          data={DATA_BUILD_YEAR}
          xAxisKey="range"
          bars={[{ dataKey: "count", color: "var(--clr-chart-red)" }]}
        />
        <BarChart
          title="Offers for the number of rooms"
          data={DATA_ROOMS}
          xAxisKey="rooms"
          bars={[{ dataKey: "count", color: "var(--clr-chart-red)" }]}
        />
        <BarChart
          title="Offers by the state of finishing"
          data={DATA_FINISHING_STATE}
          xAxisKey="state"
          bars={[{ dataKey: "count", color: "var(--clr-chart-red)" }]}
        />
        <BarChart
          title="The most expensive districts (per m²)"
          data={DATA_EXPENSIVE_DISTRICTS}
          xAxisKey="district"
          bars={[
            { dataKey: "average", color: "var(--clr-chart-red)" },
            { dataKey: "median", color: "var(--clr-chart-green)" },
          ]}
        />
        <BarChart
          title="The most expensive districts (per m²)"
          data={DATA_CHEAPEST_DISTRICTS}
          xAxisKey="district"
          bars={[
            { dataKey: "average", color: "var(--clr-chart-red)" },
            { dataKey: "median", color: "var(--clr-chart-green)" },
          ]}
        />
        <LineChart
          title="New offers in last 30 days"
          data={DATA_NEW_OFFERS_TIMELINE}
          xAxisKey="date"
          lines={[{ dataKey: "offers", color: "var(--clr-chart-red)" }]}
        />
      </section>
    </>
  );
}
