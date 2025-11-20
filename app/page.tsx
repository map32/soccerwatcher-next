import Image from "next/image";
import Carousel from "./carousel";
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full flex-col items-center py-8 bg-white dark:bg-black sm:items-start">
        <section className='self-stretch flex flex-col justify-center my-[4vw]'>
          <p className="text-[7vw] text-center">
            THE HUB FOR SOCCER STATS
          </p>
          <p className="ml-[8vw] text-[2vw]">
            Your Source for Soccer Insights
          </p>
        </section>
        <section className="banner w-full h-256 relative">
          <Image src="/banner.jpg" alt="soccer banner with radar charts, data analytics, and a soccer player at the center" fill={true}  className='object-cover' />
          <div className='relative w-full h-full'>
            <p className='absolute top-[70%] left-[1vw] text-[1.1vw] text-white max-w-[50vw]'>Welcome to Soccerwatcher!, where you can easily access current soccer statistics and game data across various leagues, helping you stay informed on players and performances.</p>
          </div>
        </section>
        <section className="w-full flex justify-center py-16">
          <Carousel />
        </section>
      </main>
    </div>
  );
}
