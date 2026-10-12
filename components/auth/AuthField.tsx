export default function AuthField({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-[13px] font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14.5px] text-slate-950 outline-none transition focus:border-accentDim focus:bg-white focus:ring-4 focus:ring-accentTint"
      />
    </div>
  );
}
