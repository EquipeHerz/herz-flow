import { useState, useRef, useEffect } from "react";
import { Building2, Phone, Globe, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageGalleryModal } from "./ImageGalleryModal";

const Clients = () => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{ images: string[]; name: string; initialIndex: number } | null>(null);

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
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <div className={`bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group border border-border/50 relative min-w-[280px] md:min-w-0 snap-start ${index === 0 ? 'ml-5 md:ml-0' : ''}`}>
                  <div className="h-48 bg-gradient-to-br from-accent/20 to-primary/10 relative overflow-hidden">
                    <img 
                      src={withBase(client.images[0])} 
                      alt={client.name}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <Building2 className="absolute bottom-4 left-4 h-8 w-8 text-accent" />
                  </div>
                  
                  {/* Reservamos espaço inferior para o botão fixo (≈ 80px) */}
                  <div className="p-6 pb-20 space-y-4">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                      {client.name}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-foreground/70">
                      <div className="flex items-start">
                        <Globe className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-accent" />
                        <a
                          href={websiteHref(client.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:text-accent"
                          aria-label={`Abrir website de ${client.name}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {displayDomain(client.address)}
                        </a>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0 text-accent" />
                        <span>{client.phone}</span>
                      </div>
                    </div>

                    {/* Botão movido para posição fixa no rodapé */}
                  </div>
                  {/* Botão fixo 15px do rodapé do card */}
                  <div className="absolute left-[15px] right-[15px] bottom-[15px]">
                    <Button 
                      size="lg"
                      variant="default"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(client.whatsapp, '_blank');
                      }}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </DialogTrigger>
              
              <DialogContent className="max-w-[90vw] md:max-w-2xl p-0 bg-card rounded-2xl shadow-xl border border-border">
                <div className="p-5 md:p-6 max-h-[75vh] modal-scroll space-y-6">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">{client.name}</DialogTitle>
                  </DialogHeader>

                  <p className="text-base text-foreground/90">{client.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start">
                      <Globe className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-accent" />
                      <a
                        href={websiteHref(client.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 hover:text-accent"
                      >
                        {displayDomain(client.address)}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 mr-2 flex-shrink-0 text-accent" />
                      <span>{client.phone}</span>
                    </div>
                  </div>

                  <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory">
                    {client.images.map((img, idx) => (
                      <div key={idx} className="w-40 h-28 flex items-center justify-center rounded-lg border border-border/50 bg-card/30 flex-shrink-0 snap-start">
                        <img
                          src={withBase(img)}
                          alt={`${client.name} ${idx + 1}`}
                          className="max-w-full max-h-full object-contain cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            setSelectedClient({ images: client.images, name: client.name, initialIndex: idx });
                            setGalleryOpen(true);
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <Button 
                    className="w-full bg-accent hover:bg-accent/90 text-background"
                    onClick={() => window.open(client.whatsapp, '_blank')}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Falar via WhatsApp
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
