(() => {
  // Toda la interfaz es una simulación en memoria; recargar la página descarta sus cambios.
  const roles = [
    ["neutral", "Vista neutral"],
    ["PO", "Product Owner (PO)"],
    ["SM", "Scrum Master (SM)"],
    ["EQ", "Miembro del Equipo / Desarrollador (EQ)"],
    ["SK", "Stakeholder / Interesado (SK)"]
  ];
  const page = location.pathname.split("/").pop() || "index.html";
  const roleState = { current: "neutral" };

  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("visible"), 3200);
  }

  function makeButton(label, message, onlyRoles) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "fake-button inactive";
    button.textContent = label;
    button.dataset.toast = message;
    if (onlyRoles) button.dataset.roleOnly = onlyRoles.join(",");
    return button;
  }

  function updateRoleVisibility() {
    document.querySelectorAll("[data-role-only], .fake-button").forEach((element) => {
      const allowed = element.dataset.roleOnly?.split(",");
      const visible = roleState.current !== "SK" && (!allowed || allowed.includes(roleState.current));
      element.hidden = !visible;
      element.setAttribute("aria-hidden", String(!visible));
    });
  }

  function installGlobalShell() {
    const nav = document.querySelector('.sidebar nav[aria-label="Módulos"]');
    if (nav && !nav.querySelector('a[href="juntas.html"]')) {
      const meetings = document.createElement("a");
      meetings.href = "juntas.html";
      meetings.innerHTML = '<span class="nav-icon">◉</span> Juntas / Reuniones';
      const impediments = nav.querySelector('a[href="impedimentos.html"]');
      if (impediments) impediments.after(meetings);
      else nav.append(meetings);
    }
    const currentLink = nav && nav.querySelector(`a[href="${page}"]`);
    if (currentLink) {
      currentLink.classList.add("active");
      currentLink.setAttribute("aria-current", "page");
    }
    document.querySelectorAll('.sidebar a[href="administracion.html"]').forEach((link) => {
      link.innerHTML = '<span class="nav-icon">♙</span> Equipo y roles';
    });
    const sidebarNote = document.querySelector(".sidebar-bottom");
    if (sidebarNote) {
      sidebarNote.innerHTML = '<span class="mini-dot"></span>Versión 0.3 · Prototipo estático (solo frontend, sin persistencia). Sin servidor ni base de datos.';
    }
    const actions = document.querySelector(".topbar .top-actions");
    if (actions && !actions.querySelector(".role-switch")) {
      const label = document.createElement("label");
      label.className = "role-switch";
      label.innerHTML = '<span>Ver como:</span>';
      const select = document.createElement("select");
      select.id = "role-view";
      select.setAttribute("aria-label", "Ver como");
      roles.forEach(([value, text]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        select.append(option);
      });
      label.append(select);
      actions.prepend(label);
    }
    const roleSelect = actions && actions.querySelector("#role-view");
    if (roleSelect) {
      roleSelect.addEventListener("change", () => {
        roleState.current = roleSelect.value;
        updateRoleVisibility();
      });
    }
    if (!document.getElementById("toast")) {
      const toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      toast.setAttribute("aria-atomic", "true");
      document.body.append(toast);
    }
    document.querySelectorAll(".fake-button.inactive").forEach((button) => {
      button.setAttribute("aria-disabled", "true");
      if (button.tagName !== "BUTTON") {
        button.setAttribute("role", "button");
        button.tabIndex = 0;
      }
    });
    document.querySelectorAll(".footer").forEach((footer) => {
      const note = document.createElement("span");
      note.className = "smallnote";
      note.textContent = "Maqueta ilustrativa: los cambios se pierden al recargar.";
      footer.prepend(note);
    });
  }

  function installSprintSelector() {
    if (!["seguimiento.html", "sprints.html", "kanban.html", "tareas.html"].includes(page)) return;
    const actions = document.querySelector(".topbar .top-actions");
    if (!actions) return;
    const label = document.createElement("label");
    label.className = "role-switch sprint-switch";
    label.innerHTML = '<span>Sprint:</span>';
    const select = document.createElement("select");
    select.setAttribute("aria-label", "Seleccionar Sprint");
    ["Sprint 01", "Sprint 02", "Vista general"].forEach((value) => {
      const option = document.createElement("option");
      option.textContent = value;
      select.append(option);
    });
    label.append(select);
    actions.prepend(label);
    select.addEventListener("change", () => showToast("Cambio de vista simulado."));
  }

  function addClosedSprintNote() {
    if (!["sprints.html", "tareas.html", "kanban.html", "seguimiento.html"].includes(page)) return;
    const note = document.createElement("p");
    note.className = "section closed-sprint-note";
    note.innerHTML = '<span class="chip amber">🔒 Sprint cerrado · Solo lectura (ejemplo)</span>';
    const main = document.querySelector(".main");
    const info = main && main.querySelector(".info-box");
    if (info) info.after(note);
  }

  function showModal(title, content, onClose) {
    const dialog = document.createElement("dialog");
    dialog.className = "prototype-dialog";
    dialog.setAttribute("aria-labelledby", "dialog-title");
    dialog.innerHTML = `<div class="dialog-head"><h2 id="dialog-title">${title}</h2><button type="button" class="dialog-close" aria-label="Cerrar ventana">×</button></div><div class="dialog-content"></div>`;
    dialog.querySelector(".dialog-content").append(content);
    document.body.append(dialog);
    const closeButton = dialog.querySelector(".dialog-close");
    const close = () => {
      if (dialog.open) dialog.close();
    };
    closeButton.addEventListener("click", close);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) close();
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    dialog.addEventListener("close", () => {
      dialog.remove();
      if (onClose) onClose();
    }, { once: true });
    dialog.showModal();
    closeButton.focus();
    return dialog;
  }

  function installBacklog() {
    if (page !== "backlog.html") return;
    const cards = Array.from(document.querySelectorAll(".story"));
    const dependency = { "HU-03": "HU-01", "HU-05": "HU-03", "HU-08": "HU-05" };
    const states = ["Borrador", "Aprobada", "En Sprint", "En Sprint"];
    cards.forEach((card, index) => {
      const code = card.querySelector(".top .chip")?.textContent.trim() || `HU-${String(index + 1).padStart(2, "0")}`;
      const badges = document.createElement("div");
      badges.className = "story-status";
      const status = document.createElement("span");
      status.className = `chip ${index < 2 ? "amber" : "green"}`;
      status.textContent = states[index] || "Borrador";
      badges.append(status);
      if (dependency[code]) {
        const depends = document.createElement("span");
        depends.className = "chip blue";
        depends.textContent = `Depende de: ${dependency[code]}`;
        badges.append(depends);
      }
      card.querySelector(".top").after(badges);
      const controls = document.createElement("div");
      controls.className = "story-actions";
      controls.append(makeButton("Estimar", `Estimación simulada · En el sistema final se guardaría en la historia.`));
      controls.lastElementChild.dataset.action = "estimate";
      controls.append(makeButton("Ver ficha", "Interacción simulada · Al cerrar la ficha se reinicia."));
      controls.lastElementChild.dataset.action = "story";
      controls.append(makeButton("Aprobar", "Acción simulada", ["PO"]));
      controls.append(makeButton("Enviar a Sprint", "Acción simulada", ["SM"]));
      card.append(controls);
    });
    const heading = document.querySelector(".heading-row");
    if (heading) heading.append(makeButton("Ordenar automáticamente", "Ordenamiento simulado · En el sistema final reordenará por prioridad y dependencias."));
    document.querySelectorAll(".story h3").forEach((headingText) => {
      headingText.tabIndex = 0;
      headingText.setAttribute("role", "button");
      headingText.setAttribute("aria-label", `Ver ficha de historia: ${headingText.textContent.trim()}`);
    });
  }

  function openPoker() {
    const content = document.createElement("div");
    content.innerHTML = '<p class="smallnote">Planning poker ilustrativo. Participantes de ejemplo: Ana Ruiz, Luis Vega y Marta Solís. La selección y el promedio existen solo mientras esta ventana está abierta.</p><div class="poker-cards" role="group" aria-label="Cartas de estimación"></div><button type="button" class="fake-button" data-reveal>Revelar</button><p class="poker-result" aria-live="polite"></p>';
    const choices = content.querySelector(".poker-cards");
    [1, 2, 3, 5, 8, 13, 21].forEach((value) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "poker-card";
      button.textContent = value;
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        const selected = button.getAttribute("aria-pressed") === "true";
        button.setAttribute("aria-pressed", String(!selected));
        button.classList.toggle("selected", !selected);
      });
      choices.append(button);
    });
    content.querySelector("[data-reveal]").addEventListener("click", () => {
      const selected = Array.from(choices.querySelectorAll('[aria-pressed="true"]'), (button) => Number(button.textContent));
      content.querySelector(".poker-result").textContent = selected.length
        ? `Cartas reveladas: ${selected.join(", ")} · Promedio: ${(selected.reduce((total, value) => total + value, 0) / selected.length).toFixed(1)}`
        : "Selecciona al menos una carta para revelar la estimación.";
    });
    showModal("Planning poker", content, () => showToast("Estimación simulada · En el sistema final se guardaría en la historia."));
  }

  function openStorySheet(card) {
    const content = document.createElement("div");
    content.innerHTML = '<p class="smallnote">Interacción simulada · Al cerrar la ficha se reinicia.</p><p class="story-sheet-name"></p><div class="checklist"></div><div class="progress-track"><b></b></div><p class="checklist-progress" aria-live="polite"></p><p class="ready-state" hidden>Historia lista ✓</p>';
    content.querySelector(".story-sheet-name").textContent = card.querySelector("h3").textContent;
    const list = content.querySelector(".checklist");
    ["Describir el flujo de la historia", "Implementar los criterios de aceptación", "Revisar la interfaz"].forEach((activity) => {
      const row = document.createElement("div");
      row.className = "checklist-row";
      const activityCheck = document.createElement("input");
      activityCheck.type = "checkbox";
      activityCheck.dataset.progressCheck = "true";
      const activityLabel = document.createElement("label");
      activityLabel.className = "check-activity";
      activityCheck.setAttribute("aria-label", `Actividad: ${activity}`);
      const activityName = document.createElement("span");
      activityName.textContent = activity;
      activityLabel.append(activityCheck, activityName);
      const testName = document.createElement("span");
      testName.textContent = "Prueba realizada";
      testName.className = "test-label";
      const testCheck = document.createElement("input");
      testCheck.type = "checkbox";
      testCheck.dataset.progressCheck = "true";
      testCheck.setAttribute("aria-label", `Prueba realizada: ${activity}`);
      const testLabel = document.createElement("label");
      testLabel.className = "check-test";
      testLabel.append(testName, testCheck);
      const note = document.createElement("textarea");
      note.setAttribute("aria-label", `Nota opcional de prueba: ${activity}`);
      note.placeholder = "Nota opcional";
      row.append(activityLabel, testLabel, note);
      list.append(row);
    });
    const checks = Array.from(content.querySelectorAll("[data-progress-check]"));
    const progress = () => {
      const completed = checks.filter((check) => check.checked).length;
      const percent = (completed / checks.length) * 100;
      content.querySelector(".progress-track b").style.width = `${percent}%`;
      content.querySelector(".checklist-progress").textContent = `${completed} de ${checks.length} actividades completadas`;
      content.querySelector(".ready-state").hidden = completed !== checks.length;
    };
    checks.forEach((check) => check.addEventListener("change", progress));
    progress();
    showModal("Ficha de historia", content);
  }

  function installSprintCapacity() {
    if (page !== "sprints.html") return;
    const panel = document.createElement("section");
    panel.className = "card panel section capacity-panel";
    panel.innerHTML = '<div class="section-head"><div><h2>Esfuerzo comprometido vs Capacidad</h2><p class="section-sub">Sprint 02 · valores hardcodeados de ejemplo</p></div><span class="chip amber">34 / 28 puntos</span></div><div class="progress-track"><b style="width:100%;background:#c34444"></b></div><p class="capacity-alert">⚠ Capacidad excedida en 6 puntos</p><p class="smallnote">Panel ilustrativo; no calcula ni modifica la capacidad del equipo.</p><div class="story-actions"></div>';
    const actions = panel.querySelector(".story-actions");
    actions.append(makeButton("Iniciar Sprint", "Acción simulada · La capacidad es solo un ejemplo."));
    actions.append(makeButton("Cerrar Sprint", "Acción simulada · En el sistema final el sprint pasaría a solo lectura.", ["SM"]));
    const info = document.querySelector(".info-box");
    if (info) info.after(panel);
  }

  function installImpediments() {
    if (page !== "impedimentos.html") return;
    const articles = Array.from(document.querySelectorAll(".main article"));
    const list = articles.find((article) => article.querySelector("h2")?.textContent.includes("Impedimentos reportados"));
    const oldForm = articles.find((article) => article.querySelector("h2")?.textContent.includes("Registrar impedimento"));
    if (!list || !oldForm) return;
    list.querySelectorAll(".item-main p").forEach((description, index) => {
      description.textContent = index === 0 ? "Reportado por Equipo · Responsable: Ana Ruiz · Scrum Master" : "Atendido por Luis Vega · Product Owner";
    });
    oldForm.innerHTML = '<h2>Reportar impedimento desde tarea</h2><p class="section-sub">Selecciona una tarea no finalizada · datos de ejemplo</p><div class="mock-form"><label class="mock-label" for="blocked-task">Tarea<select class="mock-field" id="blocked-task"><option value="form">Diseñar formulario de proyecto</option><option value="criteria">Definir criterios de aceptación</option><option value="board">Maquetar Product Backlog</option></select></label><label class="mock-label">Descripción<span class="mock-field" data-task-field="description"></span></label><label class="mock-label">Responsable<span class="mock-field" data-task-field="owner"></span></label><label class="mock-label">Cargo<span class="mock-field" data-task-field="role"></span></label></div><p class="smallnote">Los campos se completan visualmente; no se registra ningún bloqueo.</p>';
    const button = makeButton("Registrar bloqueo", "Acción simulada · En el sistema final se guardaría el impedimento y se notificaría al responsable.");
    oldForm.append(button);
    const taskDetails = {
      form: ["Falta confirmar los permisos para usar el entorno de pruebas.", "Ana Ruiz", "Scrum Master"],
      criteria: ["Se requiere validación de criterios del backlog.", "Luis Vega", "Product Owner"],
      board: ["El diseño del tablero espera información del equipo.", "Marta Solís", "Miembro del Equipo"]
    };
    const select = oldForm.querySelector("#blocked-task");
    const update = () => {
      const [description, owner, role] = taskDetails[select.value];
      oldForm.querySelector('[data-task-field="description"]').textContent = description;
      oldForm.querySelector('[data-task-field="owner"]').textContent = owner;
      oldForm.querySelector('[data-task-field="role"]').textContent = role;
    };
    select.addEventListener("change", update);
    update();
  }

  function installTrackingCharts() {
    if (page !== "seguimiento.html") return;
    const panels = document.querySelectorAll(".main .cols-2 > .panel");
    const burndown = Array.from(panels).find((panel) => panel.querySelector(".burndown"));
    if (!burndown) return;
    const chartGroup = document.createElement("section");
    chartGroup.className = "card panel section line-chart-panel";
    chartGroup.innerHTML = '<div class="section-head"><div><h2>Burndown ideal vs real</h2><p class="section-sub">Tendencia visual con puntos de ejemplo</p></div><div class="chart-tabs" role="tablist"></div></div><div class="chart-view" data-chart="sprint"><h3>Sprint</h3><svg viewBox="0 0 600 220" role="img" aria-label="Gráfico ilustrativo de burndown del Sprint"><polyline class="ideal-line" points="40,30 140,65 240,100 340,135 440,170 560,200"/><polyline class="actual-line" points="40,30 140,52 240,85 340,82 440,133 560,157"/><text x="40" y="215">Día 1</text><text x="520" y="215">Día 6</text></svg></div><div class="chart-view" data-chart="project" hidden><h3>Proyecto</h3><svg viewBox="0 0 600 220" role="img" aria-label="Gráfico ilustrativo de burndown del proyecto"><polyline class="ideal-line" points="40,30 140,62 240,94 340,126 440,158 560,190"/><polyline class="actual-line" points="40,30 140,75 240,80 340,122 440,143 560,174"/><text x="40" y="215">Sprint 1</text><text x="500" y="215">Sprint 6</text></svg></div><div class="legend"><span>Ideal</span><span>Real</span></div><p class="smallnote">Gráficos ilustrativos con datos de ejemplo; no representan medición real.</p>';
    const chartTabs = chartGroup.querySelector(".chart-tabs");
    [["sprint", "Sprint actual"], ["project", "Proyecto completo"]].forEach(([id, label], index) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = `tab-button${index === 0 ? " active" : ""}`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", String(index === 0));
      tab.dataset.chartTarget = id;
      tab.textContent = label;
      chartTabs.append(tab);
    });
    burndown.after(chartGroup);
    document.querySelectorAll("[data-chart-target]").forEach((tab) => {
      tab.addEventListener("click", () => {
        chartGroup.querySelectorAll("[data-chart]").forEach((view) => {
          view.hidden = view.dataset.chart !== tab.dataset.chartTarget;
        });
        chartGroup.querySelectorAll("[data-chart-target]").forEach((item) => {
          const selected = item === tab;
          item.classList.toggle("active", selected);
          item.setAttribute("aria-selected", String(selected));
        });
      });
    });
  }

  function installTeamPage() {
    if (page !== "administracion.html") return;
    document.title = "Equipo y roles | SprintBase";
    const heading = document.querySelector("h1");
    if (heading) heading.textContent = "Equipo y roles";
    const intro = document.querySelector(".lead");
    if (intro) intro.textContent = "Miembros del equipo SCRUM y roles previstos para el prototipo.";
    document.querySelectorAll("h2").forEach((headingText) => {
      if (headingText.textContent.includes("Usuarios registrados")) headingText.textContent = "Miembros del equipo";
    });
    const tableHead = document.querySelector(".simple-table thead tr");
    if (tableHead && tableHead.cells.length === 4) {
      tableHead.cells[0].textContent = "Nombre";
      tableHead.cells[2].textContent = "Estado";
      tableHead.cells[3].textContent = "Email simulado";
    }
    const roleCount = Array.from(document.querySelectorAll(".metric .lbl")).find((item) => item.textContent.trim() === "Roles definidos");
    if (roleCount) roleCount.nextElementSibling.textContent = "04";
    const headingRow = document.querySelector(".heading-row");
    if (headingRow && !headingRow.querySelector('[data-role-only="SM"]')) {
      headingRow.append(makeButton("Agregar miembro", "Acción simulada", ["SM"]));
    }
  }

  function installLoginPage() {
    if (page !== "login.html") return;
    const rolesSection = Array.from(document.querySelectorAll(".panel")).find((panel) => panel.querySelector("h2")?.textContent.includes("Roles previstos"));
    if (rolesSection && !Array.from(rolesSection.querySelectorAll(".item-main h4")).some((item) => item.textContent.includes("Stakeholder"))) {
      const stakeholder = document.createElement("div");
      stakeholder.className = "item-row";
      stakeholder.innerHTML = '<span class="item-icon">▣</span><div class="item-main"><h4>Stakeholder / Interesado</h4><p>Consulta de información</p></div><span class="chip blue">SK · Solo lectura</span>';
      rolesSection.append(stakeholder);
    }
  }

  function installMeetingPage() {
    if (page !== "juntas.html") return;
    const controls = document.querySelectorAll("[data-toast]");
    controls.forEach((button) => button.setAttribute("aria-disabled", "true"));
    const statusText = document.querySelector(".meeting-live-status");
    if (statusText) statusText.textContent = "En el sistema final se iniciará automáticamente a la hora programada. Esta maqueta no ejecuta temporizadores.";
  }

  function installGenericFeedback() {
    document.addEventListener("click", (event) => {
      const action = event.target.closest("[data-action]");
      if (action) {
        if (action.dataset.action === "estimate") openPoker();
        if (action.dataset.action === "story") openStorySheet(action.closest(".story"));
        return;
      }
      const target = event.target.closest("[data-toast]");
      if (target) {
        event.preventDefault();
        showToast(target.dataset.toast || "Acción simulada.");
        return;
      }
      if (page === "backlog.html") {
        const storyTitle = event.target.closest(".story h3");
        if (storyTitle) openStorySheet(storyTitle.closest(".story"));
      }
    });
    document.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && event.target.matches('.fake-button.inactive[role="button"]')) {
        event.preventDefault();
        showToast(event.target.dataset.toast || "Acción simulada.");
      } else if (page === "backlog.html" && (event.key === "Enter" || event.key === " ") && event.target.matches(".story h3[role=button]")) {
        event.preventDefault();
        openStorySheet(event.target.closest(".story"));
      }
    });
  }

  installGlobalShell();
  installSprintSelector();
  addClosedSprintNote();
  installBacklog();
  installSprintCapacity();
  installImpediments();
  installTrackingCharts();
  installTeamPage();
  installLoginPage();
  installMeetingPage();
  installGenericFeedback();
  updateRoleVisibility();
})();
