export default function EngravedBackground() {
  return (
    <div className="absolute top-[20%]     flex items-center justify-center">
      <h1 
        className="pointer-events-none animate-pulse [animation-duration:5s]  [animation-delay:1s]  [letter-spacing:0.02em] uppercase select-none  dark:text-navbarDarkBG text-navbarBG dark:[text-shadow:0_0_1px_rgba(0,0,0,0.5),2px_2px_4px_rgba(0,0,0,0.95),-2px_-2px_4px_rgba(80,80,80,0.3),1px_1px_0_rgba(0,0,0,0.8),-1px_-1px_0_rgba(70,70,70,0.2)]  [text-shadow:3px_3px_5px_rgba(160,170,170,0.5),-3px_-3px_5px_rgba(255,255,255,1),1px_1px_0_rgba(190,200,200,0.8),-1px_-1px_0_rgba(255,255,255,0.4)] text-center md:text-9xl text-5xl font-extrabold font-roboto"
      >
        Vishal Kumar Choudhary
      </h1>
    </div>
  );
}