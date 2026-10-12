import { GithubIcon, LinkedinIcon, GmailIcon } from "@/app/components/ui/Icons";

import { RiLinkedinFill } from "react-icons/ri";
import { TbBrandGithubFilled } from "react-icons/tb";
import { BiLogoGmail } from "react-icons/bi";

const email = "vishal.bhumca21@gmail.com";

const subject = "Let's Discuss an Opportunity";

const body = `Hi Vishal,

I came across your portfolio and would like to connect with you.

I’m reaching out regarding a potential opportunity and would be happy to share more details.

Best regards,`;

const gmailHref =
    `https://mail.google.com/mail/?` +
    `view=cm` +
    `&to=${encodeURIComponent(email)}` +
    `&su=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

export const socialData = [
    {
        label: "GitHub",
        href: "https://github.com/VishalChoudhary01",
        icon: TbBrandGithubFilled,
    },

    {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/vishal-kumar-choudhary-frontend-developer/",
        icon: RiLinkedinFill,
    },

    {
        label: "Email",
        href: gmailHref,
        icon: BiLogoGmail,
    },
];