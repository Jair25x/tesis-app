interface Props {
  title: string;
  children: React.ReactNode;
}

export default function AuthFormWrapper({ title, children }: Props) {
  return (
    <div className="bg-white/95 dark:bg-slate-800 rounded-2xl px-8 py-8 sm:px-10 w-full max-w-md shadow-xl border border-slate-200/80 dark:border-slate-700 space-y-5">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-slate-900 dark:text-slate-50">
        {title}
      </h1>
      {children}
    </div>
  );
}
