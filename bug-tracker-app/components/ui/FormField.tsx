import React, { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: ReactNode;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
  icon,
  error,
}) => {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative rounded-lg">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={`block w-full rounded-lg py-3 ${
            icon ? "pl-10" : "pl-4"
          } pr-4 shadow-sm transition-colors ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50"
              : "border-gray-300 focus:border-purple-500 focus:ring-purple-500"
          } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
          placeholder={placeholder}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormField;
