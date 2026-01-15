import Link from "next/link";
import { getIconColor } from "@/app/lib/utils/index";
import { socialMenu } from "@/app/lib/data/menu";

const SocialLinks = ({ isScrolled, isDarkMode }) => (
  <div className="flex">
    {socialMenu.map(({ url, icon: Icon, brandColor, name }) => (
      <Link
        key={name}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${name}`}
        className="p-2 rounded-full group hover:bg-bgHover hover:dark:bg-darkbgHover transition-colors"
      >
        <Icon
          aria-hidden="true"
          className={`w-5 h-5 transition-all duration-200 group-hover:scale-105 scale-95 ${brandColor} ${getIconColor(
            isScrolled,
            isDarkMode
          )}`}
        />
      </Link>
    ))}
  </div>
);

export default SocialLinks;
