import './button.css';

const Button = ({
  buttonStyle = "",
  buttonText = "Button",
  leftIcon,
  rightIcon,
  leftStyle = "",
  rightStyle = "",
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 cursor-pointer transition-all duration-300 ${buttonStyle}`}
    >
      <span className="flex items-center gap-2">
        {leftIcon && <span className={leftStyle}>{leftIcon}</span>}
        <span>{buttonText}</span>
        {rightIcon && <span className={rightStyle}>{rightIcon}</span>}
      </span>
    </button>
  );
};

export default Button;