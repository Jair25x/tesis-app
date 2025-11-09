// src/components/student/HeroBanner.tsx
export default function HeroBanner({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border p-5 md:p-7 bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-indigo-950/20 dark:to-sky-950/20 dark:border-gray-700">
      <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-700 dark:text-indigo-300">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm md:text-base text-gray-700 dark:text-gray-300">
          {subtitle}
        </p>
      )}
    </div>
  );
}
