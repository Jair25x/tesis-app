// src/components/auth/AuthError.tsx
interface Props {
  message: string;
}

export default function AuthError({ message }: Props) {
  return (
    <p className="text-red-400 text-sm text-center font-medium mb-2">
      {message}
    </p>
  );
}
