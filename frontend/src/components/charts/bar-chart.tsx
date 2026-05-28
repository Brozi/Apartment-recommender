import {
  BarChart as RechartsChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import type { BarConfig, ChartData } from "#/lib/types";
import DashboardBox from "#/components/dashboard-box/dashboard-box";
import styles from "#/components/charts/chart.module.css";

type BarChartProps = {
  title: string;
  data: ChartData[];
  xAxisKey: string;
  bars: BarConfig[];
};

export default function BarChart({
  title,
  data,
  xAxisKey,
  bars,
}: BarChartProps) {
  return (
    <DashboardBox title={title}>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--clr-chart-indicator)"
            />

            <XAxis
              type={"category"}
              dataKey={xAxisKey}
              axisLine={false}
              tickLine={false}
              tick={{ className: styles.fontChartAxis }}
            />
            <YAxis
              type={"number"}
              dataKey={undefined}
              axisLine={false}
              tickLine={false}
              tick={{ className: styles.fontChartAxis }}
            />

            <Tooltip cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />

            {bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                fill={bar.color}
                barSize={32}
              />
            ))}
          </RechartsChart>
        </ResponsiveContainer>
      </div>
    </DashboardBox>
  );
}
