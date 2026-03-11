const FloatingElements = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating circles - more visible */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-float-cyan/20 rounded-full blur-xl animate-float" />
      <div className="absolute top-40 right-20 w-48 h-48 bg-float-blue/20 rounded-full blur-2xl animate-float-delayed" />
      <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-accent/20 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-float-slate/20 rounded-full blur-2xl animate-float-delayed" />
      
      {/* Additional floating elements */}
      <div className="absolute top-1/3 left-1/3 w-24 h-24 bg-primary/15 rounded-full blur-lg animate-float" />
      <div className="absolute top-2/3 right-1/4 w-28 h-28 bg-float-cyan/15 rounded-full blur-xl animate-float-delayed" />
      <div className="absolute bottom-1/3 left-1/2 w-32 h-32 bg-accent/15 rounded-full blur-lg animate-float" />
      <div className="absolute top-1/2 right-1/2 w-20 h-20 bg-float-blue/15 rounded-full blur-md animate-float-delayed" />
      
      {/* Small accent circles */}
      <div className="absolute top-1/4 left-1/2 w-16 h-16 bg-primary/20 rounded-full blur-md animate-float" />
      <div className="absolute bottom-1/4 right-1/3 w-20 h-20 bg-float-cyan/20 rounded-full blur-lg animate-float-delayed" />
      <div className="absolute top-3/4 left-1/4 w-18 h-18 bg-accent/20 rounded-full blur-md animate-float" />
      
      {/* Decorative lines and shapes */}
      <svg className="absolute top-1/4 right-10 w-64 h-64 opacity-10 animate-pulse-slow" viewBox="0 0 200 200">
        <path d="M 20 100 Q 100 20 180 100 T 340 100" stroke="currentColor" strokeWidth="2" fill="none" className="text-accent" />
        <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="1" fill="none" className="text-primary" />
      </svg>
      
      <svg className="absolute bottom-1/4 left-10 w-48 h-48 opacity-10 animate-pulse-slow" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-float-cyan" />
        <path d="M 50 100 L 150 100 M 100 50 L 100 150" stroke="currentColor" strokeWidth="1" fill="none" className="text-float-blue" />
      </svg>
    </div>
  );
};

export default FloatingElements;
