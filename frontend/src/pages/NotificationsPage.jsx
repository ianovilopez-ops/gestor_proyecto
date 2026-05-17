import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import NotificationsIcon from "@mui/icons-material/Notifications";

import {
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService.js";

export default function NotificationsPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const data = await getNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar las notificaciones.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function handleOpen(notification) {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification._id);
      }

      if (notification.relatedType === "workspace" && notification.relatedId) {
        navigate(`/workspaces/${notification.relatedId}`);
      } else if (notification.relatedType === "board" && notification.relatedId) {
        navigate(`/boards/${notification.relatedId}`);
      } else if (notification.relatedType === "task") {
        const boardId = notification.metadata?.boardId;
        navigate(boardId ? `/boards/${boardId}` : "/tasks");
      } else if (notification.relatedType === "message") {
        navigate("/messages");
      } else {
        await loadNotifications();
      }
    } catch (error) {
      console.error(error);
      setError("No se pudo abrir la notificación.");
    }
  }

  async function handleDelete(id) {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error(error);
      setError("No se pudo eliminar la notificación.");
    }
  }

  async function handleMarkAll() {
    try {
      await markAllNotificationsAsRead();
      await loadNotifications();
    } catch (error) {
      console.error(error);
      setError("No se pudieron marcar como leídas.");
    }
  }

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={900}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <NotificationsIcon fontSize="large" />
            Notificaciones
          </Typography>

          <Typography color="text.secondary">
            Centro de actividad y alertas del sistema.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Chip color="error" label={`${unreadCount} sin leer`} />

          <Button
            variant="contained"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAll}
            disabled={notifications.length === 0}
          >
            Marcar todas
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Alert severity="info">No tienes notificaciones actualmente.</Alert>
      ) : (
        <Stack spacing={2}>
          {notifications.map((notification) => (
            <Paper
              key={notification._id}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 4,
                border: "1px solid",
                borderColor: notification.read ? "divider" : "primary.main",
                bgcolor: notification.read ? "background.paper" : "action.hover",
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
              >
                <Box
                  sx={{ flex: 1, cursor: "pointer", minWidth: 0 }}
                  onClick={() => handleOpen(notification)}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1, flexWrap: "wrap" }}
                  >
                    <Typography variant="h6" fontWeight={900}>
                      {notification.title}
                    </Typography>

                    {!notification.read && (
                      <Chip size="small" color="primary" label="Nueva" />
                    )}
                  </Stack>

                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    {notification.message}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: "wrap", gap: 1 }}
                  >
                    <Chip size="small" label={notification.type || "system"} />

                    <Chip
                      size="small"
                      color={
                        notification.priority === "Alta"
                          ? "error"
                          : notification.priority === "Media"
                            ? "warning"
                            : "success"
                      }
                      label={notification.priority || "Media"}
                    />

                    <Chip
                      size="small"
                      variant="outlined"
                      label={
                        notification.createdAt
                          ? new Date(notification.createdAt).toLocaleString()
                          : "Sin fecha"
                      }
                    />
                  </Stack>
                </Box>

                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ display: { xs: "none", md: "block" } }}
                />

                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" onClick={() => handleOpen(notification)}>
                    Abrir
                  </Button>

                  <IconButton
                    color="error"
                    onClick={() => handleDelete(notification._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}