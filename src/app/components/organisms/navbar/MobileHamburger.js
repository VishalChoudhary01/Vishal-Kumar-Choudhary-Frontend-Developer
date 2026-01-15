import { RxHamburgerMenu } from "react-icons/rx";
import { toggleSidebar } from "../../../redux/featuresSlice/UISlice";
import { useDispatch, useSelector } from "react-redux";

const MobileHamburger = () => {
  const dispatch = useDispatch();
  const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen);

  return (
    <div className="md:hidden">
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="text-2xl p-2 transition-colors text-icon-text dark:text-DrkIcon-text"
      >
        {!isSidebarOpen && <RxHamburgerMenu />}
      </button>
    </div>
  );
};

export default MobileHamburger