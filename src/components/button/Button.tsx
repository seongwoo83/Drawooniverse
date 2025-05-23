import type { ButtonProps } from "../../Types";
import './Button.css'

const Button = ({title, onClick, className}: ButtonProps)=>{
    return(
        <button className={`button ${className}`} onClick={onClick}>
            {title}
        </button>
    )
}

export default Button;