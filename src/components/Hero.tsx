import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AIAnimations from "./AIAnimations";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-hero-start to-hero-end" />
      <AIAnimations />
      
      <div className="container mx-auto px-6 py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground animate-fade-in-up leading-tight">
            <span className="text-accent">Soluções inteligentes</span>, para o seu negócio decolar.
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/70 animate-fade-in-up max-w-2xl mx-auto" style={{ animationDelay: "0.2s" }}>
            Transformando o atendimento ao público com Inteligência Artificial, totens de última geração e soluções digitais personalizadas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <Button 
              size="lg" 
              className="bg-accent text-background hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Conheça Nossas Soluções
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary hover:bg-primary hover:text-primary-foreground"
              asChild
            >
              <a 
                href="https://wa.me/5554999699949?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20seus%20servi%C3%A7os%21**"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                Converse conosco
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
