import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupsIcon from "@mui/icons-material/Groups";
import RefreshIcon from "@mui/icons-material/Refresh";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import TimelineIcon from "@mui/icons-material/Timeline";
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
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import { getCurrentUser } from "../services/authService.js";
import { getBoards } from "../services/boardService.js";

function getProgressByStatus(status) {
  if (status === "Completado") return 100;
  if (status === "Avanzado") return 70;
  if (status === "En proceso") return 45;
  return 10;
}

function getStatusColor(status) {
  if (status === "Completado") return "success";
  if (status === "Avanzado") return "success";
  if (status === "En proceso") return "primary";
  return "warning";
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

  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatCard({ title, value, description, icon, color = "primary" }) {
  return (
    <Card
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
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
          <Box>
            <Typography color="text.secondary" fontWeight={700}>
              {title}
            </Typography>

            <Typography variant="h4" fontWeight={900}>
              {value}
            </Typography>
          </Box>

          <Box
            sx={(theme) => ({
              width: 48,
              height: 48,
              borderRadius: 4,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette[color].main, 0.13),
              color: `${color}.main`,
            })}
          >
            {icon}
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();

  const [boards, setBoards] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [error, setError] = useState("");

  const currentUser = getCurrentUser();

  const userName = currentUser?.name || "Usuario";
  const userRole = currentUser?.role || "Miembro";
  const userEmail = currentUser?.email || "";

  const loadDashboard = async () => {
    try {
      setLoadingBoards(true);
      setError("");

      const response = await getBoards();
      setBoards(response.boards || []);
    } catch (error) {
      setError(error.message || "No se pudo cargar el panel principal.");
    } finally {
      setLoadingBoards(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const totalBoards = boards.length;

    const activeBoards = boards.filter(
      (board) => board.status === "En proceso" || board.status === "Avanzado"
    ).length;

    const completedBoards = boards.filter(
      (board) => board.status === "Completado"
    ).length;

    const totalMembers = boards.reduce((acc, board) => {
      return acc + (board.members?.length || 0);
    }, 0);

    const avgProgress =
      totalBoards === 0
        ? 0
        : Math.round(
            boards.reduce((acc, board) => {
              return acc + getProgressByStatus(board.status);
            }, 0) / totalBoards
          );

    return {
      totalBoards,
      activeBoards,
      completedBoards,
      totalMembers,
      avgProgress,
    };
  }, [boards]);

  const recentBoards = useMemo(() => {
    return boards.slice(0, 4);
  }, [boards]);

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
            Panel principal
          </Typography>

          <Typography color="text.secondary">
            Bienvenido, {userName}. Aquí tienes el resumen general de NexusFlow.
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              mt: 2,
              flexWrap: "wrap",
            }}
          >
            <Chip label={userRole} color="primary" />
            {userEmail && <Chip label={userEmail} variant="outlined" />}
            <Chip label="Sesión activa" color="success" variant="outlined" />
          </Stack>
        </Box>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Actualizar panel">
            <span>
              <IconButton onClick={loadDashboard} disabled={loadingBoards}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Button
            variant="outlined"
            startIcon={<GroupsIcon />}
            onClick={() => navigate("/team")}
          >
            Equipo
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/boards")}
          >
            Nuevo tablero
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {loadingBoards ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 7 }}>
            <CircularProgress sx={{ mb: 2 }} />

            <Typography variant="h6">Cargando panel principal...</Typography>

            <Typography color="text.secondary">
              Consultando tableros desde el API Gateway.
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
                sm: "repeat(2, 1fr)",
                xl: "repeat(4, 1fr)",
              },
              gap: 3,
              mb: 3,
            }}
          >
            <StatCard
              title="Tableros"
              value={stats.totalBoards}
              description="Total de tableros donde participas."
              icon={<ViewKanbanIcon />}
              color="primary"
            />

            <StatCard
              title="Activos"
              value={stats.activeBoards}
              description="Tableros actualmente en avance."
              icon={<TimelineIcon />}
              color="secondary"
            />

            <StatCard
              title="Completados"
              value={stats.completedBoards}
              description="Tableros marcados como finalizados."
              icon={<TaskAltIcon />}
              color="success"
            />

            <StatCard
              title="Miembros"
              value={stats.totalMembers}
              description="Integrantes asociados a tus tableros."
              icon={<GroupsIcon />}
              color="warning"
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "1.4fr 0.8fr",
              },
              gap: 3,
            }}
          >
            <Card
              sx={{
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <Box>
                    <Typography variant="h6">Tableros recientes</Typography>

                    <Typography variant="body2" color="text.secondary">
                      Acceso rápido a tus proyectos principales.
                    </Typography>
                  </Box>

                  <Button
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate("/boards")}
                  >
                    Ver todos
                  </Button>
                </Box>

                {recentBoards.length === 0 ? (
                  <Box
                    sx={{
                      py: 6,
                      textAlign: "center",
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 4,
                    }}
                  >
                    <DashboardIcon
                      color="action"
                      sx={{
                        fontSize: 48,
                        mb: 1,
                      }}
                    />

                    <Typography variant="h6">
                      Todavía no tienes tableros
                    </Typography>

                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      Crea tu primer tablero para empezar a organizar tareas.
                    </Typography>

                    <Button
                      variant="contained"
                      onClick={() => navigate("/boards")}
                    >
                      Crear tablero
                    </Button>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {recentBoards.map((board) => {
                      const progress = getProgressByStatus(board.status);
                      const members = board.members || [];

                      return (
                        <Card
                          key={board._id}
                          variant="outlined"
                          sx={{
                            transition: "0.2s ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: "0 14px 35px rgba(15, 23, 42, 0.12)",
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
                                alignItems="center"
                                sx={{
                                  mb: 1,
                                  flexWrap: "wrap",
                                }}
                              >
                                <Typography variant="h6">
                                  {board.name}
                                </Typography>

                                <Chip
                                  label={board.status || "Pendiente"}
                                  size="small"
                                  color={getStatusColor(board.status)}
                                />
                              </Stack>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                {board.description || "Sin descripción."}
                              </Typography>

                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{
                                  flexWrap: "wrap",
                                }}
                              >
                                <Chip
                                  label={board.area || "General"}
                                  size="small"
                                  variant="outlined"
                                />

                                <Chip
                                  label={`Creado: ${formatDate(
                                    board.createdAt
                                  )}`}
                                  size="small"
                                  variant="outlined"
                                />
                              </Stack>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                justifyContent: {
                                  xs: "space-between",
                                  md: "flex-end",
                                },
                              }}
                            >
                              <AvatarGroup max={4}>
                                {members.length > 0 ? (
                                  members.map((member, index) => (
                                    <Avatar
                                      key={`${board._id}-${index}`}
                                      sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: "primary.main",
                                        fontSize: 13,
                                        fontWeight: 900,
                                      }}
                                    >
                                      {getInitials(
                                        member.name,
                                        member.email
                                      )}
                                    </Avatar>
                                  ))
                                ) : (
                                  <Avatar
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      bgcolor: "primary.main",
                                      fontSize: 13,
                                      fontWeight: 900,
                                    }}
                                  >
                                    U
                                  </Avatar>
                                )}
                              </AvatarGroup>

                              <Button
                                variant="outlined"
                                onClick={() => navigate(`/boards/${board._id}`)}
                              >
                                Abrir
                              </Button>
                            </Box>

                            <Box sx={{ gridColumn: "1 / -1" }}>
                              <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                  height: 8,
                                  borderRadius: 99,
                                }}
                              />

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {progress}% de avance estimado
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>

            <Stack spacing={3}>
              <Card
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Avance general
                  </Typography>

                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Promedio calculado según el estado de tus tableros.
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      placeItems: "center",
                      width: 150,
                      height: 150,
                      mx: "auto",
                      borderRadius: "50%",
                      border: "12px solid",
                      borderColor: "primary.main",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h4" fontWeight={900}>
                      {stats.avgProgress}%
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={stats.avgProgress}
                    sx={{
                      height: 10,
                      borderRadius: 99,
                    }}
                  />
                </CardContent>
              </Card>

              <Card
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Acciones rápidas
                  </Typography>

                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Atajos para trabajar sin dar mil vueltas.
                  </Typography>

                  <Stack spacing={1.5}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<ViewKanbanIcon />}
                      onClick={() => navigate("/boards")}
                    >
                      Ir a tableros
                    </Button>

                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<GroupsIcon />}
                      onClick={() => navigate("/team")}
                    >
                      Gestionar equipo
                    </Button>

                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<TaskAltIcon />}
                      onClick={() => navigate("/tasks")}
                    >
                      Ver mis tareas
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
}