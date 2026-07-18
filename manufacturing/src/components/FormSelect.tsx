type FormSelectProps = {
  label: string;
  required?: boolean;
  options: string[];

  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => void;
};

function FormSelect({
  label,
  required = false,
  options,
  value,
  onChange,
}: FormSelectProps) {
  return (
    <div>
      <label className="block mb-2 font-medium">
        {label}
        {required && (
          <span className="text-red-500"> *</span>
        )}
      </label>

      <select
  value={value}
  onChange={onChange}
  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white"
  >
        <option>
          Select {label}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FormSelect;