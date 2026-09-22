import ActiveDot from "./ActiveDot";
import Link from "next/link";

function NavLink({ link, active,className }) {
    return (
        <Link
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={className}
        >
            {active && <ActiveDot />}
            <span className="relative z-10">{link.label}</span>
        </Link>
    );
}


export default NavLink