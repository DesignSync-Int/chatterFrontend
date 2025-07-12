type ButtonProps = {
  onClick?: (...args: any[]) => void;
  children: string;
  buttonType?: "submit" | "reset" | "button";
  disabled?: boolean;
};

const Button = ({ onClick, children, buttonType, disabled }: ButtonProps) => {
  return (
    <button
      type={buttonType}
      className={`border-0 rounded-lg bg-[#e8506e] text-white px-2.5 py-1.5 font-semibold cursor-pointer transition-colors duration-200 ease-in-out hover:bg-[#cc3d59] ${
        disabled ? "opacity-50 cursor-not-allowed hover:bg-[#e8506e]" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
