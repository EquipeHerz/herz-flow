const AIAnimations = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Neural network nodes */}
      <div className="absolute top-20 left-10 w-3 h-3 bg-accent/60 rounded-full animate-pulse" />
      <div className="absolute top-40 left-32 w-2 h-2 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
      <div className="absolute top-60 left-20 w-2.5 h-2.5 bg-accent/50 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
      
      <div className="absolute top-32 right-20 w-3 h-3 bg-accent/60 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
      <div className="absolute top-52 right-40 w-2 h-2 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: "0.8s" }} />
      <div className="absolute top-72 right-24 w-2.5 h-2.5 bg-accent/50 rounded-full animate-pulse" style={{ animationDelay: "1.2s" }} />

      <div className="absolute bottom-32 left-24 w-3 h-3 bg-accent/60 rounded-full animate-pulse" style={{ animationDelay: "0.6s" }} />
      <div className="absolute bottom-52 left-48 w-2 h-2 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: "1.1s" }} />
      
      <div className="absolute bottom-40 right-32 w-3 h-3 bg-accent/60 rounded-full animate-pulse" style={{ animationDelay: "0.9s" }} />
      <div className="absolute bottom-60 right-56 w-2 h-2 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: "1.4s" }} />

      {/* Connection lines - SVG for better performance */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 0.1 }} />
          </linearGradient>
          <linearGradient id="lineGradient2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 0.1 }} />
          </linearGradient>
        </defs>
        
        <line x1="10%" y1="15%" x2="25%" y2="30%" stroke="url(#lineGradient1)" strokeWidth="1" className="animate-pulse" />
        <line x1="25%" y1="30%" x2="15%" y2="45%" stroke="url(#lineGradient1)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
        <line x1="90%" y1="20%" x2="80%" y2="35%" stroke="url(#lineGradient2)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: "0.3s" }} />
        <line x1="80%" y1="35%" x2="85%" y2="50%" stroke="url(#lineGradient2)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: "0.8s" }} />
        <line x1="15%" y1="75%" x2="30%" y2="65%" stroke="url(#lineGradient1)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: "0.6s" }} />
        <line x1="85%" y1="70%" x2="75%" y2="55%" stroke="url(#lineGradient2)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: "0.9s" }} />
      </svg>

      {/* Floating chat bubbles */}
      <div className="absolute top-1/4 left-1/4 animate-float">
        <div className="bg-accent/10 backdrop-blur-sm border border-accent/20 rounded-2xl rounded-tl-none p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>

      <div className="absolute top-1/3 right-1/4 animate-float-delayed">
        <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-2xl rounded-tr-none p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>

      {/* Brain/AI icon effect */}
      <div className="absolute bottom-1/4 left-1/3 opacity-5">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" className="animate-pulse-slow">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7v-2z" fill="currentColor" className="text-accent" />
        </svg>
      </div>
    </div>
  );
};

export default AIAnimations;
