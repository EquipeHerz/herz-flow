const FloatingElements = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating circles */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-float-cyan/10 rounded-full blur-xl animate-float" />
      <div className="absolute top-40 right-20 w-48 h-48 bg-float-blue/10 rounded-full blur-2xl animate-float-delayed" />
      <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-accent/10 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-float-slate/10 rounded-full blur-2xl animate-float-delayed" />
      
      {/* Decorative lines */}
      <svg className="absolute top-1/4 right-10 w-64 h-64 opacity-5 animate-pulse-slow" viewBox="0 0 200 200">
        <path d="M 20 100 Q 100 20 180 100 T 340 100" stroke="currentColor" strokeWidth="2" fill="none" className="text-accent" />
        <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="1" fill="none" className="text-primary" />
      </svg>
    </div>
  );
};

export default FloatingElements;
