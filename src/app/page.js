
import {Navbar,Banner} from "./components";
import DarkModeToggle  from "@/app/components/atoms/theme-toggle/DarkModeToggle";
import HomeClient from "./components/layout/HomeClient";

export default function Home() {
  return (
    <div className="w-full bg-contextBG dark:bg-contextDarkBG  ">
      <Navbar/>
      <Banner/>
      <HomeClient/>
      <div className="md:hidden">
      <DarkModeToggle/>
      </div>
    </div>
  );
  
}
