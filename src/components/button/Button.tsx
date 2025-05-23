import type { ButtonProps } from "../../Types";
import './Button.css'

const Button = ({title, onClick, className, isSelected}: ButtonProps)=>{
    return(
        <button className={`button ${className} ${isSelected ? "selected" : ""}`} onClick={onClick}>
            {title}
        </button>
    )
}

export default Button;