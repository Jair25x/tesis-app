import React from "react";
import { useUserStats } from "../../hooks/useUserStats";
import LoadingScreen from "../../components/LoadingScreen";

export default function AdminDashboard() {
  const { stats, isLoading, error } = useUserStats();

  if (isLoading) return <LoadingScreen />;
  if (error || !stats)
    return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">📊 Panel de Administración</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Usuarios" value={stats.total} />
        <StatCard label="Activos" value={stats.active} />
        <StatCard label="Inactivos" value={stats.inactive} />
        {Object.entries(stats.byRole).map(([role, count]) => (
          <StatCard
            key={role}
            label={role.replace("ROLE_", "")}
            value={count}
          />
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-[#2d3b46] p-4 rounded-lg shadow text-center">
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
