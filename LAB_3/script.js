const TOTAL_SPACES = 60;
const parkingMap = document.getElementById("parkingMap");
const activityList = document.getElementById("activityList");
const logs = [];
let spaces = [];
let simulationRunning = true;
let simulationTimer = null;

function randomStatus() {
  return Math.random() < 0.58 ? "occupied" : "available";
}

function initializeSpaces() {
  spaces = Array.from({ length: TOTAL_SPACES }, (_, index) => ({
    id: `A${String(index + 1).padStart(2, "0")}`,
    status: randomStatus()
  }));
  renderMap();
  updateDashboard();
  addLog("Sistema iniciado", "Se generaron estados aleatorios para los 60 sensores.", "green");
}

function renderMap() {
  parkingMap.innerHTML = "";
  // Cinco filas de 12 espacios: distribución esquemática inspirada en el estacionamiento real.
  for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
    const row = document.createElement("div");
    row.className = "parking-row";
    spaces.slice(rowIndex * 12, rowIndex * 12 + 12).forEach(space => {
      const button = document.createElement("button");
      button.className = `space ${space.status === "occupied" ? "occupied" : ""}`;
      button.type = "button";
      button.setAttribute("aria-label", `Espacio ${space.id}: ${space.status === "occupied" ? "ocupado" : "disponible"}. Clic para cambiar estado.`);
      button.title = `${space.id} · ${space.status === "occupied" ? "Ocupado" : "Disponible"}`;
      button.innerHTML = `<span class="car-symbol">${space.status === "occupied" ? "▰" : "P"}</span><span class="space-id">${space.id}</span>`;
      button.addEventListener("click", () => toggleSpace(space.id));
      row.appendChild(button);
    });
    parkingMap.appendChild(row);
    if (rowIndex < 4) {
      const aisle = document.createElement("div");
      aisle.className = "aisle";
      aisle.textContent = "↔  PASILLO DE CIRCULACIÓN  ↔";
      parkingMap.appendChild(aisle);
    }
  }
}

function updateDashboard() {
  const occupied = spaces.filter(space => space.status === "occupied").length;
  const available = TOTAL_SPACES - occupied;
  const percentage = Math.round((occupied / TOTAL_SPACES) * 100);
  document.getElementById("totalCount").textContent = TOTAL_SPACES;
  document.getElementById("occupiedCount").textContent = occupied;
  document.getElementById("availableCount").textContent = available;
  document.getElementById("occupancyPercent").textContent = percentage;
  document.getElementById("occupancyBar").style.width = `${percentage}%`;
  document.getElementById("lastUpdate").textContent = `Última actualización: ${new Date().toLocaleTimeString("es-MX")}`;
}

function addLog(title, detail, type) {
  logs.unshift({ title, detail, type, time: new Date().toLocaleTimeString("es-MX") });
  if (logs.length > 5) logs.pop();
  activityList.innerHTML = "";
  logs.forEach(log => {
    const item = document.createElement("div");
    item.className = "log-item";
    item.innerHTML = `<span class="log-marker ${log.type}"></span><div><div class="log-text"><strong>${log.title}</strong><br>${log.detail}</div><div class="log-time">${log.time}</div></div>`;
    activityList.appendChild(item);
  });
  document.getElementById("logCount").textContent = `${logs.length} ${logs.length === 1 ? "evento" : "eventos"}`;
}

function toggleSpace(id) {
  const space = spaces.find(item => item.id === id);
  if (!space) return;
  space.status = space.status === "occupied" ? "available" : "occupied";
  const occupied = space.status === "occupied";
  renderMap();
  updateDashboard();
  addLog(`${id}: ${occupied ? "Vehículo detectado" : "Vehículo salió"}`,
    `Cambio manual de estado · Sensor virtual ${id}.`, occupied ? "red" : "green");
}

function simulateSensorChange() {
  const changes = Math.random() < 0.18 ? 2 : 1;
  for (let i = 0; i < changes; i++) {
    const index = Math.floor(Math.random() * spaces.length);
    const space = spaces[index];
    space.status = space.status === "occupied" ? "available" : "occupied";
    const occupied = space.status === "occupied";
    addLog(`${space.id}: ${occupied ? "Vehículo detectado" : "Espacio liberado"}`,
      `Actualización automática del sensor virtual ${space.id}.`, occupied ? "red" : "green");
  }
  renderMap();
  updateDashboard();
}

function startSimulation() {
  clearInterval(simulationTimer);
  const interval = Number(document.getElementById("intervalSelect").value);
  simulationTimer = setInterval(simulateSensorChange, interval);
  simulationRunning = true;
  updateSimulationControls();
}

function stopSimulation() {
  clearInterval(simulationTimer);
  simulationTimer = null;
  simulationRunning = false;
  updateSimulationControls();
}

function updateSimulationControls() {
  document.getElementById("simulationState").textContent = simulationRunning ? "ACTIVA" : "PAUSADA";
  document.getElementById("simulationState").className = `chip ${simulationRunning ? "active-chip" : "paused-chip"}`;
  document.getElementById("toggleIcon").textContent = simulationRunning ? "Ⅱ" : "▶";
  document.getElementById("toggleText").textContent = simulationRunning ? "Pausar simulación" : "Reanudar simulación";
  document.getElementById("connectionText").textContent = simulationRunning ? "Simulación activa" : "Simulación pausada";
}

document.getElementById("toggleSimulation").addEventListener("click", () => {
  simulationRunning ? stopSimulation() : startSimulation();
});

document.getElementById("randomizeButton").addEventListener("click", () => {
  spaces.forEach(space => { space.status = randomStatus(); });
  renderMap();
  updateDashboard();
  addLog("Datos reiniciados", "Se asignaron nuevos estados aleatorios a los 60 espacios.", "green");
});

document.getElementById("intervalSelect").addEventListener("change", () => {
  if (simulationRunning) startSimulation();
});

function updateClock() {
  document.getElementById("clock").textContent = new Date().toLocaleTimeString("es-MX");
}

initializeSpaces();
startSimulation();
updateClock();
setInterval(updateClock, 1000);
