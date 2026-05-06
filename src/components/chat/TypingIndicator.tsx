export const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted text-foreground">
        <div className="flex gap-1">
          <div 
            className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" 
            style={{ animationDelay: "0ms" }} 
          />
          
          <div 
            className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" 
            style={{ animationDelay: "150ms" }} 
          />
          
          <div 
            className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" 
            style={{ animationDelay: "300ms" }} 
          />
        </div>
      </div>
    </div>
  );
};
