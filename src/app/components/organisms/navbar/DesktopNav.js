import DropDownMenu from "../../molecules/menu/DropdownMenu";
import {DarkModeToggle,SocialLinks,DownloadResume} from './index'

const DesktopNav = ({ isScrolled, isDarkMode, toggleMode }) => (
  <div className="hidden md:flex gap-4 items-center ">
    <DropDownMenu isScrolled={isScrolled} />
    <DarkModeToggle isDarkMode={isDarkMode} toggleMode={toggleMode} isScrolled={isScrolled} />
    <SocialLinks isScrolled={isScrolled} isDarkMode={isDarkMode} />
    <DownloadResume isScrolled={isScrolled} isDarkMode={isDarkMode} />
  </div>
);

export default DesktopNav