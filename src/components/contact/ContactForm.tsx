import { useState, FormEvent, ChangeEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const initialFormState: FormData = {
  name: "",
  email: "",
  phone: "",
  message: ""
};

export const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>(initialFormState);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const to = "pedro.cordeiro@grupoherz.com.br";
    const cc = "junior.rodeghiero@grupoherz.com.br";
    const subject = `Contato via site - ${formData.name || "Sem nome"}`;
    const bodyLines = [
      `Nome: ${formData.name}`,
      `Email: ${formData.email}`,
      `Telefone: ${formData.phone || "(não informado)"}`,
      "",
      "Mensagem:",
      formData.message
    ];
    const body = bodyLines.join("\n");
    const mailtoUrl = `mailto:${to}?cc=${encodeURIComponent(cc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    toast({
      title: "Preparando e-mail...",
      description: "Abrimos seu cliente de e-mail com a mensagem preenchida.",
    });

    setFormData(initialFormState);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-card p-8 rounded-2xl shadow-lg space-y-6 border border-border/50"
    >
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Nome
        </label>
        <Input
          placeholder="Seu nome completo"
          value={formData.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('name', e.target.value)}
          required
          className="bg-background"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Email
        </label>
        <Input
          type="email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('email', e.target.value)}
          required
          className="bg-background"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Telefone
        </label>
        <Input
          type="tel"
          placeholder="(00) 00000-0000"
          value={formData.phone}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateField('phone', e.target.value)}
          className="bg-background"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Mensagem
        </label>
        <Textarea
          placeholder="Como podemos ajudar seu negócio?"
          value={formData.message}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateField('message', e.target.value)}
          required
          rows={4}
          className="bg-background resize-none"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
      >
        <Send className="mr-2 h-4 w-4" />
        Enviar Mensagem
      </Button>
    </form>
  );
};
