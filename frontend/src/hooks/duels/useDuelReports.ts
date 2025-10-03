// src/hooks/duels/useDuelReports.ts
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/useAuth";
import type {
  GroupBy,
  TimeRange,
  TeacherDuelOverview,
  TeacherMatchesResp,
  AdminDuelOverview,
  UserDuelSummary,
  UserHistoryItem,
} from "../../types/duels/reports";
import {
  getTeacherOverview,
  getTeacherMatches,
  getAdminOverview,
  getUserSummary,
  getUserHistory,
} from "../../services/duelsReportsService";

type Status = "idle" | "loading" | "success" | "error";

function getAccessToken(): string | null {
  try {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  } catch {
    return null;
  }
}

/* ===================== DOCENTE ===================== */
export function useTeacherDuelOverview(
  range: TimeRange,
  groupBy: GroupBy = "day",
  classroomId?: string
) {
  const { user } = useAuth();
  const token = getAccessToken();

  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<TeacherDuelOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const key = useMemo(
    () => JSON.stringify({ range, groupBy, token, classroomId }),
    [range, groupBy, token, classroomId]
  );

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token) return;
      setStatus("loading");
      setError(null);
      try {
        const resp = await getTeacherOverview(
          token,
          range,
          groupBy,
          classroomId
        );
        if (!cancelled) {
          setData(resp);
          setStatus("success");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error");
          setStatus("error");
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [key, user?.id]);

  return { status, data, error };
}

export function useTeacherDuelMatches(
  range: TimeRange,
  limit = 20,
  classroomId?: string
) {
  const { user } = useAuth();
  const token = getAccessToken();

  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<TeacherMatchesResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const key = useMemo(
    () => JSON.stringify({ range, limit, offset, token, classroomId }),
    [range, limit, offset, token, classroomId]
  );

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token) return;
      setStatus("loading");
      setError(null);
      try {
        const resp = await getTeacherMatches(token, range, {
          limit,
          offset,
          classroomId,
        });
        if (!cancelled) {
          setData(resp);
          setStatus("success");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error");
          setStatus("error");
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [key, user?.id]);

  return { status, data, error, offset, setOffset };
}

/* ===================== ADMIN ===================== */
export function useAdminDuelOverview(
  range: TimeRange,
  groupBy: GroupBy = "day"
) {
  const { user } = useAuth();
  const roles = Array.isArray(user?.roles) ? user!.roles : [];
  const isAdmin = roles.some((r) => r.toUpperCase().includes("ADMIN"));
  const token = getAccessToken();

  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<AdminDuelOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const key = useMemo(
    () => JSON.stringify({ range, groupBy, token, isAdmin }),
    [range, groupBy, token, isAdmin]
  );

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token || !isAdmin) return;
      setStatus("loading");
      setError(null);
      try {
        const resp = await getAdminOverview(token, range, groupBy);
        if (!cancelled) {
          setData(resp);
          setStatus("success");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error");
          setStatus("error");
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [key, user?.id]);

  return { status, data, error, isAdmin };
}

/* ===================== ALUMNO (panel puntual) ===================== */
export function useUserDuelSummary(userId?: string, days = 90) {
  const { user } = useAuth();
  const token = getAccessToken();

  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<UserDuelSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const key = useMemo(
    () => JSON.stringify({ userId, days, token }),
    [userId, days, token]
  );

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token || !userId) return;
      setStatus("loading");
      setError(null);
      try {
        const resp = await getUserSummary(token, userId, days);
        if (!cancelled) {
          setData(resp);
          setStatus("success");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error");
          setStatus("error");
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [key, user?.id]);

  return { status, data, error };
}

export function useUserDuelHistory(userId?: string, days = 90, limit = 50) {
  const { user } = useAuth();
  const token = getAccessToken();

  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<UserHistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const key = useMemo(
    () => JSON.stringify({ userId, days, limit, token }),
    [userId, days, limit, token]
  );

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token || !userId) return;
      setStatus("loading");
      setError(null);
      try {
        const resp = await getUserHistory(token, userId, days, limit);
        if (!cancelled) {
          setData(resp);
          setStatus("success");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error");
          setStatus("error");
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [key, user?.id]);

  return { status, data, error };
}
