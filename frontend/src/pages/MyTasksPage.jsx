import { useMemo, useState } from "react";

import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import FlagIcon from "@mui/icons-material/Flag";
import PersonIcon from "@mui/icons-material/Person";
import ForumIcon from "@mui/icons-material/Forum";
import AttachFileIcon from "@mui/icons-material/AttachFile";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const initialTasks = [
  {
    id: "task-1",
    title: "Diseñar pantalla de login",
    description: "Crear una interfaz limpia para iniciar sesión en NexusFlow.",
    board: "Rediseño de sitio web",
    status: "Pendiente",
    priority: "Alta",
    assignedTo: "Ian",
    dueDate: "Hoy",
    progress: 20,
    comments: 3,
    files: 1,
  },
  {
    id: "task-2",
    title: "Crear Auth Service",
    description: "Microservicio para registro, login, JWT y roles.",
    board: "API de tareas",
    status: "En proceso",
    priority: "Alta",
    assignedTo: "Ian",
    dueDate: "Mañana",
    progress: 55,
    comments: 5,
    files: 0,
  },
  {
    id: "task-3",
    title: "Preparar MongoDB Atlas",
    description: "Crear cluster, usuario, base de datos y string de conexión.",
    board: "Backend",
    status: "Hecho",
    priority: "Media",
    assignedTo: "Ian",
    dueDate: "Viernes",
    progress: 100,
    comments: 2,
    files: 2,
  },
  {
    id: "task-4",
    title: "Diseñar vista Kanban",
    description: "Crear columnas Pendiente, En proceso y Hecho con drag and drop.",
    board: "Frontend",
    status: "En proceso",
    priority: "Media",
    assignedTo: "Ian",
    dueDate: "Viernes",
    progress: 65,
    comments: 1,
    files: 0,
  },
  {
    id: "task-5",
    title: "Documentar arquitectura",
    description: "Explicar SPA, API Gateway, microservicios, MongoDB, Redis y WebSockets.",
    board: "Documentación técnica",
    status: "Pendiente",
    priority: "Baja",
    assignedTo: "Ian",
    dueDate: "Próxima semana",
    progress: 10,
    comments: 0,
    files: 0,
  },
];

function getStatusColor(status) {
  if (status === "Hecho") return "success";
  if (status === "En proceso") return "primary";
  return "warning";
}

function getPriorityColor(priority) {
  if (priority === "Alta") return "error";
  if (priority === "Media") return "warning";
  return "success";
}

function getProgressColor(status) {
  if (status === "Hecho") return "success";
  if (status === "En proceso") return "primary";
  return "warning";
}

export function MyTasksPage() {
  const [tasks] = useState(initialTasks);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [priorityFilter, setPriorityFilter] = useState("Todas");
  const [selectedTask, setSelectedTask] = useState(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const text = `${task.title} ${task.description} ${task.board}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "Todos" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "Todas" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((task) => task.status === "Pendiente").length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "En proceso"
  ).length;
  const doneTasks = tasks.filter((task) => task.status === "Hecho").length;

  const stats = [
    {
      title: "Total",
      value: totalTasks,
      color: "primary",
    },
    {
      title: "Pendientes",
      value: pendingTasks,
      color: "warning",
    },
    {
      title: "En proceso",
      value: inProgressTasks,
      color: "primary",
    },
    {
      title: "Hechas",
      value: doneTasks,
      color: "success",
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Mis tareas
          </Typography>

          <Typography color="text.secondary">
            Consulta tus tareas asignadas, prioridades y fechas límite.
          </Typography>
        </Box>

        <Button variant="contained" size="large">
          Nueva tarea
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                {stat.title}
              </Typography>

              <Typography variant="h4" sx={{ mt: 0.5 }}>
                {stat.value}
              </Typography>

              <Chip
                label={stat.title}
                color={stat.color}
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 220px 220px",
            },
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            fullWidth
            placeholder="Buscar tarea, tablero o descripción..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth>
            <InputLabel>Estado</InputLabel>
            <Select
              label="Estado"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <MenuItem value="Todos">Todos</MenuItem>
              <MenuItem value="Pendiente">Pendiente</MenuItem>
              <MenuItem value="En proceso">En proceso</MenuItem>
              <MenuItem value="Hecho">Hecho</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Prioridad</InputLabel>
            <Select
              label="Prioridad"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
            >
              <MenuItem value="Todas">Todas</MenuItem>
              <MenuItem value="Alta">Alta</MenuItem>
              <MenuItem value="Media">Media</MenuItem>
              <MenuItem value="Baja">Baja</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        {filteredTasks.map((task) => (
          <Card
            key={task.id}
            sx={{
              transition: "0.2s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 18px 45px rgba(15, 23, 42, 0.14)",
              },
            }}
          >
            <CardContent
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1fr auto",
                },
                gap: 2,
                alignItems: "center",
              }}
            >
              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ mb: 1 }}
                >
                  <Chip
                    icon={<ViewKanbanIcon />}
                    label={task.board}
                    size="small"
                    variant="outlined"
                  />

                  <Chip
                    label={task.status}
                    color={getStatusColor(task.status)}
                    size="small"
                  />

                  <Chip
                    label={task.priority}
                    color={getPriorityColor(task.priority)}
                    size="small"
                  />
                </Stack>

                <Typography variant="h6" sx={{ mb: 0.5 }}>
                  {task.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {task.description}
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(3, auto)",
                    },
                    gap: 1.5,
                    alignItems: "center",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarMonthIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {task.dueDate}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {task.assignedTo}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <ForumIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {task.comments} comentarios
                    </Typography>
                  </Stack>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={task.progress}
                    color={getProgressColor(task.status)}
                    sx={{
                      height: 8,
                      borderRadius: 99,
                    }}
                  />

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.8, display: "block" }}
                  >
                    {task.progress}% de avance
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "row", md: "column" },
                  justifyContent: { xs: "space-between", md: "center" },
                  alignItems: { xs: "center", md: "flex-end" },
                  gap: 1.5,
                }}
              >
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  {task.assignedTo[0]}
                </Avatar>

                <Stack direction="row" spacing={1}>
                  <Chip
                    icon={<AttachFileIcon />}
                    label={task.files}
                    size="small"
                    variant="outlined"
                  />

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setSelectedTask(task)}
                  >
                    Ver detalle
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {filteredTasks.length === 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h6">No se encontraron tareas</Typography>
            <Typography color="text.secondary">
              Intenta cambiar los filtros o la búsqueda.
            </Typography>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        fullWidth
        maxWidth="sm"
      >
        {selectedTask && (
          <>
            <DialogTitle>{selectedTask.title}</DialogTitle>

            <DialogContent>
              <Stack spacing={2}>
                <Typography color="text.secondary">
                  {selectedTask.description}
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    label={selectedTask.status}
                    color={getStatusColor(selectedTask.status)}
                  />

                  <Chip
                    label={selectedTask.priority}
                    color={getPriorityColor(selectedTask.priority)}
                  />

                  <Chip label={`Tablero: ${selectedTask.board}`} />

                  <Chip label={`Vence: ${selectedTask.dueDate}`} />
                </Stack>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    bgcolor: "#f8fafc",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Typography fontWeight={800} sx={{ mb: 1 }}>
                    Información de actividad
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Esta tarea tiene {selectedTask.comments} comentarios y{" "}
                    {selectedTask.files} archivos adjuntos. Más adelante esta
                    información vendrá desde MongoDB y se actualizará en tiempo
                    real.
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setSelectedTask(null)}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}