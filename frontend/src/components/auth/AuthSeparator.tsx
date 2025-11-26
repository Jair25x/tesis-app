export default function AuthSeparator() {
  return (
    <div className="flex items-center gap-2 my-4">
      <hr className="flex-grow border-slate-200 dark:border-slate-600" />
      <span className="text-slate-400 dark:text-slate-300 text-xs uppercase tracking-wide">
        o
      </span>
      <hr className="flex-grow border-slate-200 dark:border-slate-600" />
    </div>
  );
}
