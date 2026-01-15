"use client";

import dynamic from "next/dynamic";

const Main = dynamic(() => import("./Main"), {
  ssr: false,
  loading: () => <div className="h-screen" />,
});

export default function HomeClient() {
  return <Main />;
}
