import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Mensagem enviada!",
      description: "Entraremos em contato em breve.",
    });
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <section id="contact" className="py-24 bg-muted/30 relative">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Entre em Contato
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Estamos prontos para transformar seu negócio com tecnologia de ponta
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-card p-6 rounded-2xl shadow-lg border border-border/50">
              <Mail className="h-8 w-8 text-accent mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Email</h3>
              <p className="text-foreground/70">contato@grupoherz.com.br</p>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-lg border border-border/50">
              <Phone className="h-8 w-8 text-accent mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Telefone</h3>
              <p className="text-foreground/70">+55 54 3281-0000</p>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-lg border border-border/50">
              <MapPin className="h-8 w-8 text-accent mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Localização</h3>
              <p className="text-foreground/70">Nova Petrópolis, RS - Brasil</p>
              <p className="text-foreground/70 text-sm mt-1">Em breve: Munique, Alemanha</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-card p-8 rounded-2xl shadow-lg space-y-6 border border-border/50">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Nome</label>
              <Input
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-background"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-background"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Telefone</label>
              <Input
                type="tel"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-background"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Mensagem</label>
              <Textarea
                placeholder="Como podemos ajudar seu negócio?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={4}
                className="bg-background resize-none"
              />
            </div>

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-background">
              <Send className="mr-2 h-4 w-4" />
              Enviar Mensagem
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
