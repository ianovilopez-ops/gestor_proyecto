import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import GroupsIcon from "@mui/icons-material/Groups";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";

import {
  Alert,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

import { createBoard, getBoards } from "../services/boardService.js";
import { getTasksByBoard } from "../services/taskService.js";

function getStatusColor(status) {
  if (status === "Completado") return "success";
  if (status === "Avanzado") return "success";
  if (status === "En proceso") return "primary";
  return "warning";
}

function getStatusBarColor(status) {
  if (status === "Completado") return "success.main";
  if (status === "Avanzado") return "success.main";
  if (status === "En proceso") return "primary.main";
  return "warning.main";
}

function getProgressFromStatus(status) {
  if (status === "Completado") return 100;
  if (status === "Avanzado") return 70;
  if (status === "En proceso") return 45;
  return 10;
}

function getProgressFromTasks(tasks = [], status) {
  if (!tasks.length) return getProgressFromStatus(status);

  const done = tasks.filter((task) => task.status === "done").length;

  return Math.round((done / tasks.length) * 100);
}

function getMemberInitial(member) {
  if (member?.name) {
    return member.name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  if (member?.email) {
    return member.email[0]?.toUpperCase() || "U";
  }

  return "U";
}

function formatDate(dateString) {
  if (!dateString) return "Sin fecha";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getBoardTaskStats(tasks = []) {
  return {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === "pending").length,
    inProgress: tasks.filter((task) => task.status === "in_progress").length,
    done: tasks.filter((task) => task.status === "done").length,
  };
}

export function BoardsPage() {
  const navigate = useNavigate();

  const [boards, setBoards] = useState([]);
  const [tasksByBoard, setTasksByBoard] = useState({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [areaFilter, setAreaFilter] = useState("Todas");

  const [openDialog, setOpenDialog] = useState(false);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [savingBoard, setSavingBoard] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    area: "",
    description: "",
    status: "Pendiente",
  });

  const loadBoards = async () => {
    try {
      setLoadingBoards(true);
      setError("");

      const boardsResponse = await getBoards();
      const loadedBoards = boardsResponse.boards || [];

      setBoards(loadedBoards);

      const taskResponses = await Promise.all(
        loadedBoards.map(async (board) => {
          try {
            const tasksResponse = await getTasksByBoard(board._id);

            return {
              boardId: board._id,
              tasks: tasksResponse.tasks || [],
            };
          } catch {
            return {
              boardId: board._id,
              tasks: [],
            };
          }
        })
      );

      const nextTasksByBoard = taskResponses.reduce((acc, item) => {
        acc[item.boardId] = item.tasks;
        return acc;
      }, {});

      setTasksByBoard(nextTasksByBoard);
    } catch (error) {
      setError(error.message || "No se pudieron cargar los tableros.");
    } finally {
      setLoadingBoards(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const areas = useMemo(() => {
    const uniqueAreas = boards
      .map((board) => board.area || "General")
      .filter(Boolean);

    return ["Todas", ...Array.from(new Set(uniqueAreas))];
  }, [boards]);

  const filteredBoards = useMemo(() => {
    return boards.filter((board) => {
      const text = `
        ${board.name}
        ${board.area}
        ${board.description}
        ${board.status}
        ${board.createdBy}
      `.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "Todos" || board.status === statusFilter;

      const matchesArea = areaFilter === "Todas" || board.area === areaFilter;

      return matchesSearch && matchesStatus && matchesArea;
    });
  }, [boards, search, statusFilter, areaFilter]);

  const globalStats = useMemo(() => {
    const allTasks = Object.values(tasksByBoard).flat();

    const completedBoards = boards.filter(
      (board) => board.status === "Completado"
    ).length;

    const activeBoards = boards.filter(
      (board) => board.status === "En proceso" || board.status === "Avanzado"
    ).length;

    const totalMembers = boards.reduce((acc, board) => {
      return acc + (board.members?.length || 0);
    }, 0);

    const doneTasks = allTasks.filter((task) => task.status === "done").length;

    const progress =
      allTasks.length === 0 ? 0 : Math.round((doneTasks / allTasks.length) * 100);

    return {
      totalBoards: boards.length,
      activeBoards,
      completedBoards,
      totalMembers,
      totalTasks: allTasks.length,
      doneTasks,
      progress,
    };
  }, [boards, tasksByBoard]);

  const handleOpenDialog = () => {
    setError("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    if (savingBoard) return;

    setOpenDialog(false);
    setForm({
      name: "",
      area: "",
      description: "",
      status: "Pendiente",
    });
  };

  const handleCreateBoard = async () => {
    if (!form.name.trim()) return;

    try {
      setSavingBoard(true);
      setError("");

      const response = await createBoard({
        name: form.name.trim(),
        area: form.area.trim() || "General",
        description:
          form.description.trim() ||
          "Tablero creado para organizar tareas del equipo.",
        status: form.status,
      });

      setBoards((prevBoards) => [response.board, ...prevBoards]);

      setTasksByBoard((prevTasksByBoard) => ({
        ...prevTasksByBoard,
        [response.board._id]: [],
      }));

      handleCloseDialog();
    } catch (error) {
      setError(error.message || "No se pudo crear el tablero.");
    } finally {
      setSavingBoard(false);
    }
  };

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
            Tableros
          </Typography>

          <Typography color="text.secondary">
            Administra proyectos, equipos y avance real desde tus tableros.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Actualizar tableros">
            <span>
              <IconButton onClick={loadBoards} disabled={loadingBoards}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Nuevo tablero
          </Button>
        </Stack>
      </Box>

      {loadingBoards && <LinearProgress sx={{ mb: 2 }} />}

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
              <ViewKanbanIcon color="primary" />

              <Box>
                <Typography color="text.secondary">Tableros</Typography>
                <Typography variant="h4">{globalStats.totalBoards}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <AutoGraphIcon color="primary" />

              <Box>
                <Typography color="text.secondary">Activos</Typography>
                <Typography variant="h4">{globalStats.activeBoards}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <AssignmentTurnedInIcon color="success" />

              <Box>
                <Typography color="text.secondary">Completados</Typography>
                <Typography variant="h4">
                  {globalStats.completedBoards}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PendingActionsIcon color="warning" />

              <Box>
                <Typography color="text.secondary">Tareas</Typography>
                <Typography variant="h4">{globalStats.totalTasks}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <GroupsIcon color="secondary" />

              <Box>
                <Typography color="text.secondary">Miembros</Typography>
                <Typography variant="h4">{globalStats.totalMembers}</Typography>
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
              value={globalStats.progress}
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
              {globalStats.progress}% completado
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1.4fr 220px 220px",
              },
              gap: 2,
              alignItems: "center",
            }}
          >
        <TextField
          placeholder="Buscar tablero..."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            minWidth: 260,
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
                <MenuItem value="Avanzado">Avanzado</MenuItem>
                <MenuItem value="Completado">Completado</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Área</InputLabel>

              <Select
                label="Área"
                value={areaFilter}
                onChange={(event) => setAreaFilter(event.target.value)}
              >
                {areas.map((area) => (
                  <MenuItem key={area} value={area}>
                    {area}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {loadingBoards ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 7 }}>
            <CircularProgress sx={{ mb: 2 }} />

            <Typography variant="h6">Cargando tableros...</Typography>

            <Typography color="text.secondary">
              Consultando tableros y tareas reales.
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
                md: "repeat(2, 1fr)",
                xl: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {filteredBoards.map((board) => {
              const boardTasks = tasksByBoard[board._id] || [];
              const taskStats = getBoardTaskStats(boardTasks);
              const progress = getProgressFromTasks(boardTasks, board.status);
              const members = board.members?.length ? board.members : [];

              return (
                <Card
                  key={board._id}
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 18px 45px rgba(15, 23, 42, 0.14)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 8,
                      bgcolor: getStatusBarColor(board.status),
                    }}
                  />

                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={(theme) => ({
                          width: 52,
                          height: 52,
                          borderRadius: 4,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          color: "primary.main",
                        })}
                      >
                        <FolderOpenIcon />
                      </Box>

                      <Chip
                        label={board.status || "Pendiente"}
                        color={getStatusColor(board.status)}
                        size="small"
                      />
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        mb: 0.5,
                        minHeight: 32,
                      }}
                    >
                      {board.name}
                    </Typography>

                    <Typography color="primary" fontWeight={800} sx={{ mb: 1 }}>
                      {board.area || "General"}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        minHeight: 42,
                        mb: 3,
                      }}
                    >
                      {board.description || "Sin descripción."}
                    </Typography>

                    <Stack spacing={1.5} sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Progreso
                        </Typography>

                        <Typography variant="body2" fontWeight={900}>
                          {progress}%
                        </Typography>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={(theme) => ({
                          height: 10,
                          borderRadius: 99,
                          bgcolor: alpha(theme.palette.primary.main, 0.14),
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 99,
                          },
                        })}
                      />
                    </Stack>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 1,
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: 3,
                          bgcolor: "background.default",
                          border: "1px solid",
                          borderColor: "divider",
                          textAlign: "center",
                        }}
                      >
                        <Typography fontWeight={900}>
                          {taskStats.pending}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          Pend.
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: 3,
                          bgcolor: "background.default",
                          border: "1px solid",
                          borderColor: "divider",
                          textAlign: "center",
                        }}
                      >
                        <Typography fontWeight={900}>
                          {taskStats.inProgress}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          Proc.
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: 3,
                          bgcolor: "background.default",
                          border: "1px solid",
                          borderColor: "divider",
                          textAlign: "center",
                        }}
                      >
                        <Typography fontWeight={900}>{taskStats.done}</Typography>

                        <Typography variant="caption" color="text.secondary">
                          Hechas
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 1.5,
                        mb: 3,
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
                          <GroupsIcon fontSize="small" color="action" />

                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Miembros
                            </Typography>

                            <Typography fontWeight={900}>
                              {members.length}
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
                          <AccessTimeIcon fontSize="small" color="action" />

                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" color="text.secondary">
                              Creado
                            </Typography>

                            <Typography fontWeight={900} noWrap>
                              {formatDate(board.createdAt)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <AvatarGroup max={4}>
                        {members.length > 0 ? (
                          members.map((member, index) => (
                            <Avatar
                              key={`${board._id}-${member.email}-${index}`}
                              sx={{
                                width: 34,
                                height: 34,
                                bgcolor: "primary.main",
                                fontSize: 14,
                                fontWeight: 900,
                              }}
                            >
                              {getMemberInitial(member)}
                            </Avatar>
                          ))
                        ) : (
                          <Avatar
                            sx={{
                              width: 34,
                              height: 34,
                              bgcolor: "primary.main",
                              fontSize: 14,
                              fontWeight: 900,
                            }}
                          >
                            U
                          </Avatar>
                        )}
                      </AvatarGroup>

                      <Button
                        variant="contained"
                        onClick={() => navigate(`/boards/${board._id}`)}
                      >
                        Abrir tablero
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          {filteredBoards.length === 0 && (
            <Card>
              <CardContent sx={{ textAlign: "center", py: 7 }}>
                <ViewKanbanIcon color="action" sx={{ fontSize: 52, mb: 1 }} />

                <Typography variant="h6">No hay tableros para mostrar</Typography>

                <Typography color="text.secondary">
                  Intenta cambiar los filtros o crea un nuevo tablero.
                </Typography>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Crear nuevo tablero</DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre del tablero"
              fullWidth
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              disabled={savingBoard}
            />

            <TextField
              label="Área o categoría"
              fullWidth
              placeholder="Ejemplo: Backend, Frontend, Diseño, General"
              value={form.area}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  area: event.target.value,
                }))
              }
              disabled={savingBoard}
            />

            <TextField
              label="Descripción"
              fullWidth
              multiline
              minRows={3}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              disabled={savingBoard}
            />

            <FormControl fullWidth disabled={savingBoard}>
              <InputLabel>Estado inicial</InputLabel>

              <Select
                label="Estado inicial"
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    status: event.target.value,
                  }))
                }
              >
                <MenuItem value="Pendiente">Pendiente</MenuItem>
                <MenuItem value="En proceso">En proceso</MenuItem>
                <MenuItem value="Avanzado">Avanzado</MenuItem>
                <MenuItem value="Completado">Completado</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} disabled={savingBoard}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleCreateBoard}
            disabled={savingBoard || !form.name.trim()}
            startIcon={
              savingBoard ? <CircularProgress size={18} color="inherit" /> : null
            }
          >
            {savingBoard ? "Creando..." : "Crear tablero"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}