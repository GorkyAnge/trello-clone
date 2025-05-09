"use client";
import { useState } from "react";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "media",
    dueDate: "",
  });
  const [searchId, setSearchId] = useState("");
  const [foundTask, setFoundTask] = useState(null);
  const [error, setError] = useState("");
  const [nextId, setNextId] = useState(1);

  // Estado para proyectos
  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState({ name: "", prefix: "" });
  const [projectError, setProjectError] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [projectTaskCounters, setProjectTaskCounters] = useState({});

  // Estado para filtro de prioridad
  const [priorityFilter, setPriorityFilter] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Genera un prefijo sugerido a partir del nombre
  const suggestPrefix = (name) => {
    if (!name) return "";
    const words = name.trim().split(/\s+/);
    let prefix = words.map((w) => w[0].toUpperCase()).join("");
    let originalPrefix = prefix;
    let i = 1;
    // Asegura que el prefijo no se repita
    while (projects.some((p) => p.prefix === prefix)) {
      prefix = originalPrefix + i;
      i++;
    }
    return prefix;
  };

  const handleProjectNameChange = (e) => {
    const name = e.target.value;
    setProjectForm({ name, prefix: suggestPrefix(name) });
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!projectForm.name.trim()) {
      setProjectError("El nombre del proyecto es obligatorio.");
      return;
    }
    if (projects.some((p) => p.prefix === projectForm.prefix)) {
      setProjectError("El prefijo sugerido ya existe, elige otro nombre.");
      return;
    }
    setProjects([
      ...projects,
      { name: projectForm.name.trim(), prefix: projectForm.prefix },
    ]);
    setProjectForm({ name: "", prefix: "" });
    setProjectError("");
  };

  // Modificar handleAddTask para usar el proyecto seleccionado y generar el ID correcto
  const handleAddTask = (e) => {
    e.preventDefault();
    const specialCharRegex = /[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s]/;
    if (
      !form.title.trim() ||
      !form.dueDate.trim() ||
      !form.priority.trim() ||
      !form.description.trim() ||
      !selectedProject
    ) {
      setError("Todos los campos son obligatorios, incluyendo el proyecto.");
      return;
    }
    if (
      specialCharRegex.test(form.title) ||
      specialCharRegex.test(form.description)
    ) {
      setError(
        "No se permiten caracteres especiales en el título o la descripción."
      );
      return;
    }
    if (form.dueDate < today) {
      setError("La fecha de vencimiento no puede ser anterior a hoy.");
      return;
    }
    // Generar ID de tarea tipo PREFIJO + número incremental con 3 dígitos
    const prefix = projects.find((p) => p.name === selectedProject)?.prefix;
    const nextTaskNum = projectTaskCounters[prefix] || 1;
    const taskId = `${prefix}${nextTaskNum.toString().padStart(3, "0")}`;
    setTasks([...tasks, { ...form, id: taskId, project: selectedProject }]);
    setForm({ title: "", description: "", priority: "media", dueDate: "" });
    setProjectTaskCounters({
      ...projectTaskCounters,
      [prefix]: nextTaskNum + 1,
    });
    setError("");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const task = tasks.find((t) => t.id === searchId);
    if (!task) {
      setFoundTask(null);
      setError("No existe una tarea con ese ID.");
      return;
    }
    setFoundTask(task);
    setError("");
  };

  // Función para obtener tareas próximas a vencer (hoy, mañana, pasado mañana)
  const getUpcomingTasks = () => {
    const todayDate = new Date(today);
    return tasks
      .filter((t) => {
        const due = new Date(t.dueDate);
        const diff = Math.floor((due - todayDate) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 2;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  const upcomingTasks = getUpcomingTasks();

  return (
    <div className="trello-main-layout">
      <div className="trello-container">
        <h1 className="trello-title">Gestor de Tareas Tralalero</h1>
        {/* Formulario de creación de proyecto al inicio */}
        <form
          onSubmit={handleAddProject}
          className="trello-form"
          style={{ marginBottom: 24 }}
        >
          <h2 className="trello-form-title">Crear proyecto</h2>
          <input
            name="projectName"
            placeholder="Nombre del proyecto"
            value={projectForm.name}
            onChange={handleProjectNameChange}
            className="trello-input"
          />
          <input
            name="projectPrefix"
            placeholder="Prefijo sugerido"
            value={projectForm.prefix}
            readOnly
            className="trello-input"
          />
          <button type="submit" className="trello-btn">
            Agregar proyecto
          </button>
          {projectError && <div className="trello-error">{projectError}</div>}
        </form>
        {/* Formulario de búsqueda ocupa todo el ancho */}
        <form
          onSubmit={handleSearch}
          className="trello-search-form"
          style={{ marginBottom: 24 }}
        >
          <h2 className="trello-search-title">Buscar tarea por ID</h2>
          <div className="trello-search-row">
            <input
              placeholder="ID de la tarea"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="trello-input"
            />
            <button type="submit" className="trello-search-btn">
              Buscar
            </button>
          </div>
        </form>
        <div className="trello-flex">
          {/* Columna de creación */}
          <div className="trello-form-col">
            <form onSubmit={handleAddTask} className="trello-form">
              <h2 className="trello-form-title">Crear tarea</h2>
              <input
                name="title"
                placeholder="Título"
                value={form.title}
                onChange={handleChange}
                className="trello-input"
              />
              <textarea
                name="description"
                placeholder="Descripción"
                value={form.description}
                onChange={handleChange}
                className="trello-textarea"
              />
              <div className="trello-form-row">
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="trello-select"
                >
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
                <input
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange}
                  className="trello-date"
                  min={today}
                />
              </div>
              <select
                name="project"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="trello-select"
              >
                <option value="">Selecciona un proyecto</option>
                {projects.map((p) => (
                  <option key={p.prefix} value={p.name}>
                    {p.name} ({p.prefix})
                  </option>
                ))}
              </select>
              <button type="submit" className="trello-btn">
                Agregar
              </button>
              {error && <div className="trello-error">{error}</div>}
            </form>
            {/* Mostrar detalles de la tarea encontrada solo aquí */}
            {foundTask && (
              <div className="trello-task-details">
                <h3 className="trello-task-details-title">
                  Detalles de la tarea
                </h3>
                <p>
                  <b>ID:</b> {foundTask.id}
                </p>
                <p>
                  <b>Título:</b> {foundTask.title}
                </p>
                <p>
                  <b>Descripción:</b> {foundTask.description}
                </p>
                <p>
                  <b>Prioridad:</b> {foundTask.priority}
                </p>
                <p>
                  <b>Fecha de vencimiento:</b> {foundTask.dueDate}
                </p>
              </div>
            )}
          </div>
          {/* Columna de tareas tipo Trello */}
          <div className="trello-tasks-col">
            <h2 className="trello-tasks-title">Todas las tareas</h2>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 24,
              }}
            >
              <button
                type="button"
                className="trello-btn"
                style={{
                  background: priorityFilter === "" ? "#0079bf" : "#e4e6ea",
                  color: priorityFilter === "" ? "#fff" : "#222",
                  border:
                    priorityFilter === ""
                      ? "2px solid #0079bf"
                      : "2px solid #e4e6ea",
                }}
                onClick={() => setPriorityFilter("")}
              >
                Todas
              </button>
              <button
                type="button"
                className="trello-btn"
                style={{
                  background: priorityFilter === "alta" ? "#b04632" : "#ffeaea",
                  color: priorityFilter === "alta" ? "#fff" : "#b04632",
                  border:
                    priorityFilter === "alta"
                      ? "2px solid #b04632"
                      : "2px solid #ffeaea",
                }}
                onClick={() => setPriorityFilter("alta")}
              >
                Alta
              </button>
              <button
                type="button"
                className="trello-btn"
                style={{
                  background:
                    priorityFilter === "media" ? "#ffab00" : "#fffbe6",
                  color: priorityFilter === "media" ? "#222" : "#b8860b",
                  border:
                    priorityFilter === "media"
                      ? "2px solid #ffab00"
                      : "2px solid #fffbe6",
                }}
                onClick={() => setPriorityFilter("media")}
              >
                Media
              </button>
              <button
                type="button"
                className="trello-btn"
                style={{
                  background: priorityFilter === "baja" ? "#5aac44" : "#eafbe7",
                  color: priorityFilter === "baja" ? "#fff" : "#357a38",
                  border:
                    priorityFilter === "baja"
                      ? "2px solid #5aac44"
                      : "2px solid #eafbe7",
                }}
                onClick={() => setPriorityFilter("baja")}
              >
                Baja
              </button>
            </div>
            <div className="trello-tasks-flex">
              {["alta", "media", "baja"]
                .filter(
                  (priority) => !priorityFilter || priority === priorityFilter
                )
                .map((priority) => (
                  <div key={priority} className="trello-priority-col">
                    <h3 className={`trello-priority-title ${priority}`}>
                      Prioridad {priority}
                    </h3>
                    <ul className="trello-task-list">
                      {tasks.filter((t) => t.priority === priority).length ===
                        0 && (
                        <li className="trello-task-list-empty">Sin tareas</li>
                      )}
                      {tasks
                        .filter((t) => t.priority === priority)
                        .sort((a, b) =>
                          a.title.localeCompare(b.title, "es", {
                            sensitivity: "base",
                          })
                        )
                        .map((t) => (
                          <li
                            key={t.id}
                            className={`trello-task-card ${priority}`}
                          >
                            <div className="trello-task-title">{t.title}</div>
                            <div className="trello-task-desc">
                              {t.description}
                            </div>
                            <div className="trello-task-date">
                              Vence: {t.dueDate}
                            </div>
                            <div className="trello-task-id">ID: {t.id}</div>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      {/* Módulo de tareas próximas a vencer a un lado */}
      {upcomingTasks.length > 0 && (
        <div className="trello-upcoming-side">
          <div
            className="trello-form"
            style={{ background: "#fff8e1", border: "1px solid #ffe082" }}
          >
            <h2 className="trello-form-title" style={{ color: "#b04632" }}>
              Tareas próximas a vencer
            </h2>
            <ul className="trello-task-list">
              {upcomingTasks.map((t) => {
                const due = new Date(t.dueDate);
                const todayDate = new Date(today);
                const diff = Math.floor(
                  (due - todayDate) / (1000 * 60 * 60 * 24)
                );
                return (
                  <li
                    key={t.id}
                    className={`trello-task-card ${t.priority}`}
                    style={{ position: "relative" }}
                  >
                    {diff === 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          color: "#b04632",
                          fontWeight: "bold",
                          fontSize: 22,
                        }}
                        title="¡Vence mañana!"
                      >
                        &#10071;
                      </span>
                    )}
                    <div className="trello-task-title">{t.title}</div>
                    <div className="trello-task-desc">{t.description}</div>
                    <div className="trello-task-date">Vence: {t.dueDate}</div>
                    <div className="trello-task-id">ID: {t.id}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
