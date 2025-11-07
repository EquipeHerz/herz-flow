import { useState } from "react";
import { Building2, Phone, MapPin, MessageCircle } from "lucide-react";
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
      name: "Hotel Serra Azul",
      address: "Rua das Hortênsias, 1500 - Nova Petrópolis, RS",
      phone: "+55 54 3281-1234",
      whatsapp: "5554982811234",
      description: "Hotel boutique com foco em experiências gastronômicas e bem-estar na Serra Gaúcha. Referência em hospitalidade personalizada.",
      images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"]
    },
    {
      name: "Pousada Vale Encantado",
      address: "Linha Imperial, Km 3 - Gramado, RS",
      phone: "+55 54 3286-5678",
      whatsapp: "5554982865678",
      description: "Pousada familiar oferecendo chalés aconchegantes com vista panorâmica da serra. Ambiente tranquilo ideal para descanso.",
      images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"]
    },
    {
      name: "Turismo Aventura RS",
      address: "Av. Borges de Medeiros, 2500 - Canela, RS",
      phone: "+55 54 3282-9012",
      whatsapp: "5554982829012",
      description: "Agência especializada em turismo de aventura e ecoturismo na região da Serra Gaúcha. Experiências inesquecíveis na natureza.",
      images: ["https://images.unsplash.com/photo-1469854523086-cc02fe5d8800", "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1"]
    }
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {clients.map((client, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <div className="bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group border border-border/50">
                  <div className="h-48 bg-gradient-to-br from-accent/20 to-primary/10 relative overflow-hidden">
                    <img 
                      src={client.images[0]} 
                      alt={client.name}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <Building2 className="absolute bottom-4 left-4 h-8 w-8 text-accent" />
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                      {client.name}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-foreground/70">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-accent" />
                        <span>{client.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0 text-accent" />
                        <span>{client.phone}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-accent hover:bg-accent/90 text-background"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://wa.me/${client.whatsapp}`, '_blank');
                      }}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">{client.name}</DialogTitle>
                  <DialogDescription className="text-base pt-4 space-y-4">
                    <p>{client.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-accent" />
                        <span>{client.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 mr-2 flex-shrink-0 text-accent" />
                        <span>{client.phone}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      {client.images.map((img, idx) => (
                        <img 
                          key={idx}
                          src={img} 
                          alt={`${client.name} ${idx + 1}`}
                          className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            setSelectedClient({ images: client.images, name: client.name, initialIndex: idx });
                            setGalleryOpen(true);
                          }}
                        />
                      ))}
                    </div>

                    <Button 
                      className="w-full bg-accent hover:bg-accent/90 text-background mt-4"
                      onClick={() => window.open(`https://wa.me/${client.whatsapp}`, '_blank')}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Falar via WhatsApp
                    </Button>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          ))}
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
