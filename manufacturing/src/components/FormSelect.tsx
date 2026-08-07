import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

type FormSelectProps = {
  label: string;
  required?: boolean;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  onAddOption?: (newOption: string) => void;
  placeholder?: string;
};

function FormSelect({
  label,
  required = false,
  options,
  value,
  onChange,
  onAddOption,
  placeholder = `Choose or type ${label.toLowerCase()}`,
}: FormSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [filteredOptions, setFilteredOptions] = useState(options);

  // Sync local state when the parent 'value' prop changes (e.g., clicking Edit)
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Sync options if the parent fetches them asynchronously
  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (onChange) {
      onChange(newValue);
    }

    // Filter options based on input
    const filtered = options.filter((option) =>
      option.toLowerCase().includes(newValue.toLowerCase())
    );
    setFilteredOptions(filtered);
    setIsOpen(true);
  };

  const handleSelectOption = (option: string) => {
    setInputValue(option);
    setIsOpen(false);
    if (onChange) {
      onChange(option);
    }
  };

  const handleAddNew = () => {
    if (inputValue.trim() && onAddOption) {
      onAddOption(inputValue.trim());
      setIsOpen(false);
    }
  };

  const handleFocus = () => {
    setFilteredOptions(options);
    setIsOpen(true);
  };

  return (
    <div className="relative">
      <label className="block mb-2 font-medium">
        {label}
        {required && (
          <span className="text-red-500"> *</span>
        )}
      </label>

      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-10 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleAddNew}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          title="Add new option"
        >
          <Plus size={18} />
        </button>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map((option) => (
            <div
              key={option}
              onClick={() => handleSelectOption(option)}
              className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
            >
              {option}
            </div>
          ))}
        </div>
      )}

      {isOpen && inputValue && filteredOptions.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-slate-500">
          No matching options found. Click + to add "{inputValue}"
        </div>
      )}
    </div>
  );
}

export default FormSelect;