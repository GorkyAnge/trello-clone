import { render, screen, fireEvent } from "@testing-library/react";
import TasksPage from "./page";

describe("TasksPage", () => {
  beforeEach(() => {
    // Reset mocks if needed
  });

  it("renderiza el formulario, columnas Trello y panel lateral de próximas tareas", () => {
    render(<TasksPage />);
    expect(screen.getByText(/Gestor de Tareas Tralalero/i)).toBeInTheDocument();
    expect(screen.getByText(/Crear tarea/i)).toBeInTheDocument();
    expect(screen.getByText(/Buscar tarea por ID/i)).toBeInTheDocument();
    expect(screen.getByText(/Todas las tareas/i)).toBeInTheDocument();
    expect(screen.getByText(/Prioridad alta/i)).toBeInTheDocument();
    expect(screen.getByText(/Prioridad media/i)).toBeInTheDocument();
    expect(screen.getByText(/Prioridad baja/i)).toBeInTheDocument();
    // El panel lateral de próximas tareas no aparece si no hay tareas
    expect(
      screen.queryByText(/Tareas próximas a vencer/i)
    ).not.toBeInTheDocument();
  });

  it("muestra el panel lateral de próximas tareas cuando hay tareas próximas", () => {
    render(<TasksPage />);
    // Crear proyecto
    fireEvent.change(screen.getByPlaceholderText("Nombre del proyecto"), {
      target: { value: "Proyecto Demo" },
    });
    fireEvent.click(screen.getByText(/Agregar proyecto/i));
    // Crear tarea próxima (hoy)
    fireEvent.change(screen.getByPlaceholderText("Título"), {
      target: { value: "Tarea Próxima" },
    });
    fireEvent.change(screen.getByPlaceholderText("Descripción"), {
      target: { value: "Descripción próxima" },
    });
    fireEvent.change(screen.getByDisplayValue("media"), {
      target: { value: "alta" },
    });
    fireEvent.change(screen.getByDisplayValue("Selecciona un proyecto"), {
      target: { value: "Proyecto Demo" },
    });
    fireEvent.change(screen.getByLabelText(/fecha/i), {
      target: { value: new Date().toISOString().split("T")[0] },
    });
    fireEvent.click(screen.getByText(/^Agregar$/i));
    // Ahora debe aparecer el panel lateral
    expect(screen.getByText(/Tareas próximas a vencer/i)).toBeInTheDocument();
    expect(screen.getByText(/Tarea Próxima/i)).toBeInTheDocument();
  });

  it("no permite crear tarea con campos vacíos", () => {
    render(<TasksPage />);
    fireEvent.click(screen.getByText(/^Agregar$/i));
    expect(
      screen.getByText(/Todos los campos son obligatorios/i)
    ).toBeInTheDocument();
  });

  it("no permite caracteres especiales en título o descripción", () => {
    render(<TasksPage />);
    // Crear proyecto
    fireEvent.change(screen.getByPlaceholderText("Nombre del proyecto"), {
      target: { value: "Demo" },
    });
    fireEvent.click(screen.getByText(/Agregar proyecto/i));
    // Llenar campos con caracteres especiales
    fireEvent.change(screen.getByPlaceholderText("Título"), {
      target: { value: "Tarea@123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Descripción"), {
      target: { value: "Desc#ripción" },
    });
    fireEvent.change(screen.getByDisplayValue("media"), {
      target: { value: "alta" },
    });
    fireEvent.change(screen.getByDisplayValue("Selecciona un proyecto"), {
      target: { value: "Demo" },
    });
    fireEvent.change(screen.getByLabelText(/fecha/i), {
      target: { value: new Date().toISOString().split("T")[0] },
    });
    fireEvent.click(screen.getByText(/^Agregar$/i));
    expect(
      screen.getByText(/No se permiten caracteres especiales/i)
    ).toBeInTheDocument();
  });

  it("no permite fecha de vencimiento anterior a hoy", () => {
    render(<TasksPage />);
    // Crear proyecto
    fireEvent.change(screen.getByPlaceholderText("Nombre del proyecto"), {
      target: { value: "Demo" },
    });
    fireEvent.click(screen.getByText(/Agregar proyecto/i));
    // Llenar campos
    fireEvent.change(screen.getByPlaceholderText("Título"), {
      target: { value: "Tarea" },
    });
    fireEvent.change(screen.getByPlaceholderText("Descripción"), {
      target: { value: "Descripcion" },
    });
    fireEvent.change(screen.getByDisplayValue("media"), {
      target: { value: "alta" },
    });
    fireEvent.change(screen.getByDisplayValue("Selecciona un proyecto"), {
      target: { value: "Demo" },
    });
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];
    fireEvent.change(screen.getByLabelText(/fecha/i), {
      target: { value: yesterday },
    });
    fireEvent.click(screen.getByText(/^Agregar$/i));
    expect(
      screen.getByText(/La fecha de vencimiento no puede ser anterior a hoy/i)
    ).toBeInTheDocument();
  });

  it("crea una tarea correctamente", () => {
    render(<TasksPage />);
    // Crear proyecto
    fireEvent.change(screen.getByPlaceholderText("Nombre del proyecto"), {
      target: { value: "Demo" },
    });
    fireEvent.click(screen.getByText(/Agregar proyecto/i));
    // Llenar campos
    fireEvent.change(screen.getByPlaceholderText("Título"), {
      target: { value: "Tarea" },
    });
    fireEvent.change(screen.getByPlaceholderText("Descripción"), {
      target: { value: "Descripcion" },
    });
    fireEvent.change(screen.getByDisplayValue("media"), {
      target: { value: "alta" },
    });
    fireEvent.change(screen.getByDisplayValue("Selecciona un proyecto"), {
      target: { value: "Demo" },
    });
    fireEvent.change(screen.getByLabelText(/fecha/i), {
      target: { value: new Date().toISOString().split("T")[0] },
    });
    fireEvent.click(screen.getByText(/^Agregar$/i));
    expect(screen.getByText(/Tarea/)).toBeInTheDocument();
    expect(screen.getByText(/Descripcion/)).toBeInTheDocument();
  });

  it("busca una tarea por ID correctamente", () => {
    render(<TasksPage />);
    // Crear proyecto
    fireEvent.change(screen.getByPlaceholderText("Nombre del proyecto"), {
      target: { value: "Demo" },
    });
    fireEvent.click(screen.getByText(/Agregar proyecto/i));
    // Crear tarea
    fireEvent.change(screen.getByPlaceholderText("Título"), {
      target: { value: "Tarea" },
    });
    fireEvent.change(screen.getByPlaceholderText("Descripción"), {
      target: { value: "Descripcion" },
    });
    fireEvent.change(screen.getByDisplayValue("media"), {
      target: { value: "alta" },
    });
    fireEvent.change(screen.getByDisplayValue("Selecciona un proyecto"), {
      target: { value: "Demo" },
    });
    fireEvent.change(screen.getByLabelText(/fecha/i), {
      target: { value: new Date().toISOString().split("T")[0] },
    });
    fireEvent.click(screen.getByText(/^Agregar$/i));
    // Buscar por ID correcto
    fireEvent.change(screen.getByPlaceholderText("ID de la tarea"), {
      target: { value: "DEMO001" },
    });
    fireEvent.click(screen.getByText(/Buscar/i));
    expect(screen.getByText(/Detalles de la tarea/i)).toBeInTheDocument();
    expect(screen.getByText(/ID: DEMO001/i)).toBeInTheDocument();
  });

  it("muestra error si el ID no existe", () => {
    render(<TasksPage />);
    fireEvent.change(screen.getByPlaceholderText("ID de la tarea"), {
      target: { value: "999" },
    });
    fireEvent.click(screen.getByText(/Buscar/i));
    expect(
      screen.getByText(/No existe una tarea con ese ID/i)
    ).toBeInTheDocument();
  });
});
