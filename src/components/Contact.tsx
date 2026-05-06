import { ContactInfo } from "./contact/ContactInfo";
import { ContactForm } from "./contact/ContactForm";
import MapComponent from "./MapComponent";

const Contact = () => {

  return (
    <section id="contact" className="w-full py-24 bg-muted-light/50 dark:bg-muted/30 relative">
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
          <ContactInfo />

          <ContactForm />
        </div>

        <div className="max-w-5xl mx-auto mt-12">
          <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">
            Nossa Localização
          </h3>
          <MapComponent />
        </div>
      </div>
    </section>
  );
};

export default Contact;
