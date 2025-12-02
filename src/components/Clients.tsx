import { useState, useRef, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageGalleryModal } from "./ImageGalleryModal";

const Clients = () => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{ images: string[]; name: string; description: string; initialIndex: number } | null>(null);

  const clients = [
    {
      name: "Prime Gourmet Club",
      address: "https://primegourmetclub.com.br/",
      phone: "+55 (51) 99108-6387",
      whatsapp: "https://api.whatsapp.com/send?phone=5551991086387",
      description:
        "O Prime Gourmet Club é um aplicativo e clube de benefícios que oferece descontos exclusivos em diversas experiências, principalmente em gastronomia, hotelaria e entretenimento.",
      images: [
        "/images/clientes/prime/prime_01.jpg",
        "/images/clientes/prime/prime_02.jpg",
        "/images/clientes/prime/prime_03.jpg",
        "/images/clientes/prime/prime_04.jpg",
        "/images/clientes/prime/prime_05.jpg",
      ],
    },
    {
      name: "Giordani Turismo",
      address: "https://reservas.giordaniturismo.com.br/",
      phone: "+55 (54) 3455-2788",
      whatsapp: "https://api.whatsapp.com/send?phone=555434552788",
      description:
        "A Giordani Turismo é uma agência de turismo e viagens com sede em Bento Gonçalves e com uma filial em Sant'Ana do Livramento, que oferece a seus clientes diversas experiências imersivas de turismo receptivo.",
      images: [
        "/images/clientes/giordani/giordani_01.jpg",
        "/images/clientes/giordani/giordani_02.jpg",
        "/images/clientes/giordani/giordani_03.jpg",
        "/images/clientes/giordani/giordani_04.jpg",
        "/images/clientes/giordani/giordani_05.jpg",
      ],
    },
    {
      name: "Vila da Mônica Gramado",
      address: "viladamonica.com.br",
      phone: "+55 (54) 3421-9999",
      whatsapp: "https://api.whatsapp.com/send?phone=555434219999",
      description:
        "A Vila da Mônica em Gramado é um parque temático com cerca de 11 mil m² de área, que recria o 'Bairro do Limoeiro' das histórias em quadrinhos da Turma da Mônica. O parque oferece diversas atrações interativas, com cenários como as casas da Mônica e do Cebolinha, e espaços como o Laboratório do Franjinha e a Cidade dos Carrinhos.",
      images: [
        "/images/clientes/vmg/vmg_01.jpg",
        "/images/clientes/vmg/vmg_02.jpg",
        "/images/clientes/vmg/vmg_03.jpg",
        "/images/clientes/vmg/vmg_04.jpg",
        "/images/clientes/vmg/vmg_05.jpg",
      ],
    },
  ];

  const websiteHref = (url: string) => (url.startsWith("http://") || url.startsWith("https://")) ? url : `https://${url}`;
  const displayDomain = (url: string) => {
    const normalized = websiteHref(url);
    try {
      const u = new URL(normalized);
      return u.hostname;
    } catch {
      return url.replace(/^https?:\/\//, "");
    }
  };
  const withBase = (p: string) => `${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}${p.startsWith('/') ? p : `/${p}`}`;

  const listRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = listRef.current;
    if (!el) return;
    const amount = Math.min(340, el.clientWidth * 0.8);
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 16);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 16);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

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

        <div className="relative max-w-6xl mx-auto">
          <div ref={listRef} className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-visible scroll-smooth snap-x snap-mandatory pb-2 -mx-6 md:mx-0 px-6 md:px-0">
            {clients.map((client, index) => (
              <div
                key={index}
                className={`group relative block rounded-2xl overflow-hidden shadow-lg transition-all duration-500 border border-border/50 min-w-[280px] md:min-w-0 snap-start ${index === 0 ? 'ml-5 md:ml-0' : ''} cursor-pointer`}
                onClick={() => { setSelectedClient({ images: client.images, name: client.name, description: client.description, initialIndex: 0 }); setGalleryOpen(true); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedClient({ images: client.images, name: client.name, description: client.description, initialIndex: 0 }); setGalleryOpen(true); } }}
                role="button"
                tabIndex={0}
                aria-label={`Abrir galeria de ${client.name}`}
                style={{ boxShadow: "0 0 40px -15px hsl(var(--accent) / 0.25)" }}
              >
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-105" style={{ backgroundImage: `url(${withBase(client.images[0])})` }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, hsl(var(--background) / 0.85), transparent 55%)" }} />
                <div className="relative flex flex-col justify-end h-[24.64rem] p-6 text-white">
                  <h3 className="text-2xl font-bold tracking-tight drop-shadow-md">{client.name}</h3>
                  <div className="mt-5 flex items-center justify-between bg-[hsl(var(--accent)/0.2)] backdrop-blur-md border border-[hsl(var(--accent)/0.3)] rounded-lg px-4 py-3 transition-all duration-300 group-hover:bg-[hsl(var(--accent)/0.35)] group-hover:border-[hsl(var(--accent)/0.45)]">
                    <span className="text-sm font-semibold tracking-wide">Conheça melhor</span>
                    <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-transparent" onClick={() => { setSelectedClient({ images: client.images, name: client.name, description: client.description, initialIndex: 0 }); setGalleryOpen(true); }} aria-label={`Abrir galeria de ${client.name}`}>
                      <ArrowRight className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Gradiente e setas com desaparecimento nas extremidades (mobile) */}
          {canLeft && (
            <div className="md:hidden absolute inset-y-0 left-0 flex items-center z-20 px-2">
              <Button variant="outline" size="icon" className="bg-background/70 backdrop-blur-sm rounded-full shadow" onClick={() => scrollByAmount("left")}> 
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
          )}
          {canRight && (
            <div className="md:hidden absolute inset-y-0 right-0 flex items-center z-20 px-2">
              <Button variant="outline" size="icon" className="bg-background/70 backdrop-blur-sm rounded-full shadow" onClick={() => scrollByAmount("right")}> 
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
          
        </div>

        {selectedClient && (
          <ImageGalleryModal
            images={selectedClient.images}
            clientName={selectedClient.name}
            description={selectedClient.description}
            initialIndex={selectedClient.initialIndex}
            isOpen={galleryOpen}
            onClose={() => setGalleryOpen(false)}
          />
        )}
      </div>
    </section>
  );
};

export default Clients;
