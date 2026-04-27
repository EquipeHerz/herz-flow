export const AuthSplitLayout = ({ left }: { left: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-hero-start to-hero-end p-4 sm:p-8">
      <div className="w-full max-w-5xl h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] bg-background/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50 overflow-hidden">
        <div className="w-full h-full p-6 sm:p-8 lg:p-10">{left}</div>
      </div>
    </div>
  );
};
