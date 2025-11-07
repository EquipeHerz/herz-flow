import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Clients from "@/components/Clients";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingElements from "@/components/FloatingElements";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <FloatingElements />
      <Navigation />
      <Hero />
      <About />
      <Services />
      <Clients />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
