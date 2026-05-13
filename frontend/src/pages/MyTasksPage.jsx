import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import LowPriorityIcon from "@mui/icons-material/LowPriority";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import { getBoards } from "../services/boardService.js";
import { getTasksByBoard } from "../services/taskService.js";

function getStatusLabel(status) {
  if (status === "pending") return "Pendiente";
  if (status === "in_progress") return "En proceso";
  if (status === "done") return "Hecho";
  return status || "Sin estado";
}

function getStatusColor(status) {
  if (status === "done") return "success";
  if (status === "in_progress") return "primary";
  return "warning";
}

function getPriorityColor(priority) {
  if (priority === "Alta") return "error";
  if (priority === "Media") return "warning";
  if (priority === "Baja") return "success";
  return "default";
}

function getStatusIcon(status) {
  if (status === "done") return <CheckCircleIcon />;
  if (status === "in_progress") return <HourglassBottomIcon />;
  return <PendingActionsIcon />;
}

function getInitials(name = "", email = "") {
  const base = name || email || "U";

  return base
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(dateString) {
  if (!dateString) return "Sin fecha";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function MyTasksPage() {
  const navigate = useNavigate();

  const [boards, setBoards] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [priorityFilter, setPriorityFilter] = useState("Todas");
  const [boardFilter, setBoardFilter] = useState("Todos");

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const boardsResponse = await getBoards();
      const loadedBoards = boardsResponse.boards || [];

      setBoards(loadedBoards);

      const taskResponses = await Promise.all(
        loadedBoards.map(async (board) => {
          try {
            const tasksResponse = await getTasksByBoard(board._id);

            return (tasksResponse.tasks || []).map((task) => ({
              ...task,
              boardName: board.name,
              boardArea: board.area,
              boardStatus: board.status,
              boardId: board._id,
            }));
          } catch {
            return [];
          }
        })
      );

      const allTasks = taskResponses.flat();

      setTasks(allTasks);
    } catch (error) {
      setError(error.message || "No se pudieron cargar las tareas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((task) => task.status === "pending").length;
    const inProgress = tasks.filter(
      (task) => task.status === "in_progress"
    ).length;
    const done = tasks.filter((task) => task.status === "done").length;
    const highPriority = tasks.filter((task) => task.priority === "Alta").length;

    const progress = total === 0 ? 0 : Math.round((done / total) * 100);

    return {
      total,
      pending,
      inProgress,
      done,
      highPriority,
      progress,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const text = `
        ${task.title}
        ${task.description}
        ${task.priority}
        ${task.status}
        ${task.boardName}
        ${task.boardArea}
        ${task.assignedTo?.name}
        ${task.assignedTo?.email}
      `.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "Todos" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "Todas" || task.priority === priorityFilter;

      const matchesBoard =
        boardFilter === "Todos" || task.boardId === boardFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesBoard;
    });
  }, [tasks, search, statusFilter, priorityFilter, boardFilter]);

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
            Vista general de tareas reales tomadas desde tus tableros.
          </Typography>
        </Box>

        <Tooltip title="Actualizar tareas">
          <span>
            <IconButton onClick={loadTasks} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(5, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TaskAltIcon color="primary" />

              <Box>
                <Typography color="text.secondary">Total</Typography>
                <Typography variant="h4">{stats.total}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PendingActionsIcon color="warning" />

              <Box>
                <Typography color="text.secondary">Pendientes</Typography>
                <Typography variant="h4">{stats.pending}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <HourglassBottomIcon color="primary" />

              <Box>
                <Typography color="text.secondary">En proceso</Typography>
                <Typography variant="h4">{stats.inProgress}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CheckCircleIcon color="success" />

              <Box>
                <Typography color="text.secondary">Hechas</Typography>
                <Typography variant="h4">{stats.done}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <LowPriorityIcon color="error" />

              <Box>
                <Typography color="text.secondary">Alta prioridad</Typography>
                <Typography variant="h4">{stats.highPriority}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Typography fontWeight={900}>Progreso general</Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Calculado con base en tareas marcadas como hechas.
            </Typography>

            <LinearProgress
              variant="determinate"
              value={stats.progress}
              sx={(theme) => ({
                height: 12,
                borderRadius: 99,
                bgcolor: alpha(theme.palette.primary.main, 0.14),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 99,
                },
              })}
            />

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {stats.progress}% completado
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1.4fr repeat(3, 220px)",
              },
              gap: 2,
              alignItems: "center",
            }}
          >
            <TextField
              fullWidth
              placeholder="Buscar tarea, tablero, responsable..."
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
                <MenuItem value="pending">Pendiente</MenuItem>
                <MenuItem value="in_progress">En proceso</MenuItem>
                <MenuItem value="done">Hecho</MenuItem>
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

            <FormControl fullWidth>
              <InputLabel>Tablero</InputLabel>

              <Select
                label="Tablero"
                value={boardFilter}
                onChange={(event) => setBoardFilter(event.target.value)}
              >
                <MenuItem value="Todos">Todos</MenuItem>

                {boards.map((board) => (
                  <MenuItem key={board._id} value={board._id}>
                    {board.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 7 }}>
            <CircularProgress sx={{ mb: 2 }} />

            <Typography variant="h6">Cargando tareas...</Typography>

            <Typography color="text.secondary">
              Consultando tus tableros y tareas reales.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "repeat(2, 1fr)",
              },
              gap: 2.5,
            }}
          >
            {filteredTasks.map((task) => (
              <Card
                key={task._id}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "0.2s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.14)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        icon={getStatusIcon(task.status)}
                        label={getStatusLabel(task.status)}
                        color={getStatusColor(task.status)}
                        size="small"
                      />

                      <Chip
                        label={task.priority || "Media"}
                        color={getPriorityColor(task.priority)}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>

                    <Avatar sx={{ bgcolor: "primary.main", fontWeight: 900 }}>
                      {getInitials(task.assignedTo?.name, task.assignedTo?.email)}
                    </Avatar>
                  </Box>

                  <Typography variant="h6" sx={{ mb: 0.7 }}>
                    {task.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      minHeight: 42,
                    }}
                  >
                    {task.description || "Sin descripción."}
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "1fr 1fr",
                      },
                      gap: 1.5,
                      mb: 2.5,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: "background.default",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FolderOpenIcon fontSize="small" color="action" />

                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" color="text.secondary">
                            Tablero
                          </Typography>

                          <Typography fontWeight={800} noWrap>
                            {task.boardName || "Sin tablero"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: "background.default",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarMonthIcon fontSize="small" color="action" />

                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" color="text.secondary">
                            Fecha límite
                          </Typography>

                          <Typography fontWeight={800} noWrap>
                            {formatDate(task.dueDate)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", sm: "center" },
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 1.5,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Responsable
                      </Typography>

                      <Typography fontWeight={800}>
                        {task.assignedTo?.name || "Usuario"}
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      startIcon={<AssignmentTurnedInIcon />}
                      onClick={() => navigate(`/boards/${task.boardId}`)}
                    >
                      Abrir tablero
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {filteredTasks.length === 0 && (
            <Card>
              <CardContent sx={{ textAlign: "center", py: 7 }}>
                <TaskAltIcon color="action" sx={{ fontSize: 52, mb: 1 }} />

                <Typography variant="h6">No hay tareas para mostrar</Typography>

                <Typography color="text.secondary">
                  Intenta cambiar los filtros o crea tareas dentro de un tablero.
                </Typography>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
}