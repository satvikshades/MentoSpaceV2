import React from "react";

function InputField({
  id,
  type,
  placeholder,
  value,
  onChange,
  error,
  icon,
  as = "input",
  children,
}) {
  const commonProps = {
    id,
    name: id,
    className: `w-full pl-12 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 ${
      error
        ? "border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:ring-primary"
    }`,
    value,
    onChange,
  };

  const InputComponent = as;

  return (
    <div>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4">
          {React.cloneElement(icon, {
            className: `h-5 w-5 ${error ? "text-red-500" : "text-gray-400"}`,
          })}
        </span>
        {as === "select" ? (
          <InputComponent {...commonProps}>{children}</InputComponent>
        ) : (
          <InputComponent
            type={type}
            placeholder={placeholder}
            {...commonProps}
          />
        )}
      </div>
      {error && <p className="text-red-600 text-xs mt-1 ml-1">{error}</p>}
    </div>
  );
}

export default InputField;
