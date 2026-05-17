import { useEffect, useMemo, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import {
  Alert,
  AppBar,
  Avatar,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Toolbar,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ForumIcon from "@mui/icons-material/Forum";
import GroupsIcon from "@mui/icons-material/Groups";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";

import LiveClock from "../components/LiveClock.jsx";
import { getCurrentUser, logoutUser } from "../services/authService.js";
import { getRealtimeSocket } from "../services/realtimeService.js";
import { checkDeadlineReminders } from "../services/deadlineReminderService.js";

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
} from "../services/notificationService.js";

const drawerWidth = 260;

const navItems = [
  {
    label: "Inicio",
    desktopLabel: "Panel principal",
    path: "/dashboard",
    icon: <DashboardIcon />,
  },
  {
    label: "Espacios",
    desktopLabel: "Workspaces",
    path: "/workspaces",
    icon: <BusinessIcon />,
  },
  {
    label: "Tableros",
    desktopLabel: "Tableros",
    path: "/boards",
    icon: <ViewKanbanIcon />,
  },
  {
    label: "Tareas",
    desktopLabel: "Mis tareas",
    path: "/tasks",
    icon: <TaskAltIcon />,
  },
  {
    label: "Alertas",
    desktopLabel: "Notificaciones",
    path: "/notifications",
    icon: <NotificationsNoneIcon />,
  },
  {
    label: "Mensajes",
    desktopLabel: "Mensajes",
    path: "/messages",
    icon: <ForumIcon />,
  },
  {
    label: "Equipo",
    desktopLabel: "Equipo",
    path: "/team",
    icon: <GroupsIcon />,
  },
];

const mobileNavItems = navItems;

function getInitials(name = "", email = "") {
  const base = name || email || "Usuario";

  const initials = base
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "U";
}

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  const currentUser = getCurrentUser();

  const userName = currentUser?.name || "Usuario";
  const userEmail = currentUser?.email || "usuario@nexusflow.local";
  const userRole = currentUser?.role || "Miembro";

  const userInitials = useMemo(
    () => getInitials(userName, userEmail),
    [userName, userEmail]
  );

  const isProfileMenuOpen = Boolean(profileAnchor);
  const isNotificationMenuOpen = Boolean(notificationAnchor);

  const currentMobilePath = mobileNavItems.some(
    (item) => item.path === location.pathname
  )
    ? location.pathname
    : "/dashboard";

  async function loadNotifications() {
    try {
      const data = await getNotifications();

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    }
  }

  useEffect(() => {
    async function initNotifications() {
      try {
        await checkDeadlineReminders();
      } catch (error) {
        console.error("Error revisando deadlines:", error);
      }

      await loadNotifications();
    }

    initNotifications();

    const interval = setInterval(() => {
      initNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const activeUser = getCurrentUser();

    if (!activeUser?.id) return;

    const socket = getRealtimeSocket();

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join-user", activeUser.id);

    const handleNotificationCreated = ({ userId, notification }) => {
      if (userId !== activeUser.id || !notification) return;

      setNotifications((prev) => {
        const alreadyExists = prev.some((item) => item._id === notification._id);

        if (alreadyExists) return prev;

        return [notification, ...prev];
      });

      setUnreadCount((prev) => prev + 1);
      setToastNotification(notification);
      setToastOpen(true);
    };

    const handleNotificationDeleted = ({ userId, notificationId }) => {
      if (userId !== activeUser.id || !notificationId) return;

      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== notificationId)
      );

      loadNotifications();
    };

    const handleNotificationsReadAll = ({ userId }) => {
      if (userId !== activeUser.id) return;

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadCount(0);
    };

    const handleNotificationRead = ({ userId }) => {
      if (userId !== activeUser.id) return;

      loadNotifications();
    };

    socket.on("notification-created", handleNotificationCreated);
    socket.on("notification-deleted", handleNotificationDeleted);
    socket.on("notifications-read-all", handleNotificationsReadAll);
    socket.on("notification-read", handleNotificationRead);

    return () => {
      socket.emit("leave-user", activeUser.id);

      socket.off("notification-created", handleNotificationCreated);
      socket.off("notification-deleted", handleNotificationDeleted);
      socket.off("notifications-read-all", handleNotificationsReadAll);
      socket.off("notification-read", handleNotificationRead);
    };
  }, []);

  const handleOpenProfileMenu = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setProfileAnchor(null);
  };

  const handleOpenNotificationMenu = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleCloseNotificationMenu = () => {
    setNotificationAnchor(null);
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification._id);
        await loadNotifications();
      }

      if (notification.relatedType === "workspace" && notification.relatedId) {
        navigate(`/workspaces/${notification.relatedId}`);
      } else if (notification.relatedType === "board" && notification.relatedId) {
        navigate(`/boards/${notification.relatedId}`);
      } else if (notification.relatedType === "task") {
        const boardId = notification.metadata?.boardId;

        if (boardId) {
          navigate(`/boards/${boardId}`);
        } else {
          navigate("/tasks");
        }
      } else if (notification.relatedType === "message") {
        navigate("/messages");
      }

      setNotificationAnchor(null);
    } catch (error) {
      console.error("Error abriendo notificación:", error);
    }
  };

  const handleMarkAllNotifications = async () => {
    try {
      await markAllNotificationsAsRead();
      await loadNotifications();
    } catch (error) {
      console.error("Error marcando notificaciones:", error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id);
      await loadNotifications();
    } catch (error) {
      console.error("Error eliminando notificación:", error);
    }
  };

  const handleNavigateFromProfile = (path) => {
    handleCloseProfileMenu();
    navigate(path);
  };

  const handleLogout = () => {
    logoutUser();
    handleCloseProfileMenu();
    navigate("/login", { replace: true });
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            backgroundImage: "none",
          },
        }}
      >
        <Box sx={{ px: 3, py: 3 }}>
          <Typography variant="h5" color="primary" fontWeight={900}>
            NexusFlow
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Gestión colaborativa
          </Typography>
        </Box>

        <List sx={{ px: 2 }}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              sx={{
                mb: 1,
                borderRadius: 3,
                color: "text.secondary",
                "&.active": {
                  bgcolor: "primary.main",
                  color: "#ffffff",
                  "& .MuiListItemIcon-root": {
                    color: "#ffffff",
                  },
                },
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                {item.icon}
              </ListItemIcon>

              <ListItemText primary={item.desktopLabel} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={(theme) => ({
            bgcolor: alpha(theme.palette.background.paper, 0.88),
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid",
            borderColor: "divider",
            color: "text.primary",
            backgroundImage: "none",
          })}
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Project Workspace
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                Administración de tareas en tiempo real
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <LiveClock />
              </Box>

              <Chip
                label="En línea"
                color="success"
                size="small"
                sx={{ display: { xs: "none", sm: "inline-flex" } }}
              />

              <IconButton onClick={handleOpenNotificationMenu}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsNoneIcon />
                </Badge>
              </IconButton>

              <Menu
                anchorEl={notificationAnchor}
                open={isNotificationMenuOpen}
                onClose={handleCloseNotificationMenu}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1.5,
                      width: 380,
                      maxHeight: 460,
                      borderRadius: 3,
                      boxShadow: "0 18px 45px rgba(15, 23, 42, 0.14)",
                      backgroundImage: "none",
                    },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography fontWeight={900}>Notificaciones</Typography>

                  <Typography variant="body2" color="text.secondary">
                    {unreadCount} sin leer
                  </Typography>
                </Box>

                <Divider />

                {notifications.length === 0 ? (
                  <MenuItem disabled>
                    <Typography color="text.secondary">
                      No tienes notificaciones.
                    </Typography>
                  </MenuItem>
                ) : (
                  notifications.slice(0, 8).map((notification) => (
                    <MenuItem
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      sx={{
                        alignItems: "flex-start",
                        whiteSpace: "normal",
                        bgcolor: notification.read
                          ? "transparent"
                          : "action.hover",
                        gap: 1,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={900} noWrap>
                          {notification.title}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {notification.type} · {notification.priority}
                        </Typography>
                      </Box>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteNotification(notification._id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </MenuItem>
                  ))
                )}

                <Divider />

                <MenuItem onClick={handleMarkAllNotifications}>
                  <Typography fontWeight={800}>
                    Marcar todas como leídas
                  </Typography>
                </MenuItem>
              </Menu>

              <IconButton onClick={handleOpenProfileMenu} sx={{ p: 0 }}>
                <Avatar sx={{ bgcolor: "primary.main", fontWeight: 900 }}>
                  {userInitials}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={profileAnchor}
                open={isProfileMenuOpen}
                onClose={handleCloseProfileMenu}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1.5,
                      width: 260,
                      borderRadius: 3,
                      boxShadow: "0 18px 45px rgba(15, 23, 42, 0.14)",
                      backgroundImage: "none",
                    },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        width: 42,
                        height: 42,
                        fontWeight: 900,
                      }}
                    >
                      {userInitials}
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={900} noWrap>
                        {userName}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" noWrap>
                        {userRole}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ display: "block", mt: 1 }}
                  >
                    {userEmail}
                  </Typography>
                </Box>

                <Divider />

                <MenuItem onClick={() => handleNavigateFromProfile("/team")}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>

                  <ListItemText primary="Perfil" />
                </MenuItem>

                <MenuItem onClick={() => handleNavigateFromProfile("/settings")}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>

                  <ListItemText primary="Ajustes" />
                </MenuItem>

                <Divider />

                <MenuItem onClick={handleLogout}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>

                  <ListItemText
                    primary="Cerrar sesión"
                    primaryTypographyProps={{
                      color: "error",
                      fontWeight: 800,
                    }}
                  />
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            p: { xs: 2, md: 4 },
            pb: { xs: 10, md: 4 },
          }}
        >
          <Outlet />
        </Box>
      </Box>

      <Paper
        elevation={8}
        sx={{
          position: "fixed",
          left: 12,
          right: 12,
          bottom: 12,
          zIndex: 1200,
          display: { xs: "block", md: "none" },
          borderRadius: 5,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          backgroundImage: "none",
        }}
      >
        <BottomNavigation
          value={currentMobilePath}
          onChange={(_, newValue) => {
            navigate(newValue);
          }}
          showLabels
          sx={{
            height: 72,
            bgcolor: "background.paper",
            "& .MuiBottomNavigationAction-root": {
              minWidth: 0,
              color: "text.secondary",
            },
            "& .Mui-selected": {
              color: "primary.main",
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.68rem",
              fontWeight: 700,
            },
          }}
        >
          {mobileNavItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              value={item.path}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>

      <Snackbar
        open={toastOpen}
        autoHideDuration={5000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => setToastOpen(false)}
          sx={{ width: "100%" }}
        >
          <strong>{toastNotification?.title}</strong>
          <br />
          {toastNotification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}