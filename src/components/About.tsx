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
      description: "Profissionais qualificados e dispostos a entregar o melhor serviço"
    },
    {
      icon: Globe,
      title: "Expansão Global",
      description: "Futura sede em Munique, Alemanha"
    },
    {
      icon: Target,
      title: "Diversos Segmentos",
      description: "Soluções inteligentes para corporativo, educação, saúde e mais"
    }
  ];

  return (
    <section className="py-24 bg-background relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16 max-w-6xl mx-auto">
          <div className="relative order-2 md:order-1">
            <img
              src="/images/sobre.jpg"
              alt="Equipe Herz colaborando em soluções de IA"
              className="w-full h-[380px] md:h-[420px] rounded-2xl object-cover border border-border shadow-xl"
              loading="lazy"
            />
          </div>
          <div className="space-y-6 order-1 md:order-2">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Sobre a Herz
            </h2>
            <p className="text-lg text-foreground/70 leading-relaxed" style={{ textAlign: 'justify' }}>
              A Herz é uma empresa especializada em tecnologia e inovação, sediada em Nova Petrópolis,
              na encantadora Serra Gaúcha (RS). Fundada em 2024 por Pedro e Junior, nascemos com a visão
              de transformar o atendimento ao público por meio de soluções inteligentes e personalizadas.
            </p>
            <p className="text-lg text-foreground/70 leading-relaxed" style={{ textAlign: 'justify' }}>
              Nosso foco está em desenvolver sistemas de Inteligência Artificial para Agentes de IA,
              impulsionando diversos setores como corporativo, educação, saúde, varejo e turismo com
              automação de comunicação, suporte personalizado e experiências interativas. Na Herz, acreditamos
              que tecnologia é feita para pessoas – e, por isso, cada solução nasce da busca constante por
              excelência, proximidade e inovação.
            </p>
          </div>
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
