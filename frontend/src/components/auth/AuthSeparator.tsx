// src/components/auth/AuthSeparator.tsx
export default function AuthSeparator() {
  return (
    <div className="flex items-center gap-2 my-2">
      <hr className="flex-grow border-gray-600" />
      <span className="text-gray-400 text-sm">o</span>
      <hr className="flex-grow border-gray-600" />
    </div>
  );
}
