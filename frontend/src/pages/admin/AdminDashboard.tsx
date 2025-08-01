// src/pages/admin/AdminDashboard.tsx
import React from "react";
import { useUserStats } from "../../hooks/useUserStats";
import type { LucideIcon } from "lucide-react";
import {
  Users,
  CheckCircle,
  XCircle,
  Shield,
  BookOpen,
  UserCheck,
} from "lucide-react";

export default function AdminDashboard() {
  const { stats } = useUserStats();

  const data = {
    total: stats?.total ?? 0,
    active: stats?.active ?? 0,
    inactive: stats?.inactive ?? 0,
    byRole: stats?.byRole ?? {}, // ✅ Asegura estructura vacía si viene null o undefined
  };

  const roleConfig: Record<
    string,
    { label: string; Icon: LucideIcon; color: string }
  > = {
    ROLE_ADMIN: {
      label: "Administradores",
      Icon: Shield,
      color: "text-purple-500",
    },
    ROLE_STUDENT: {
      label: "Estudiantes",
      Icon: BookOpen,
      color: "text-blue-500",
    },
    ROLE_TEACHER: {
      label: "Docentes",
      Icon: UserCheck,
      color: "text-green-500",
    },
  };
  console.log("📊 stats desde hook:", stats);
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">
        📊 Panel de Administración
      </h1>

      {/* Total de usuarios */}
      <section className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 justify-items-center gap-6">
          <StatCard
            label="Total de usuarios"
            value={data.total}
            Icon={Users}
            color="text-gray-700 dark:text-white"
          />
          <StatCard
            label="Usuarios activos"
            value={data.active}
            Icon={CheckCircle}
            color="text-green-500"
          />
          <StatCard
            label="Usuarios inactivos"
            value={data.inactive}
            Icon={XCircle}
            color="text-red-500"
          />
        </div>
      </section>

      {/* Por roles */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          Usuarios por Rol
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-items-center gap-6">
          {Object.entries(data.byRole).map(([role, count]) => {
            const cfg = roleConfig[role] || {
              label: role.replace("ROLE_", ""),
              Icon: Users,
              color: "text-gray-500",
            };
            return (
              <StatCard
                key={role}
                label={cfg.label}
                value={count}
                Icon={cfg.Icon}
                color={cfg.color}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  Icon: LucideIcon;
  color: string;
}

function StatCard({ label, value, Icon, color }: StatCardProps) {
  return (
    <div className="w-full max-w-xs bg-white dark:bg-[#2d3b46] shadow-lg rounded-xl p-5 transition transform hover:scale-[1.02] duration-300 ease-in-out">
      <div className="flex items-center space-x-4">
        <div
          className={`rounded-full bg-opacity-10 p-3 ${color} flex items-center justify-center`}
        >
          <Icon className={`w-7 h-7 ${color}`} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            {label}
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </span>
        </div>
      </div>
    </div>
  );
}
