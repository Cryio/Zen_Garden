import React from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

const PasswordInput = ({
  name,
  placeholder,
  value,
  onChange,
  show,
  toggleShow,
  onFocus,
  onBlur,
}) => {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className="flex flex-col w-full rounded-md p-4 bg-[rgba(126,34,206,0.2)] text-white border-none  h-12 placeholder-[#94A3B8] focus:ring-2 focus:ring-[#a600c8] pr-10"
        required
      />
      <button
        type="button"
        onClick={toggleShow}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-white"
        style={{ background: "none", border: "none" }}
      >
        {show ? <FiEyeOff size={20} /> : <FiEye size={20} />}
      </button>
    </div>
  );
};

export default PasswordInput;
