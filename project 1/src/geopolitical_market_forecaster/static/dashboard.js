const statusEl = document.getElementById("connection-status");
const decisionBoardEl = document.getElementById("decision-board");

function setStatus(text, className) {
  statusEl.textContent = text;
  statusEl.className = className;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderSectorDecisions(decisions) {
  if (!decisionBoardEl || !decisions) return;
  decisionBoardEl.innerHTML = decisions.map(renderDecision).join("");
}

function renderDecision(decision) {
  const companies = (decision.candidates || []).map(renderCompany).join("");
  const workflow = (decision.agent_steps || []).map(renderWorkflowStep).join("");
  const evidence = (decision.evidence || []).length
    ? (decision.evidence || []).map(renderEvidence).join("")
    : "<p>No matching evidence yet. Run ingestion and pipeline refresh.</p>";
  const decisionClass = escapeHtml(String(decision.decision).trim().toLowerCase());

  return `
    <article class="decision-card decision-${decisionClass} sector-${escapeHtml(decision.theme)}">
      <div class="decision-main">
        <div class="company-row">${companies}</div>

        <div class="decision-summary">
          <div class="decision-word decision-word-${decisionClass}">${escapeHtml(decision.decision)}</div>
          <div class="decision-copy">
            <h3>${escapeHtml(decision.category)}</h3>
            <p>${escapeHtml(decision.inference)}</p>
            <div class="confidence-wrap">
              <span>Confidence</span>
              <strong>${escapeHtml(decision.confidence)} (${escapeHtml(decision.confidence_score)}/100)</strong>
              <div class="confidence-track">
                <div class="confidence-fill" style="--confidence-score: ${escapeHtml(decision.confidence_score)}"></div>
              </div>
            </div>
          </div>
        </div>

        <section class="workflow">
          <h4>Agent Workflow</h4>
          <div class="workflow-steps">${workflow}</div>
        </section>
      </div>

      <aside class="evidence-card">
        <h4>Evidence Links</h4>
        <div class="evidence-list">${evidence}</div>
      </aside>
    </article>
  `;
}

function renderCompany(candidate, index) {
  return `
    <div class="company-chip ${index === 0 ? "primary-company" : ""}">
      <span>${index === 0 ? "Primary Entity" : "Associated Exposure"}</span>
      <strong>${escapeHtml(candidate)}</strong>
    </div>
  `;
}

function renderWorkflowStep(step, index) {
  return `
    <div class="workflow-step">
      <span>${index + 1}</span>
      <strong>${escapeHtml(step.agent)}</strong>
      <p>${escapeHtml(step.action)}</p>
    </div>
  `;
}

function renderEvidence(item) {
  return `
    <a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.source)} · ${escapeHtml(item.signal_tier)} · ${escapeHtml(item.confidence)}</span>
    </a>
  `;
}

function applyPayload(payload) {
  if (payload.sector_decisions) renderSectorDecisions(payload.sector_decisions);
}

async function loadSnapshot() {
  const response = await fetch("/api/dashboard");
  if (response.ok) applyPayload(await response.json());
}

function connectWebSocket() {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(`${protocol}://${window.location.host}/ws/alerts`);

  socket.addEventListener("open", () => setStatus("Connected", "connected"));
  socket.addEventListener("message", (event) => applyPayload(JSON.parse(event.data)));
  socket.addEventListener("close", () => {
    setStatus("Reconnecting", "disconnected");
    setTimeout(connectWebSocket, 3000);
  });
  socket.addEventListener("error", () => {
    setStatus("Connection issue", "disconnected");
    socket.close();
  });
}

loadSnapshot();
connectWebSocket();
