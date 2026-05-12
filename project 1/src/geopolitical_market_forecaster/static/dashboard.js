const statusEl = document.getElementById("connection-status");
const alertListEl = document.getElementById("alert-list");
const alertCountEl = document.getElementById("alert-count");
const signalCountEl = document.getElementById("signal-count");
const signalsBodyEl = document.getElementById("signals-body");

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

function renderCounts(summary) {
  Object.entries(summary).forEach(([key, value]) => {
    const el = document.querySelector(`[data-count="${key}"]`);
    if (el) el.textContent = value;
  });
}

function renderAlerts(alerts) {
  alertCountEl.textContent = `${alerts.length} active`;
  if (!alerts.length) {
    alertListEl.innerHTML = '<div class="empty-alert">No medium or high severity alerts.</div>';
    return;
  }

  alertListEl.innerHTML = alerts
    .slice(0, 6)
    .map((alert) => `
      <a class="alert-item alert-${escapeHtml(alert.severity)}" href="${escapeHtml(alert.url)}" target="_blank" rel="noreferrer">
        <strong>${escapeHtml(alert.title)}</strong>
        <span>${escapeHtml(alert.source)} · ${escapeHtml(alert.signal_tier)} · ${escapeHtml(alert.confidence)}</span>
      </a>
    `)
    .join("");
}

function renderSignals(signals) {
  signalCountEl.textContent = `${signals.length} shown`;
  if (!signals.length) {
    signalsBodyEl.innerHTML = '<tr><td colspan="6" class="empty">No signals yet. Run ingestion and the pipeline to populate the dashboard.</td></tr>';
    return;
  }

  signalsBodyEl.innerHTML = signals
    .map((signal) => {
      const markets = (signal.affected_markets || [])
        .map((market) => `<span>${escapeHtml(market)}</span>`)
        .join("");
      const governance = signal.approved === null
        ? '<span class="pill pending">Pending</span>'
        : signal.approved
          ? '<span class="pill approved">Approved</span>'
          : '<span class="pill flagged">Flagged</span>';
      const date = signal.published_at ? ` · ${escapeHtml(signal.published_at.slice(0, 10))}` : "";
      const summary = signal.summary ? `<p>${escapeHtml(signal.summary)}</p>` : "";

      return `
        <tr>
          <td class="signal-title">
            <a href="${escapeHtml(signal.url)}" target="_blank" rel="noreferrer">${escapeHtml(signal.title)}</a>
            <span>${escapeHtml(signal.source)}${date}</span>
            ${summary}
          </td>
          <td><span class="pill tier-${escapeHtml(String(signal.signal_tier).toLowerCase())}">${escapeHtml(signal.signal_tier)}</span></td>
          <td><div class="tags">${markets}</div></td>
          <td class="forecast">${escapeHtml(signal.forecast)}<span>${escapeHtml(signal.time_horizon)}</span></td>
          <td><span class="pill confidence">${escapeHtml(signal.confidence)}</span></td>
          <td>${governance}</td>
        </tr>
      `;
    })
    .join("");
}

function applyPayload(payload) {
  if (payload.summary) renderCounts(payload.summary);
  if (payload.alerts) renderAlerts(payload.alerts);
  if (payload.signals) renderSignals(payload.signals);
}

async function loadSnapshot() {
  const response = await fetch("/api/dashboard");
  if (response.ok) applyPayload(await response.json());
}

function connectWebSocket() {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(`${protocol}://${window.location.host}/ws/alerts`);

  socket.addEventListener("open", () => setStatus("Realtime: connected", "connected"));
  socket.addEventListener("message", (event) => applyPayload(JSON.parse(event.data)));
  socket.addEventListener("close", () => {
    setStatus("Realtime: reconnecting", "disconnected");
    setTimeout(connectWebSocket, 3000);
  });
  socket.addEventListener("error", () => {
    setStatus("Realtime: connection issue", "disconnected");
    socket.close();
  });
}

loadSnapshot();
connectWebSocket();
