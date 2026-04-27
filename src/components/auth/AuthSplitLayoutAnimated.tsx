import FloatingElements from "@/components/FloatingElements";
import AIAnimations from "@/components/AIAnimations";

export const AuthSplitLayoutAnimated = ({
  left,
  rightTitle,
  rightDescription,
}: {
  left: React.ReactNode;
  rightTitle: string;
  rightDescription: string;
}) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-hero-start to-hero-end p-4 sm:p-8 relative overflow-hidden">
      <FloatingElements />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-background/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50 overflow-hidden min-h-[600px] relative z-10">
        <div className="w-full p-8 lg:p-12 xl:p-16 flex flex-col justify-center relative z-20">{left}</div>

        <div className="hidden lg:flex relative bg-muted flex-col justify-end p-12 text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-90 mix-blend-multiply z-10" />
          <AIAnimations />
          <div className="relative z-20 space-y-6 max-w-lg mx-auto lg:mx-0">
            <h2 className="text-3xl xl:text-4xl font-bold leading-tight dark:text-[#ffffff] text-primary-foreground">{rightTitle}</h2>
            <p className="text-lg opacity-90 leading-relaxed dark:text-[#e0e0e0] text-primary-foreground/90">{rightDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

