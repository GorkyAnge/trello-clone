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

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    // Validar campos vacíos o nulos y caracteres especiales
    const specialCharRegex = /[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s]/;
    if (
      !form.title.trim() ||
      !form.dueDate.trim() ||
      !form.priority.trim() ||
      !form.description.trim()
    ) {
      setError("Todos los campos son obligatorios.");
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
    const newTask = { ...form, id: nextId.toString() };
    setTasks([...tasks, newTask]);
    setForm({ title: "", description: "", priority: "media", dueDate: "" });
    setNextId(nextId + 1);
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

  return (
    <div className="trello-container">
      <h1 className="trello-title">Gestor de Tareas Tralalero</h1>
      <div className="trello-flex">
        {/* Columna de creación y búsqueda */}
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
            <button type="submit" className="trello-btn">
              Agregar
            </button>
            {error && <div className="trello-error">{error}</div>}
          </form>

          <form onSubmit={handleSearch} className="trello-search-form">
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
          <div className="trello-tasks-flex">
            {["alta", "media", "baja"].map((priority) => (
              <div key={priority} className="trello-priority-col">
                <h3 className={`trello-priority-title ${priority}`}>
                  Prioridad {priority}
                </h3>
                <ul className="trello-task-list">
                  {tasks.filter((t) => t.priority === priority).length ===
                    0 && <li className="trello-task-list-empty">Sin tareas</li>}
                  {tasks
                    .filter((t) => t.priority === priority)
                    .map((t) => (
                      <li key={t.id} className={`trello-task-card ${priority}`}>
                        <div className="trello-task-title">{t.title}</div>
                        <div className="trello-task-desc">{t.description}</div>
                        <div className="trello-task-date">
                          Vence: {t.dueDate}
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
