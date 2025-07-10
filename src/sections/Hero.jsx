import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import ServiceSummary from "./ServiceSummary";
import Waves from "../components/WaveBackground";

const Hero = () => {
  const text = `I help growing brands and startups gain an
unfair advantage through premium
results driven web apps`;
  return (
    <>
      <section id="home" className="flex flex-col justify-end min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 h-full w-full">
        <Waves
          lineColor="#bbbfcb"
          backgroundColor="rgba(255, 255, 255, 0.2)"
          waveSpeedX={0.02}
          waveSpeedY={0.01}
          waveAmpX={40}
          waveAmpY={20}
          friction={0.9}
          tension={0.01}
          maxCursorMove={120}
          xGap={12}
          yGap={36}
        />
        </div>
        <div className="relative z-10 flex justify-center items-center min-h-screen w-full">
          <AnimatedHeaderSection
            subTitle={"Full stack dev"}
            title={"Shubhojit Mitra"}
            text={text}
            textColor={"text-black"}
          />
        </div>
        <ServiceSummary />
      </section>
    </>
  );
};

export default Hero;
