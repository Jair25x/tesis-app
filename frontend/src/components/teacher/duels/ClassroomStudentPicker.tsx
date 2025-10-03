import { useEffect, useMemo, useState } from "react";
import { classroomApi } from "../../../services/classroomService";
import type {
  UUID,
  MemberDto,
  ClassroomSummaryDto,
} from "../../../types/classroom/ClassroomTypes";

type Props = {
  valueClassroomId?: string | null;
  onChangeClassroom: (id: string | null) => void;
  valueStudentId?: string | null;
  onChangeStudent: (id: string | null) => void;
};

export default function ClassroomStudentPicker({
  valueClassroomId,
  onChangeClassroom,
  valueStudentId,
  onChangeStudent,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState<ClassroomSummaryDto[]>([]);
  const [students, setStudents] = useState<MemberDto[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const cls = await classroomApi.listMine();
        if (!cancelled) setClassrooms(cls ?? []);
      } catch {
        if (!cancelled) setClassrooms([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!valueClassroomId) {
        setStudents([]);
        return;
      }
      setLoading(true);
      try {
        const page = await classroomApi.getMembersPage(
          valueClassroomId as UUID,
          {
            page: 0,
            size: 200,
            sort: "joinedAt,desc",
            role: "STUDENT",
          }
        );
        if (!cancelled) setStudents(page?.content ?? []);
      } catch {
        if (!cancelled) setStudents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [valueClassroomId]);

  const classroomOptions = useMemo(
    () => classrooms.map((c) => ({ id: String(c.id), name: c.name })),
    [classrooms]
  );

  const studentOptions = useMemo(
    () =>
      students.map((m) => ({
        id: String(m.userUuid),
        name:
          m.fullName && m.fullName.trim().length > 0
            ? m.fullName
            : String(m.userUuid).slice(0, 8),
      })),
    [students]
  );

  const selectCls =
    "border border-gray-300 dark:border-white/10 rounded px-2 py-1 text-sm bg-white dark:bg-[#2d3b46] text-gray-900 dark:text-gray-100 focus-visible:ring-2 focus-visible:ring-green-500";

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
      <div className="flex items-center gap-2">
        <label
          htmlFor="classroom"
          className="text-sm text-gray-700 dark:text-gray-300"
        >
          Aula
        </label>
        <select
          id="classroom"
          className={selectCls}
          value={valueClassroomId ?? ""}
          onChange={(e) => {
            const id = e.target.value || null;
            onChangeClassroom(id);
            onChangeStudent(null);
          }}
          disabled={loading && classrooms.length === 0}
        >
          <option value="">(todas)</option>
          {classroomOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label
          htmlFor="student"
          className="text-sm text-gray-700 dark:text-gray-300"
        >
          Alumno
        </label>
        <select
          id="student"
          className={selectCls}
          value={valueStudentId ?? ""}
          onChange={(e) => onChangeStudent(e.target.value || null)}
          disabled={!valueClassroomId || loading}
        >
          <option value="">(todos)</option>
          {studentOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
