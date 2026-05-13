import { useMemo, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";

import {
  AppBar,
  Avatar,
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
  Toolbar,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ForumIcon from "@mui/icons-material/Forum";
import GroupsIcon from "@mui/icons-material/Groups";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

import { getCurrentUser, logoutUser } from "../services/authService.js";

const drawerWidth = 260;

const navItems = [
  {
    label: "Inicio",
    desktopLabel: "Panel principal",
    path: "/dashboard",
    icon: <DashboardIcon />,
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

  const currentUser = getCurrentUser();

  const userName = currentUser?.name || "Usuario";
  const userEmail = currentUser?.email || "usuario@nexusflow.local";
  const userRole = currentUser?.role || "Miembro";
  const userInitials = useMemo(
    () => getInitials(userName, userEmail),
    [userName, userEmail]
  );

  const isProfileMenuOpen = Boolean(profileAnchor);

  const currentMobilePath = mobileNavItems.some(
    (item) => item.path === location.pathname
  )
    ? location.pathname
    : "/dashboard";

  const handleOpenProfileMenu = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setProfileAnchor(null);
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
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: "inherit",
                }}
              >
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
              <Chip
                label="En línea"
                color="success"
                size="small"
                sx={{ display: { xs: "none", sm: "inline-flex" } }}
              />

              <IconButton>
                <NotificationsNoneIcon />
              </IconButton>

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
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    width: 260,
                    borderRadius: 3,
                    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.14)",
                    backgroundImage: "none",
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
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
                    sx={{
                      display: "block",
                      mt: 1,
                    }}
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
    </Box>
  );
}
