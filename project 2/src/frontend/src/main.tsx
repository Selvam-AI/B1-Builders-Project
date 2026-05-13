import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

function App() {
  return (
    <main className="app-shell">
      <section className="dashboard">
        <header className="dashboard__header">
          <div>
            <p className="eyebrow">AI-assisted social workout club</p>
            <h1>FitHub AI</h1>
          </div>
          <span className="status">Prototype scaffold</span>
        </header>

        <div className="dashboard__grid">
          <section className="panel">
            <h2>Active Slot</h2>
            <p>9:00 AM - 10:00 AM</p>
            <strong>0 / 20 members reserved</strong>
          </section>

          <section className="panel">
            <h2>Workout Broadcast</h2>
            <p>AI-selected workout video will appear here after implementation.</p>
          </section>

          <section className="panel">
            <h2>Agent Workflow</h2>
            <p>Trainer, Safety Checker, Schedule, and Admin Assistant agents are planned.</p>
          </section>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

