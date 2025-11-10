/**
 * ContactForm Component
 * 
 * Formulário de contato com validação e feedback via toast.
 * Coleta nome, email, telefone e mensagem do usuário.
 * 
 * @component
 * @example
 * <ContactForm />
 */

import { useState, FormEvent, ChangeEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

/**
 * Interface para os dados do formulário
 */
interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

/**
 * Estado inicial vazio do formulário
 */
const initialFormState: FormData = {
  name: "",
  email: "",
  phone: "",
  message: ""
};

export const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>(initialFormState);

  /**
   * Atualiza um campo específico do formulário
   * @param field - Nome do campo a ser atualizado
   * @param value - Novo valor do campo
   */
  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Manipula o envio do formulário
   * Exibe toast de sucesso e reseta o formulário
   * @param e - Evento de submissão do formulário
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Exibe notificação de sucesso
    toast({
      title: "Mensagem enviada!",
      description: "Entraremos em contato em breve.",
    });
    
    // Reseta o formulário para o estado inicial
    setFormData(initialFormState);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-card p-8 rounded-2xl shadow-lg space-y-6 border border-border/50"
    >
      {/* Campo de Nome */}
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

      {/* Campo de Email */}
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

      {/* Campo de Telefone */}
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

      {/* Campo de Mensagem */}
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

      {/* Botão de Envio */}
      <Button 
        type="submit" 
        className="w-full bg-accent hover:bg-accent/90 text-background"
      >
        <Send className="mr-2 h-4 w-4" />
        Enviar Mensagem
      </Button>
    </form>
  );
};
