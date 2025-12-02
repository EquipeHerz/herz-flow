import { Link } from "react-router-dom";
import { Instagram, Mail, MessageCircle, MapPin } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-5">
            <Logo size="lg" className="text-primary-foreground" />
            <p className="text-sm opacity-80">
              Automação de IA para Empresas
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Navegação</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/#services" className="opacity-80 hover:opacity-100 transition-opacity">Serviços</a></li>
              <li><a href="/#clients" className="opacity-80 hover:opacity-100 transition-opacity">Clientes</a></li>
              <li><a href="/#contact" className="opacity-80 hover:opacity-100 transition-opacity">Contato</a></li>
              <li><Link to="/login" className="opacity-80 hover:opacity-100 transition-opacity">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Serviços</h3>
            <ul className="space-y-2 text-sm">
              <li className="opacity-80">Chatbots Inteligentes</li>
              <li className="opacity-80">Totens de Autoatendimento</li>
              <li className="opacity-80">Painéis de LED</li>
              <li className="opacity-80">Soluções Personalizadas</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <ul className="space-y-4 text-sm">
              <li className="opacity-80 inline-flex items-center gap-2">
                <MapPin size={16} />
                <span>Nova Petrópolis, RS</span>
              </li>
              <li className="space-y-1">
                <p className="text-primary-foreground font-bold text-base md:text-lg">Junior</p>
                <p className="opacity-80">
                  <a
                    href="mailto:junior.rodeghiero@grupoherz.com.br"
                    className="inline-flex items-center gap-2 hover:opacity-100 transition-opacity"
                    aria-label="Enviar e-mail para Junior"
                  >
                    <Mail size={16} />
                    <span>junior.rodeghiero@grupoherz.com.br</span>
                  </a>
                </p>
                <p className="opacity-80">
                  <a
                    href="https://wa.me/5554999699949"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:opacity-100 transition-opacity"
                    aria-label="Abrir WhatsApp para +55 54 99969 9949"
                  >
                    <MessageCircle size={16} />
                    <span>+55 54 99969 9949</span>
                  </a>
                </p>
              </li>
              <li className="space-y-1">
                <p className="text-primary-foreground font-bold text-base md:text-lg">Pedro</p>
                <p className="opacity-80 inline-flex items-center gap-2">
                  <Mail size={16} />
                  <span>pedro.cordeiro@grupoherz.com.br</span>
                </p>
                
                <p className="opacity-80">
                  <a
                    href="https://wa.me/5554998833682"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:opacity-100 transition-opacity"
                    aria-label="Abrir WhatsApp para +55 54 99883 3682"
                  >
                    <MessageCircle size={16} />
                    <span>+55 54 99883 3682</span>
                  </a>
                </p>
              </li>
            </ul>
            <div className="flex mt-4">
              <a
                href="https://www.instagram.com/grupo.herz?igsh=YjAyZThxNjMzbWFi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram do Grupo Herz"
                className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-accent hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-transform duration-300 hover:scale-105"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm opacity-80">
          <p>&copy; 2025 Grupo Herz. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
