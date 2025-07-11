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
  const data = stats ?? {
    total: 0,
    active: 0,
    inactive: 0,
    byRole: {},
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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        📊 Panel de Administración
      </h1>

      {/* Total Usuarios */}
      <div className="flex justify-center mb-8">
        <StatCard
          label="Total de usuarios"
          value={data.total}
          Icon={Users}
          color="text-gray-600"
        />
      </div>

      {/* Activos / Inactivos (espacio reducido) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center mb-8">
        <StatCard
          label="Activos"
          value={data.active}
          Icon={CheckCircle}
          color="text-green-500"
        />
        <StatCard
          label="Inactivos"
          value={data.inactive}
          Icon={XCircle}
          color="text-red-500"
        />
      </div>

      {/* Roles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
        {Object.entries(data.byRole).map(([role, count]) => {
          const cfg = roleConfig[role] || {
            label: role.replace("ROLE_", ""),
            Icon: Users,
            color: "text-gray-600",
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
    <div className="flex flex-col items-center bg-white dark:bg-[#2d3b46] p-6 rounded-2xl shadow-lg w-48 sm:w-56 md:w-64">
      <Icon className={`w-10 h-10 ${color} mb-2`} />
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
