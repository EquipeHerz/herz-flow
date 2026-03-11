import { LogoCarousel, Logo } from "@/components/ui/logo-carousel";

const Clients = () => {
  const logos: Logo[] = [
    { name: "Prime Gourmet Club", id: 1, img: "/images/logos/Prime.jpg" },
    { name: "Giordani Turismo", id: 2, img: "/images/logos/giordani.png" },
    { name: "Vila da Mônica Gramado", id: 3, img: "/images/logos/VMG Parque Gramado.png" },
    { name: "Gramado Zoo", id: 4, img: "/images/logos/gramadozoo.png" },
    { name: "Pocahy Zen Spa", id: 5, img: "/images/logos/pocahy.png" },
  ];

  return (
    <section id="clients" className="py-24 bg-background relative">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Nossos Clientes
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Empresas que confiam na Herz para transformar seu atendimento
          </p>
        </div>

        <div className="flex justify-center w-full">
            <div className="w-full max-w-5xl">
                 <LogoCarousel logos={logos} columnCount={3} />
            </div>
        </div>
      </div>
    </section>
  );
};

export default Clients;
