import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import type { LineConfig, ChartData } from "../../lib/types";
import DashboardBox from "../dashboard-box/dashboard-box";
import styles from "./chart.module.css";

type LineChartProps = {
  title: string;
  data: ChartData[];
  xAxisKey: string;
  lines: LineConfig[];
};

export default function LineChart({
  title,
  data,
  xAxisKey,
  lines,
}: LineChartProps) {
  return (
    <DashboardBox title={title}>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={data}
            margin={{ top: 10, right: 10, left: -30, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--clr-chart-indicator)"
            />

            <XAxis
              dataKey={xAxisKey}
              axisLine={false}
              tickLine={false}
              tick={{ className: styles.fontChartAxis }}
              padding={{ left: 10, right: 10 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ className: styles.fontChartAxis }}
            />

            <Tooltip cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />

            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="linear"
                dataKey={line.dataKey}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </DashboardBox>
  );
}
