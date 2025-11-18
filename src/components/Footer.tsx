import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Mail } from "lucide-react";
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
            <ul className="space-y-2 text-sm">
              <li className="opacity-80">Nova Petrópolis, RS</li>
              <li className="opacity-80">+55 54 3281-0000</li>
              <li className="opacity-80">contato@grupoherz.com.br</li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                <Facebook size={20} />
              </a>
              <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                <Instagram size={20} />
              </a>
              <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                <Linkedin size={20} />
              </a>
              <a href="#" className="opacity-80 hover:opacity-100 transition-opacity">
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm opacity-80">
          <p>&copy; 2024 Grupo Herz. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
