interface Props {
  title: string;
  children: React.ReactNode;
}

export default function AuthFormWrapper({ title, children }: Props) {
  return (
    <div className="bg-[#2d3b46] rounded-xl px-10 py-8 w-full max-w-md shadow-lg space-y-5">
      <h1 className="text-3xl font-bold text-center mb-4">{title}</h1>
      {children}
    </div>
  );
}
