import { Building2, Users, Globe, Target } from "lucide-react";

const About = () => {
  const highlights = [
    {
      icon: Building2,
      title: "Fundada em 2024",
      description: "Sediada em Nova Petrópolis, Serra Gaúcha"
    },
    {
      icon: Users,
      title: "Equipe Especializada",
      description: "Pedro e Junior, fundadores visionários"
    },
    {
      icon: Globe,
      title: "Expansão Global",
      description: "Futura sede em Munique, Alemanha"
    },
    {
      icon: Target,
      title: "Foco em Turismo",
      description: "Soluções inteligentes para o setor"
    }
  ];

  return (
    <section className="py-24 bg-background relative">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Sobre a Herz
          </h2>
          <p className="text-lg text-foreground/70 leading-relaxed">
            A Herz é uma empresa especializada em tecnologia e inovação, sediada em Nova Petrópolis, 
            na encantadora Serra Gaúcha (RS). Fundada em 2024 por Pedro e Junior, nascemos com a visão 
            de transformar o atendimento ao público por meio de soluções inteligentes e personalizadas.
          </p>
          <p className="text-lg text-foreground/70 leading-relaxed">
            Nosso foco está em desenvolver sistemas de Inteligência Artificial para Agentes de IA, 
            impulsionando o setor de turismo com automação de comunicação, suporte personalizado e 
            experiências interativas. Na Herz, acreditamos que tecnologia é feita para pessoas – 
            e, por isso, cada solução nasce da busca constante por excelência, proximidade e inovação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {highlights.map((item, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-border/50 group"
            >
              <item.icon className="h-10 w-10 text-accent mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-16 p-8 bg-gradient-to-br from-accent/10 to-primary/5 rounded-2xl border border-accent/20">
          <h3 className="text-2xl font-bold text-foreground mb-4 text-center">Nossa Missão</h3>
          <p className="text-center text-foreground/80 text-lg">
            Ser referência global em atendimento humanizado com Inteligência Artificial, 
            unindo tecnologia e empatia para criar experiências memoráveis em cada interação.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
