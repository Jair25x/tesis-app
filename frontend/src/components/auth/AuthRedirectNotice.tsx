interface Props {
  text: string;
  buttonLabel: string;
  onClick: () => void;
}

export default function AuthRedirectNotice({
  text,
  buttonLabel,
  onClick,
}: Props) {
  return (
    <div className="text-center mt-6">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {text}{" "}
        <button
          onClick={onClick}
          className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
        >
          {buttonLabel}
        </button>
      </p>
    </div>
  );
}
