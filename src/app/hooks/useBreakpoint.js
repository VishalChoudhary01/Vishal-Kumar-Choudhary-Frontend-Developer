import { useState,useEffect } from "react";



function useBreakpoint() {
  const [bp, setBp] = useState("desktop");

  useEffect(() => {
    function check() {
      const w = window.innerWidth;

      if (w < 640) {
        setBp("mobile");
      } else if (w < 768) {
        setBp("largeMobile");
      } else if (w < 1024) {
        setBp("tablet");
      } else {
        setBp("desktop");
      }
    }

    check();

    window.addEventListener("resize", check);

    return () => {
      window.removeEventListener("resize", check);
    };
  }, []);

  return bp;
}

export default useBreakpoint