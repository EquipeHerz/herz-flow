import { Bot, Monitor, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Services = () => {
  const services = [
    {
      icon: Bot,
      title: "Chatbots Inteligentes",
      description: "Sistemas de Inteligência Artificial para atendimento ao cliente no setor de turismo. Automação de comunicação, suporte personalizado e experiências interativas disponíveis 24/7.",
      features: [
        "Atendimento automatizado 24/7",
        "Respostas personalizadas",
        "Integração com múltiplos canais",
        "Análise de sentimento em tempo real"
      ],
      color: "from-accent/20 to-accent/5"
    },
    {
      icon: Monitor,
      title: "Totens de Autoatendimento",
      description: "Totens de última geração que otimizam operações, oferecem praticidade aos usuários e agregam valor à gestão dos negócios com interface intuitiva e moderna.",
      features: [
        "Interface touch intuitiva",
        "Design moderno e elegante",
        "Múltiplas opções de pagamento",
        "Gestão centralizada de conteúdo"
      ],
      color: "from-primary/20 to-primary/5"
    },
    {
      icon: Lightbulb,
      title: "Painéis de LED",
      description: "Painéis de LED publicitários para comunicação visual moderna, eficiente e estratégica. Impacte seu público com tecnologia de ponta e conteúdo dinâmico.",
      features: [
        "Alta resolução e brilho",
        "Conteúdo programável",
        "Gestão remota",
        "Impacto visual garantido"
      ],
      color: "from-float-blue/20 to-float-blue/5"
    }
  ];

  return (
    <section id="services" className="py-24 bg-muted/30 relative">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Nossas Soluções
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Tecnologia de ponta para transformar o atendimento e a comunicação do seu negócio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-border/50"
            >
              <div className={`bg-gradient-to-br ${service.color} p-8 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <service.icon className="h-12 w-12 text-accent mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-bold text-foreground mb-3 relative z-10">
                  {service.title}
                </h3>
              </div>
              
              <div className="p-8 space-y-6">
                <p className="text-foreground/70 leading-relaxed">
                  {service.description}
                </p>
                
                <ul className="space-y-3">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full bg-accent hover:bg-accent/90 text-background"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Solicitar Demonstração
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
