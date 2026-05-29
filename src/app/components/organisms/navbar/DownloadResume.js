import { LuArrowDownToLine } from "react-icons/lu";
import { Button } from "../../atoms/button/index";
import { RESUME_PDF_PATH, RESUME_DOWNLOAD_FILENAME } from "@/app/constants/resume";

const DownloadResume = ({ isScrolled, isDarkMode }) => {
  const handleDownloadResume = () => {
    const link = document.createElement("a");
    link.href = RESUME_PDF_PATH;
    link.download = RESUME_DOWNLOAD_FILENAME;
    link.click();
  };

  return (
    <Button
      buttonText="Resume"
      leftIcon={<LuArrowDownToLine className="w-4 h-4" />}
      buttonStyle={`${
        isDarkMode ? "dark-button-curtain" : "button-curtain"
      } flex items-center font-roboto transition-all gap-2 md:px-5 px-3 md:py-2 py-1.5 dark:bg-darkbtnBG dark:text-darkbtnTXT bg-btnBG text-btnTXT ${
        isScrolled 
          ? "rounded-r-full rounded-l-full mr-2" 
          : "rounded-lg"
      }`}
      leftStyle="animate-downloadingFlow"
      rightStyle=""
      onClick={handleDownloadResume}
    />
  );
};

export default DownloadResume