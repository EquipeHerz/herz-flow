import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Bot, MessageCircle, Zap, Users } from 'lucide-react';
import { ChatTypingBubble } from './ChatTypingBubble';
 

const InteractiveChatbotDemo = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Dados dos balões de chat com layout estilo imagem (5 balões principais)
  const chatBubblesData = [
    { id: 'maior-alcance', text: 'Maior alcance de marca', angle: -60, distance: 140 },
    { id: 'atendimento-escalavel', text: 'Atendimento altamente escalável', angle: -120, distance: 150 },
    { id: 'automacao-servicos', text: 'Automação de serviços', angle: 180, distance: 140 },
    { id: 'melhor-experiencia', text: 'Melhor experiência de atendimento e suporte', angle: 60, distance: 160 },
    { id: 'disponibilidade', text: 'Disponibilidade além do horário comercial', angle: 120, distance: 150 }
  ];

  

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const contentSections = [
    {
      id: 'definicao',
      title: 'O que é um Chatbot?',
      icon: <Bot className="w-6 h-6" />,
      content: 'Um chatbot é um programa de computador que simula conversas humanas através de inteligência artificial. Ele pode interagir com usuários via texto ou voz, fornecendo respostas automáticas e inteligentes.',
      details: 'Os chatbots modernos utilizam processamento de linguagem natural (NLP) e machine learning para compreender contexto, intenção e fornecer respostas cada vez mais precisas e personalizadas para qualquer setor.'
    },
    {
      id: 'funcionalidades',
      title: 'Funcionalidades para Todos os Setores',
      icon: <Zap className="w-6 h-6" />,
      content: 'Atendimento 24/7, respostas instantâneas, processamento de múltiplas conversas simultaneamente e integração com sistemas empresariais de diversos segmentos.',
      details: 'Funciona para empresas de tecnologia, varejo, saúde, educação, financeiro, turismo e muitos outros. Inclui análise de sentimentos, aprendizado contínuo e personalização de respostas.'
    },
    {
      id: 'beneficios',
      title: 'Benefícios para Qualquer Empresa',
      icon: <MessageCircle className="w-6 h-6" />,
      content: 'Redução de custos operacionais, aumento da satisfação do cliente, escalabilidade ilimitada e disponibilidade constante - independente do tamanho ou setor da sua empresa.',
      details: 'Startups, pequenas, médias e grandes empresas de qualquer segmento podem se beneficiar. Melhoram eficiência em até 80% e reduzem tempo de resposta de horas para segundos.'
    },
    {
      id: 'casos',
      title: 'Exemplos por Setor',
      icon: <Users className="w-6 h-6" />,
      content: 'Saúde: agendamentos e triagem. Educação: suporte a alunos. Corporativo: RH e financeiro. Varejo: vendas e suporte. Tecnologia: suporte técnico e onboarding.',
      details: 'Cada setor tem casos específicos: escolas usam para matrículas, hospitais para consultas, empresas para RH, lojas para vendas, startups para suporte técnico e muito mais.'
    }
  ];

  
  const bubbleDefs = [
    { id: 'tb-top-left', angle: -152, r: 1.0, size: 'medium' as const, tail: 'right' as const, variant: 'accent' as const, movement: 'animate-float' },
    { id: 'tb-upper-left', angle: -118, r: 0.9, size: 'small' as const, tail: 'right' as const, variant: 'primary' as const, movement: 'animate-float-delayed' },
    { id: 'tb-top-right', angle: -36, r: 0.88, size: 'medium' as const, tail: 'left' as const, variant: 'secondary' as const, movement: 'animate-float' },
    { id: 'tb-upper-right', angle: -16, r: 0.80, size: 'small' as const, tail: 'left' as const, variant: 'accent' as const, movement: 'animate-float-delayed' },
    { id: 'tb-right', angle: 16, r: 0.84, size: 'large' as const, tail: 'left' as const, variant: 'primary' as const, movement: 'animate-pulse-slow' },
    { id: 'tb-bottom-right', angle: 66, r: 0.76, size: 'small' as const, tail: 'left' as const, variant: 'secondary' as const, movement: 'animate-float' },
    { id: 'tb-bottom-left', angle: 202, r: 0.92, size: 'medium' as const, tail: 'right' as const, variant: 'accent' as const, movement: 'animate-float-delayed' },
    { id: 'tb-left', angle: 178, r: 0.97, size: 'medium' as const, tail: 'right' as const, variant: 'primary' as const, movement: 'animate-pulse-slow' },
    { id: 'tb-top', angle: -90, r: 0.96, size: 'medium' as const, tail: 'bottom' as const, variant: 'primary' as const, movement: 'animate-float' },
    { id: 'tb-mid-right-2', angle: 30, r: 0.88, size: 'medium' as const, tail: 'left' as const, variant: 'accent' as const, movement: 'animate-pulse-slow' },
    { id: 'tb-bottom-right-2', angle: 80, r: 0.74, size: 'small' as const, tail: 'left' as const, variant: 'primary' as const, movement: 'animate-float' },
    { id: 'tb-bottom-left-2', angle: 230, r: 0.86, size: 'medium' as const, tail: 'right' as const, variant: 'secondary' as const, movement: 'animate-float-delayed' },
    { id: 'tb-left-2', angle: 160, r: 0.94, size: 'small' as const, tail: 'right' as const, variant: 'accent' as const, movement: 'animate-pulse-slow' }
  ];

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [computedBubbles, setComputedBubbles] = useState<Array<{id:string; pos:{x:number;y:number}; size:'small'|'medium'|'large'; tail:'top'|'bottom'|'left'|'right'; variant:'accent'|'primary'|'secondary'|'muted'; movement:string}>>([]);
  const [zaiaReady, setZaiaReady] = useState(false);
  const zaiaAnchorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const recalc = () => setComputedBubbles(computePositions(wrapperRef.current, bubbleDefs));
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

  useEffect(() => {
    (window as any).__initZaiaWidget = () => {
      if ((window as any).__zaiaLoaded) return;
      const url = 'https://platform.zaia.app/embed/chat/68980?custom=' + encodeURIComponent(JSON.stringify({ name: 'Jonas', role: 'Guia Turístico e Concierge' }));
      (window as any).ZWidget = { AgentURL: url };
      const anchor = zaiaAnchorRef.current || document.body;
      let cont = document.getElementById('chatbot-container');
      if (!cont) {
        cont = document.createElement('div');
        cont.id = 'chatbot-container';
        anchor.appendChild(cont);
      }
      if (!cont.querySelector('iframe')) {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.title = 'Chat Zaia - Jonas';
        cont.appendChild(iframe);
      }
      cont.classList.add('chatbot-container-closed');
      setZaiaReady(true);
      (window as any).__zaiaLoaded = true;
      if (!(window as any).toggleChatbot) {
        (window as any).toggleChatbot = () => {
          const c = document.getElementById('chatbot-container');
          if (!c) return;
          c.classList.toggle('chatbot-container-closed');
        };
      }
      const handleDocClick = (e: MouseEvent) => {
        const c = document.getElementById('chatbot-container');
        if (!c) return;
        const isOpen = !c.classList.contains('chatbot-container-closed');
        if (!isOpen) return;
        const target = e.target as Node;
        const launcher = document.getElementById('jonas-launcher');
        const clickedInLauncher = launcher ? launcher.contains(target) : false;
        if (target && !c.contains(target) && !clickedInLauncher) {
          c.classList.add('chatbot-container-closed');
        }
      };
      document.addEventListener('click', handleDocClick);
      (window as any).__zaiaCleanup = () => document.removeEventListener('click', handleDocClick);
      if ((window as any).__zaiaRequestedOpen) {
        (window as any).__zaiaRequestedOpen = false;
        (window as any).toggleChatbot();
      }
    };
    return () => {
      (window as any).__zaiaCleanup?.();
    };
  }, []);

  const calcPos = (angle: number, distance: number) => {
    const r = (angle * Math.PI) / 180;
    return { x: Math.cos(r) * distance, y: Math.sin(r) * distance };
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-background to-muted relative overflow-hidden" id="chatbot-demo">
      {/* Elementos flutuantes decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-accent/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-primary/10 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 left-5 w-12 h-12 bg-secondary/20 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-[8%] right-[18%] w-10 h-10 bg-accent/10 rounded-full animate-float"></div>
        <div className="absolute top-[22%] left-[15%] w-14 h-14 bg-primary/10 rounded-full animate-float-delayed"></div>
        <div className="absolute top-[30%] right-[8%] w-24 h-24 bg-secondary/20 rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[18%] left-[12%] w-8 h-8 bg-accent/10 rounded-full animate-float"></div>
        <div className="absolute bottom-[25%] right-[22%] w-12 h-12 bg-primary/10 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-[8%] left-[30%] w-20 h-20 bg-secondary/20 rounded-full animate-pulse-slow"></div>
        <div className="absolute top-[12%] left-[45%] w-6 h-6 bg-accent/10 rounded-full animate-float"></div>
        <div className="absolute top-[40%] left-[60%] w-16 h-16 bg-primary/10 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-[12%] right-[35%] w-10 h-10 bg-secondary/20 rounded-full animate-pulse-slow"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Título da seção */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Soluções para <span className="text-accent">Todos os Setores</span>
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            De startups a grandes corporações, descubra como os chatbots inteligentes revolucionam a comunicação empresarial em qualquer setor
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Coluna do Robô */}
          <div className="flex flex-col items-center">
            {/* Robô Animado */}
            <div className="relative mb-8" ref={wrapperRef}>
              <div className="robot-container animate-bounce bg-white dark:bg-gray-50 rounded-full p-4 md:p-6 shadow-xl border-2 border-gray-100 dark:border-gray-200 w-64 h-64 md:w-80 md:h-80 flex items-center justify-center relative">
                <svg
                  width="240"
                  height="240"
                  viewBox="0 0 200 200"
                  className="w-56 h-56 md:w-64 md:h-64 robot-svg"
                  aria-label="Robô Animado - Mascote do Chatbot"
                >
                  {/* Corpo do robô */}
                  <rect x="60" y="80" width="80" height="60" rx="15" fill="hsl(var(--accent))" className="robot-body" />
                  
                  {/* Cabeça do robô */}
                  <rect x="70" y="40" width="60" height="50" rx="20" fill="hsl(var(--primary))" className="robot-head" />
                  
                  {/* Olhos que piscam */}
                  <circle cx="85" cy="60" r="6" fill="white" className="robot-eye robot-eye-left" />
                  <circle cx="115" cy="60" r="6" fill="white" className="robot-eye robot-eye-right" />
                  
                  {/* Pupilas */}
                  <circle cx="87" cy="62" r="3" fill="hsl(var(--primary-foreground))" className="robot-pupil robot-pupil-left" />
                  <circle cx="117" cy="62" r="3" fill="hsl(var(--primary-foreground))" className="robot-pupil robot-pupil-right" />
                  
                  {/* Antenas */}
                  <line x1="80" y1="40" x2="80" y2="25" stroke="hsl(var(--accent))" strokeWidth="3" className="robot-antenna" />
                  <line x1="120" y1="40" x2="120" y2="25" stroke="hsl(var(--accent))" strokeWidth="3" className="robot-antenna" />
                  <circle cx="80" cy="22" r="4" fill="hsl(var(--accent))" className="robot-antenna-tip" />
                  <circle cx="120" cy="22" r="4" fill="hsl(var(--accent))" className="robot-antenna-tip" />
                  
                  {/* Braços */}
                  <rect x="45" y="90" width="15" height="40" rx="7" fill="hsl(var(--secondary))" className="robot-arm robot-arm-left" />
                  <rect x="140" y="90" width="15" height="40" rx="7" fill="hsl(var(--secondary))" className="robot-arm robot-arm-right" />
                  
                  {/* Mãos */}
                  <circle cx="52" cy="135" r="8" fill="hsl(var(--accent))" className="robot-hand robot-hand-left" />
                  <circle cx="148" cy="135" r="8" fill="hsl(var(--accent))" className="robot-hand robot-hand-right" />
              </svg>
              </div>
              {(computedBubbles.length ? computedBubbles : []).map(tb => (
                <ChatTypingBubble
                  key={tb.id}
                  text=""
                  position={tb.pos}
                  isActive={true}
                  size={tb.size}
                  arrowDirection={tb.tail}
                  typingOnly={true}
                  typingDuration={1400}
                  variant={tb.variant}
                  movementClass={tb.movement}
                />
              ))}
          </div>

          <div className="text-center max-w-md mt-4">
            <div className="inline-flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3 shadow-sm">
              <span className="text-sm text-card-foreground/80">Ele aprende com cada conversa.</span>
              <span className="text-sm text-accent font-semibold">Quer ver como te entende?</span>
            </div>
          </div>
          
        </div>

          {/* Coluna dos conteúdos explicativos */}
          <div className="space-y-4">
            {contentSections.map((section, index) => (
              <article
                key={section.id}
                className={`bg-card rounded-lg border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-accent/30 group ${
                  expandedCard === section.id ? 'shadow-lg border-accent/30' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                role="article"
                aria-labelledby={`title-${section.id}`}
              >
                <button
                  onClick={() => toggleCard(section.id)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-accent/5 transition-colors duration-200"
                  aria-expanded={expandedCard === section.id}
                  aria-controls={`content-${section.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg bg-accent/10 text-accent transition-all duration-300 group-hover:bg-accent/20 ${
                      expandedCard === section.id ? 'bg-accent/20' : ''
                    }`}>
                      {section.icon}
                    </div>
                    <h4 id={`title-${section.id}`} className="font-semibold text-foreground">
                      {section.title}
                    </h4>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-foreground/50 transition-transform duration-300 ${
                      expandedCard === section.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  id={`content-${section.id}`}
                  className={`px-6 pb-6 transition-all duration-300 ${
                    expandedCard === section.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                  }`}
                  role="region"
                >
                  <div className="space-y-4">
                    <p className="text-foreground/80 leading-relaxed">
                      {section.content}
                    </p>
                    {expandedCard === section.id && (
                      <div className="bg-accent/5 rounded-lg p-4 border-l-4 border-accent animate-fade-in-up">
                        <p className="text-foreground/90 text-sm leading-relaxed">
                          <strong className="text-accent">Detalhes:</strong> {section.details}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-accent text-accent-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-accent/90 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
          >
            Transforme Seu Negócio com IA
          </button>
        </div>
      </div>

      {/* Estilos CSS para animações do robô e balões */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blink {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0; }
        }

        @keyframes pulse-robot {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        @keyframes float-robot {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-4px) rotate(1deg); }
          50% { transform: translateY(-2px) rotate(-0.5deg); }
          75% { transform: translateY(-6px) rotate(0.5deg); }
        }

        @keyframes float-bubble-subtle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }

        .chat-bubble-float { animation: float-bubble-subtle 7s ease-in-out infinite; }

        

        .robot-eye { animation: blink 3s infinite; }
        .robot-container { animation: float-robot 6s ease-in-out infinite; }
        .robot-antenna-tip { animation: pulse 1.5s ease-in-out infinite; }
        
        #chatbot-fab { display: none !important; }
        #chatbot-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 380px;
          height: 600px;
          z-index: 1000;
        }
        #chatbot-container.chatbot-container-closed { display: none; }
        #chatbot-container iframe {
          width: 100%;
          height: 600px;
          border: none;
          background: hsl(var(--background));
          border-radius: 16px;
        }

        

        @media (prefers-reduced-motion: reduce) {
          .robot-eye { animation: none; }
          .robot-container { animation: none; }
          .robot-antenna-tip { animation: none; }
          .chat-bubble-float { animation: none; }
          
        }
      `}} />
    </section>
  );
};

function computePositions(el: HTMLElement | null, defs: typeof bubbleDefs) {
  if (!el) return [] as Array<{id:string; pos:{x:number;y:number}; size:'small'|'medium'|'large'; tail:'top'|'bottom'|'left'|'right'}>;
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const base = Math.max(w, h) / 2 + 40;
  return defs.map(d => {
    const dist = base * d.r;
    const r = (d.angle * Math.PI) / 180;
    const pos = { x: Math.cos(r) * dist, y: Math.sin(r) * dist };
    return { id: d.id, pos, size: d.size, tail: d.tail, variant: d.variant, movement: d.movement };
  });
}

export default InteractiveChatbotDemo;
