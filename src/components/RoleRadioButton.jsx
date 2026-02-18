import React from "react";

function RoleRadioButton({ id, name, value, checked, onChange, label, icon }) {
  return (
    <>
      <label
        htmlFor={id}
        className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all duration-300 ${
          checked
            ? "bg-primary/10 border-primary text-primary shadow-sm"
            : "border-gray-300 bg-white hover:bg-gray-50"
        }`}
      >
        {React.cloneElement(icon, { className: "h-5 w-5" })}
        <span className="font-semibold">{label}</span>
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
      </label>
    </>
  );
}

export default RoleRadioButton;
