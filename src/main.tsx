import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";

// Temporary Simple App to test rendering
// const SimpleApp = () => (
//   <div style={{ padding: 50, background: '#e6fffa', color: '#047857', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
//     <h1 style={{ fontSize: 32, marginBottom: 20 }}>✅ O React (Main) foi iniciado com sucesso!</h1>
//     <p style={{ fontSize: 18 }}>Se você vê esta mensagem, o problema NÃO é na inicialização do projeto.</p>
//     <p>O problema está em algum import do <strong>App.tsx</strong> original.</p>
//   </div>
// );

console.log("Main.tsx executando...");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Elemento root não encontrado!");
  document.body.innerHTML = "<h1>Erro Fatal: Elemento root não encontrado</h1>";
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    console.log("React renderizado com sucesso.");
  } catch (error) {
    console.error("Erro ao renderizar React:", error);
    rootElement.innerHTML = `<h1>Erro ao iniciar React: ${error}</h1>`;
  }
}
