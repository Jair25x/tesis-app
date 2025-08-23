import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import type { DailyStat } from "../../types/progress/ProgressTypes";

export default function MyDailySeriesChart({
  data,
  loading,
}: {
  data: DailyStat[] | undefined;
  loading?: boolean;
}) {
  const dataset = data ?? [];

  return (
    <div className="rounded border p-3 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="text-sm font-semibold mb-2">
        Mi actividad diaria (intentos vs correctos)
      </div>
      <div className="h-72">
        {loading ? (
          <div className="w-full h-full animate-pulse bg-gray-100 dark:bg-gray-700 rounded" />
        ) : dataset.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dataset}
              margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="attempts" name="Intentos" />
              <Line type="monotone" dataKey="correct" name="Correctos" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
            Sin datos en el rango seleccionado.
          </div>
        )}
      </div>
    </div>
  );
}
