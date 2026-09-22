import Link from "next/link";
function SocialIcon({ link }) {
    const Icon = link.icon;

    const isEmail =
        link.href?.startsWith("mailto:");

    if (!Icon) return null;

    return (
        <Link
            href={link.href}
            target={
                isEmail ? undefined : "_blank"
            }
            rel={
                isEmail
                    ? undefined
                    : "noopener noreferrer"
            }
            aria-label={link.label}
            className=" flex h-10 w-10 items-center justify-center text-text-muted transition-[color,transform] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-px hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background " >
            <Icon
                aria-hidden="true"
                className="md:text-lg"
            />
        </Link>
    );
}

export default SocialIcon