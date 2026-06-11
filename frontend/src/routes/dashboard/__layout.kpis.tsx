import { createFileRoute } from "@tanstack/react-router";
import { useDashboardKPIs } from "#/api/useDashboardKPIs";
import { replaceUnderscores, roundToTwo } from "#/lib/utils";

import styles from "#/routes/dashboard/kpis.module.css";
import LoadingSpinner from "#/components/ui/loading-spinner";
import InfoBox from "#/components/info-box/info-box";
import BarChart from "#/components/charts/bar-chart";
import LineChart from "#/components/charts/line-chart";

export const Route = createFileRoute("/dashboard/__layout/kpis")({
  component: KPIsPage,
});

function KPIsPage() {
  const { data: kpis, isPending, error } = useDashboardKPIs();

  if (isPending) {
    return <LoadingSpinner label="Loading map" />;
  }

  if (error || !kpis) {
    return <p className="text-paragraph">Failed to load map</p>;
  }

  const infoBoxes = kpis.info_boxes.map((infoBox) => ({
    ...infoBox,
    firstLineValue: roundToTwo(infoBox.firstLineValue),
    secondLineValue: roundToTwo(infoBox.secondLineValue),
  }));

  const expensiveDistricts = kpis.expensive_districts.map((entry) => ({
    ...entry,
    average: roundToTwo(entry.pricePerM),
    median: roundToTwo(entry.medianPrice),
  }));

  const cheapestDistricts = kpis.cheapest_districts.map((entry) => ({
    ...entry,
    average: roundToTwo(entry.pricePerM),
    median: roundToTwo(entry.medianPrice),
  }));

  const rooms = kpis.rooms.reduce<{ rooms: string; count: number }[]>(
    (acc, entry) => {
      const num = parseInt(entry.rooms);
      const isBig = (!isNaN(num) && num >= 5) || entry.rooms === "10+";
      if (isBig) {
        const existing = acc.find((e) => e.rooms === "5+");
        if (existing) {
          existing.count += entry.count;
        } else {
          acc.push({ rooms: "5+", count: entry.count });
        }
      } else {
        acc.push({ ...entry });
      }
      return acc;
    },
    [],
  );

  const buildYear = kpis.build_year.filter((entry) => entry.range !== "");

  const finishingState = kpis.finishing_state
    .filter((entry) => entry.state !== "unknown")
    .map((entry) => ({
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
          data={buildYear}
          xAxisKey="range"
          bars={[{ dataKey: "count", color: "var(--clr-chart-red)" }]}
        />
        <BarChart
          title="Offers by number of rooms"
          data={rooms}
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
          data={expensiveDistricts}
          xAxisKey="district"
          bars={[
            { dataKey: "average", color: "var(--clr-chart-red)" },
            { dataKey: "median", color: "var(--clr-chart-green)" },
          ]}
        />
        <BarChart
          title="Cheapest districts (per m²)"
          data={cheapestDistricts}
          xAxisKey="district"
          bars={[
            { dataKey: "average", color: "var(--clr-chart-red)" },
            { dataKey: "median", color: "var(--clr-chart-green)" },
          ]}
        />
        <LineChart
          title="New offers: Last 30 days"
          data={kpis.new_offers_timeline}
          xAxisKey="date"
          lines={[{ dataKey: "offers", color: "var(--clr-chart-red)" }]}
        />
      </section>
    </>
  );
}
