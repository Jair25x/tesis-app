// src/components/auth/AuthRedirectNotice.tsx
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
      <p className="text-sm text-gray-300">
        {text}{" "}
        <button
          onClick={onClick}
          className="text-blue-300 hover:underline font-medium"
        >
          {buttonLabel}
        </button>
      </p>
    </div>
  );
}
