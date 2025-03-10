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
        className="flex flex-col w-full rounded-md p-4 bg-wax-flower-950/20 text-wax-flower-200 h-10 placeholder-wax-flower-200 focus:ring-0 focus:ring-offset-2 focus:ring-offset-wax-flower-200 pr-10"
        required
      />
      <div
        onClick={toggleShow}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-wax-flower-400 hover:text-wax-flower-300 transition-colors cursor-pointer select-none"
      >
        {show ? <FiEyeOff size={20} /> : <FiEye size={20} />}
      </div>
    </div>
  );
};

export default PasswordInput;
