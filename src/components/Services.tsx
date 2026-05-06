import { Bot, Monitor, Lightbulb } from "lucide-react";
import { ServiceCard } from "./services/ServiceCard";

const Services = () => {
  const services = [
    {
      icon: Bot,
      title: "Chatbots Inteligentes",
      description: "Sistemas de Inteligência Artificial para atendimento ao cliente. Automação de comunicação, suporte personalizado e experiências interativas disponíveis 24/7.",
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
      description: "Totens de última geração para experiências rápidas e intuitivas: bilheteria e venda de ingressos automatizadas, operações otimizadas e gestão simplificada, tudo com design moderno e acessível.",
      features: [
        "Interface touch intuitiva",
        "Design moderno e elegante",
        "Bilheteria e venda de ingressos automatizados",
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
    <section id="services" className="w-full py-24 bg-muted-light/50 dark:bg-muted/30 relative">
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
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              features={service.features}
              color={service.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
