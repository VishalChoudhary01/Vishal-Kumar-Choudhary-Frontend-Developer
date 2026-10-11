import NavLink from "./DesktopNavigation/NavLink";
import NavGroup from "./DesktopNavigation/NavGroup";

const LINK_CLASSES = `
  group
  relative
  flex
  h-10
  items-center
  justify-center
  px-4
  text-[14px]
  font-medium
  leading-none
  text-text-secondary
  transition-[color,transform]
  duration-[220ms]
  ease-[cubic-bezier(0.16,1,0.3,1)]
  hover:-translate-y-px
  hover:text-text-primary
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-brand
  focus-visible:ring-offset-2
  focus-visible:ring-offset-background
`;

function DesktopNavigation({ navLinks, activeHref, onNavigate }) {
  return (
    <nav className="flex items-center" aria-label="Section navigation">
      <div className="flex items-center gap-1">
        {navLinks.map((link) =>
          link.children?.length ? (
            <NavGroup
              key={link.href}
              link={link}
              active={activeHref === link.href}
              onNavigate={onNavigate}
              className={LINK_CLASSES}
            />
          ) : (
            <NavLink
              key={link.href}
              link={link}
              active={activeHref === link.href}
              onNavigate={onNavigate}
              className={LINK_CLASSES}
            />
          ),
        )}
      </div>
    </nav>
  );
}

export default DesktopNavigation;
