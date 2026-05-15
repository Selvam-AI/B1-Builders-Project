const statusEl = document.getElementById("connection-status");
const decisionBoardEl = document.getElementById("decision-board");

function setStatus(text, className) {
  statusEl.textContent = text;
  statusEl.className = `connection-status ${className}`;
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
  const companyCards = (decision.candidates || [])
    .map((candidate, index) => `
      <div class="company-card ${index === 0 ? "card-primary" : "card-secondary"}">
        <span class="card-label">${index === 0 ? "Primary Entity" : "Associated Exposure"}</span>
        <h2 class="company-name">${escapeHtml(candidate)}</h2>
      </div>
    `)
    .join("");
  const agents = (decision.agent_steps || []).map(renderAgent).join("");
  const evidence = (decision.evidence || []).length
    ? (decision.evidence || []).map(renderEvidence).join("")
    : "<p>No current matching news signal. Run ingestion and the pipeline to refresh.</p>";

  return `
    <section class="insight-layout insight-${escapeHtml(decision.theme)}" aria-label="${escapeHtml(decision.category)}">
      <div class="insight-main">
        <div class="company-display-section">${companyCards}</div>

        <section class="focus-panel">
          <div class="focus-grid">
            <div class="status-block">
              <span>Market Decision</span>
              <strong class="decision-status status-${escapeHtml(String(decision.decision).toLowerCase())}">${escapeHtml(decision.decision)}</strong>
            </div>
            <div class="confidence-block">
              <div class="confidence-line">
                <span>Confidence Score</span>
                <strong>${escapeHtml(decision.confidence)} (${escapeHtml(decision.confidence_score)}/100)</strong>
              </div>
              <div class="gauge" style="--score: ${escapeHtml(decision.confidence_score)}">
                <div class="needle"></div>
              </div>
            </div>
          </div>
        </section>

        <section class="workflow-panel">
          <div class="workflow-title">Analysis: Agent Workflow</div>
          <div class="agent-grid">${agents}</div>
        </section>
      </div>

      <aside class="insight-side">
        <section class="evidence-panel">
          <div class="panel-title">Evidence & Source Intelligence</div>
          <div class="evidence-list">${evidence}</div>
        </section>
        <section class="overview-panel">
          <div class="panel-title">Sector Overview</div>
          <div class="mini-map">
            <div class="tile primary">${escapeHtml(String(decision.category).replace(" Exposure", ""))}</div>
            <div class="tile muted"></div>
            <div class="tile soft"></div>
            <div class="tile risk"></div>
            <div class="tile muted wide"></div>
            <div class="tile soft"></div>
            <div class="tile risk small"></div>
            <div class="tile soft wide"></div>
          </div>
        </section>
      </aside>
    </section>
  `;
}

function renderAgent(step, index) {
  const visualNumber = index + 1;
  return `
    <article class="agent-card">
      <div class="agent-head">
        <span class="agent-symbol symbol-${visualNumber}"></span>
        <strong>${escapeHtml(step.agent)}</strong>
      </div>
      <p>${escapeHtml(step.action)}</p>
      <div class="agent-visual visual-${visualNumber}"></div>
    </article>
  `;
}

function renderEvidence(item) {
  return `
    <a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.source)} · ${escapeHtml(item.signal_tier)} · ${escapeHtml(item.confidence)}</span>
      <small>Source link</small>
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

  socket.addEventListener("open", () => setStatus("Status: connected", "connected"));
  socket.addEventListener("message", (event) => applyPayload(JSON.parse(event.data)));
  socket.addEventListener("close", () => {
    setStatus("Status: reconnecting", "disconnected");
    setTimeout(connectWebSocket, 3000);
  });
  socket.addEventListener("error", () => {
    setStatus("Status: connection issue", "disconnected");
    socket.close();
  });
}

loadSnapshot();
connectWebSocket();
