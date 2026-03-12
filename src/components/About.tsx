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
      description: "Suporte profissional 24 horas por dia"
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
    <section id="about" className="w-full py-24 bg-background relative">
      <div className="container mx-auto px-6">
        {/* Top Section: Image and Text */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          
          {/* Image Column */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-3xl blur-lg opacity-50" />
            <img
              src={`${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/images/sobre.jpg`}
              alt="Equipe Herz colaborando em soluções de IA"
              className="relative w-full h-[400px] lg:h-[500px] object-cover rounded-2xl shadow-2xl border border-border/50"
              loading="lazy"
            />
          </div>

          {/* Text Column */}
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Sobre a Herz
            </h2>
            <div className="space-y-6 text-lg text-foreground/80 leading-relaxed text-justify">
              <p>
                A Herz é uma empresa de tecnologia e inovação sediada em Nova Petrópolis (RS), criada em 2024 com a missão de reinventar o atendimento ao público por meio de soluções inteligentes. Desenvolvemos sistemas avançados de Inteligência Artificial para Agentes de IA, elevando a comunicação entre empresas e clientes em múltiplos segmentos.
              </p>
              <p>
                Atuamos nos setores corporativo, jurídico, educacional, saúde (laboratórios e clínicas), varejo, hotelaria e turismo, oferecendo automação de atendimento, suporte personalizado e experiências interativas que aproximam marcas de pessoas. Na Herz, acreditamos que tecnologia só alcança seu verdadeiro potencial quando melhora a vida real. Por isso, cada solução nasce do encontro entre excelência técnica, proximidade e inovação contínua.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((item, index) => (
            <div
              key={index}
              className="bg-card p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-accent/50 group"
            >
              <item.icon className="h-10 w-10 text-accent mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mission Statement (Optional, kept for completeness if needed, but styling adjusted) 
        <div className="max-w-4xl mx-auto mt-20 p-8 bg-gradient-to-br from-accent/5 to-primary/5 rounded-3xl border border-accent/10 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">Nossa Missão</h3>
          <p className="text-xl text-foreground/80 font-medium">
            Ser referência global em atendimento humanizado com Inteligência Artificial, 
            unindo tecnologia e empatia para criar experiências memoráveis.
          </p>
        </div>
        */}
      </div>
    </section>
  );
};

export default About;
