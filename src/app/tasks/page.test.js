import { render, screen, fireEvent } from "@testing-library/react";
import TasksPage from "./page";

describe("TasksPage", () => {
  beforeEach(() => {
    // Reset mocks if needed
  });

  it("renderiza el formulario y columnas Trello", () => {
    render(<TasksPage />);
    expect(screen.getByText(/Gestor de Tareas Tralalero/i)).toBeInTheDocument();
    expect(screen.getByText(/Crear tarea/i)).toBeInTheDocument();
    expect(screen.getByText(/Buscar tarea por ID/i)).toBeInTheDocument();
    expect(screen.getByText(/Todas las tareas/i)).toBeInTheDocument();
    expect(screen.getByText(/Prioridad alta/i)).toBeInTheDocument();
    expect(screen.getByText(/Prioridad media/i)).toBeInTheDocument();
    expect(screen.getByText(/Prioridad baja/i)).toBeInTheDocument();
  });

  it("no permite crear tarea con campos vacíos", () => {
    render(<TasksPage />);
    fireEvent.click(screen.getByText(/Agregar/i));
    expect(
      screen.getByText(/Todos los campos son obligatorios/i)
    ).toBeInTheDocument();
  });

  it("no permite caracteres especiales en título o descripción", () => {
    render(<TasksPage />);
    fireEvent.change(screen.getByPlaceholderText("Título"), {
      target: { value: "Tarea@123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Descripción"), {
      target: { value: "Desc#ripción" },
    });
    fireEvent.change(screen.getByDisplayValue("media"), {
      target: { value: "alta" },
    });
    fireEvent.change(screen.getByLabelText(/fecha/i), {
      target: { value: new Date().toISOString().split("T")[0] },
    });
    fireEvent.click(screen.getByText(/Agregar/i));
    expect(
      screen.getByText(/No se permiten caracteres especiales/i)
    ).toBeInTheDocument();
  });

  it("no permite fecha de vencimiento anterior a hoy", () => {
    render(<TasksPage />);
    fireEvent.change(screen.getByPlaceholderText("Título"), {
      target: { value: "Tarea" },
    });
    fireEvent.change(screen.getByPlaceholderText("Descripción"), {
      target: { value: "Descripcion" },
    });
    fireEvent.change(screen.getByDisplayValue("media"), {
      target: { value: "alta" },
    });
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];
    fireEvent.change(screen.getByLabelText(/fecha/i), {
      target: { value: yesterday },
    });
    fireEvent.click(screen.getByText(/Agregar/i));
    expect(
      screen.getByText(/La fecha de vencimiento no puede ser anterior a hoy/i)
    ).toBeInTheDocument();
  });

  it("crea una tarea correctamente", () => {
    render(<TasksPage />);
    fireEvent.change(screen.getByPlaceholderText("Título"), {
      target: { value: "Tarea" },
    });
    fireEvent.change(screen.getByPlaceholderText("Descripción"), {
      target: { value: "Descripcion" },
    });
    fireEvent.change(screen.getByDisplayValue("media"), {
      target: { value: "alta" },
    });
    fireEvent.change(screen.getByLabelText(/fecha/i), {
      target: { value: new Date().toISOString().split("T")[0] },
    });
    fireEvent.click(screen.getByText(/Agregar/i));
    expect(screen.getByText(/Tarea/)).toBeInTheDocument();
    expect(screen.getByText(/Descripcion/)).toBeInTheDocument();
  });

  it("busca una tarea por ID correctamente", () => {
    render(<TasksPage />);
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
    fireEvent.change(screen.getByLabelText(/fecha/i), {
      target: { value: new Date().toISOString().split("T")[0] },
    });
    fireEvent.click(screen.getByText(/Agregar/i));
    // Buscar por ID 1
    fireEvent.change(screen.getByPlaceholderText("ID de la tarea"), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByText(/Buscar/i));
    expect(screen.getByText(/Detalles de la tarea/i)).toBeInTheDocument();
    expect(screen.getByText(/ID: 1/i)).toBeInTheDocument();
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
