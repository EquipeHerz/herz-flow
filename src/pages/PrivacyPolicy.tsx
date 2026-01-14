import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FloatingElements from "@/components/FloatingElements";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen">
      <FloatingElements />
      <Navigation />
      <main className="container mx-auto px-6 mt-12 md:mt-20 py-8 md:py-12">
        <div className="max-w-3xl mx-auto border border-primary-foreground/20 rounded-xl bg-background/60 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex justify-center">
            <Logo size="lg" className="mx-auto mb-4 md:mb-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-center">Política de Privacidade</h1>
          <p className="text-center text-sm text-muted-foreground">Última atualização: 14/01/2026</p>

          <section className="space-y-3">
            <p className="text-muted-foreground leading-relaxed text-justify">
              A sua privacidade é de suma importância para nós. Esta Política de Privacidade descreve como o Grupo Herz Tecnologia e Inovação coleta, utiliza, armazena e protege as informações pessoais dos nossos visitantes e usuários, em conformidade com a Lei Geral de Proteção de Dados (LGPD) do Brasil.
            </p>
            <p className="text-muted-foreground leading-relaxed text-justify">
              Ao utilizar nossos serviços e fornecer suas informações pessoais,{" "}
              <a
                href="https://www.jusbrasil.com.br/modelos-pecas/modelo-politica-de-privacidade/784935103"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline underline-offset-2 transition-colors"
              >
                você concorda com os termos
              </a>{" "}
              descritos nesta política.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">1. Dados Coletados</h2>
            <p className="text-muted-foreground leading-relaxed text-justify">
              Coletamos apenas os dados estritamente necessários para a finalidade específica do nosso serviço (ex: nome e e-mail para newsletter, ou informações de contato para um orçamento). Os tipos de dados que podemos coletar incluem:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Informações de contato (nome, e-mail, telefone);</li>
              <li>Dados de navegação (endereço IP, tipo de navegador, páginas visitadas);</li>
              <li>Dados fornecidos em formulários de contato.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed text-justify">
              Não coletamos intencionalmente dados sensíveis, como origem racial ou étnica, opiniões políticas ou dados de saúde.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">2. Finalidade da Coleta de Dados</h2>
            <p className="text-muted-foreground leading-relaxed text-justify">
              Utilizamos os dados coletados exclusivamente para as seguintes finalidades:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Melhorar a experiência de navegação e usabilidade do site;</li>
              <li>Responder às suas solicitações e dúvidas;</li>
              <li>Enviar comunicações (como newsletters), mediante seu consentimento expresso.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">3. Preservação e Armazenamento dos Dados</h2>
            <p className="text-muted-foreground leading-relaxed text-justify">
              Todos os dados pessoais coletados são armazenados em servidores seguros, utilizando medidas técnicas e administrativas para prevenir acessos não autorizados, perdas ou alterações.
            </p>
            <p className="text-muted-foreground leading-relaxed text-justify">
              Seus dados serão mantidos apenas pelo tempo necessário para cumprir a finalidade para a qual foram coletados, ou conforme exigido por lei.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold">4. Não Compartilhamento de Informações com Terceiros</h2>
            <p className="text-muted-foreground leading-relaxed text-justify">
              <strong className="font-semibold text-foreground">
                Comprometemo-nos a não compartilhar, vender, alugar ou divulgar quaisquer informações pessoais de nossos usuários para outras empresas, associados ou parceiros comerciais, em nenhuma hipótese.
              </strong>{" "}
              Seus dados são confidenciais e tratados com a máxima segurança e privacidade.
            </p>
            <p className="text-muted-foreground leading-relaxed text-justify">
              O compartilhamento de dados só ocorrerá se houver{" "}
              <a
                href="https://carvalhosilva.com.br/a-empresa-pode-compartilhar-meus-dados-com-terceiros/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline underline-offset-2 transition-colors"
              >
                autorização expressa do usuário
              </a>{" "}
              ou uma obrigação legal ou judicial que nos obrigue a fazê-lo, em conformidade com a LGPD.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">5. Direitos do Titular dos Dados</h2>
            <p className="text-muted-foreground leading-relaxed text-justify">
              Conforme a LGPD, você possui direitos sobre seus dados pessoais. A qualquer momento, você pode:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Confirmar a existência do tratamento e acessar seus dados;</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;</li>
              <li>Revogar o consentimento para o tratamento dos dados, se aplicável.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed text-justify">
              Para exercer seus direitos, entre em contato conosco através do e-mail: [Inserir Seu E-mail de Contato].
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">6. Alterações nesta Política de Privacidade</h2>
            <p className="text-muted-foreground leading-relaxed text-justify">
              Reservamo-nos o direito de modificar esta política a qualquer momento, especialmente para adaptá-la às{" "}
              <a
                href="https://cpccuiaba.com.br/wp-content/uploads/2024/08/Politica-de-Seguranca-e-Privacidade-Protecao-de-dados-LGPD-pdf.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline underline-offset-2 transition-colors"
              >
                novas legislações ou mudanças em nossos serviços
              </a>
              . Recomendamos que você a revise periodicamente.
            </p>
          </section>

          <div className="pt-4 md:pt-6 flex justify-center">
            <Button
              size="lg"
              aria-label="Aceitar política de privacidade"
              className="min-w-[140px] h-11 md:h-12 px-6 active:scale-[0.98] transition-transform duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("privacy-accepted"));
                navigate("/");
              }}
            >
              Aceitar
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
