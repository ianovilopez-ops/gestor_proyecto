import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import PersonIcon from "@mui/icons-material/Person";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PaletteIcon from "@mui/icons-material/Palette";
import SecurityIcon from "@mui/icons-material/Security";
import LinkIcon from "@mui/icons-material/Link";
import SaveIcon from "@mui/icons-material/Save";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import {
  setCompactMode,
  setPrimaryColor,
  setThemeMode,
} from "../app/store.js";

import { changePassword, getCurrentUser } from "../services/authService.js";

const settingSections = [
  {
    id: "profile",
    title: "Perfil",
    description: "Información personal del usuario.",
    icon: <PersonIcon />,
  },
  {
    id: "notifications",
    title: "Notificaciones",
    description: "Alertas del sistema y actividad del equipo.",
    icon: <NotificationsNoneIcon />,
  },
  {
    id: "appearance",
    title: "Apariencia",
    description: "Tema visual y preferencias de interfaz.",
    icon: <PaletteIcon />,
  },
  {
    id: "security",
    title: "Seguridad",
    description: "Contraseña y acceso.",
    icon: <SecurityIcon />,
  },
  {
    id: "integrations",
    title: "Integraciones",
    description: "Servicios externos conectados.",
    icon: <LinkIcon />,
  },
];

const integrations = [
  {
    name: "GitHub",
    description: "Sincronización con repositorios y commits.",
    status: "Disponible próximamente",
  },
  {
    name: "Google Drive",
    description: "Adjuntar documentos desde la nube.",
    status: "Disponible próximamente",
  },
  {
    name: "Slack",
    description: "Enviar avisos del proyecto a canales.",
    status: "Disponible próximamente",
  },
];

const primaryColors = ["#2563eb", "#7c3aed", "#10b981", "#f59e0b", "#ef4444"];

export function SettingsPage() {
  const dispatch = useDispatch();

  const themeMode = useSelector((state) => state.ui.themeMode);
  const compactMode = useSelector((state) => state.ui.compactMode);
  const primaryColor = useSelector((state) => state.ui.primaryColor);

  const currentUser = getCurrentUser();

  const [activeSection, setActiveSection] = useState("profile");

  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || "Usuario",
    email: currentUser?.email || "usuario@nexusflow.local",
    role: currentUser?.role || "Miembro",
    area: "Full Stack",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    taskNotifications: true,
    commentNotifications: true,
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState("");
  const [securitySuccess, setSecuritySuccess] = useState("");

  const handlePreferenceChange = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleThemeChange = (event) => {
    dispatch(setThemeMode(event.target.checked ? "dark" : "light"));
  };

  const handleCompactModeChange = (event) => {
    dispatch(setCompactMode(event.target.checked));
  };

  const handlePrimaryColorChange = (color) => {
    dispatch(setPrimaryColor(color));
  };

  const handleChangePassword = async () => {
    if (
      !securityForm.currentPassword ||
      !securityForm.newPassword ||
      !securityForm.confirmPassword
    ) {
      setSecurityError("Completa todos los campos.");
      return;
    }

    if (securityForm.newPassword.length < 6) {
      setSecurityError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setSecurityError("Las contraseñas nuevas no coinciden.");
      return;
    }

    try {
      setSecurityLoading(true);
      setSecurityError("");
      setSecuritySuccess("");

      await changePassword({
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword,
      });

      setSecuritySuccess("Contraseña actualizada correctamente.");

      setSecurityForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setSecurityError(error.message || "No se pudo cambiar la contraseña.");
    } finally {
      setSecurityLoading(false);
    }
  };

  const renderContent = () => {
    if (activeSection === "profile") {
      return (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Información del perfil
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Datos principales del usuario dentro del workspace.
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 3,
              }}
            >
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: "primary.main",
                  fontSize: 28,
                  fontWeight: 900,
                }}
              >
                {(profileForm.name || "U").charAt(0).toUpperCase()}
              </Avatar>

              <Box>
                <Typography variant="h6">{profileForm.name}</Typography>

                <Typography color="text.secondary">
                  {profileForm.email}
                </Typography>

                <Chip
                  label={profileForm.role}
                  color="primary"
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                label="Nombre completo"
                value={profileForm.name}
                onChange={(event) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                fullWidth
              />

              <TextField
                label="Correo electrónico"
                value={profileForm.email}
                onChange={(event) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                fullWidth
              />

              <TextField
                label="Área"
                value={profileForm.area}
                onChange={(event) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    area: event.target.value,
                  }))
                }
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>

                <Select
                  label="Rol"
                  value={profileForm.role}
                  onChange={(event) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      role: event.target.value,
                    }))
                  }
                >
                  <MenuItem value="Propietario">Propietario</MenuItem>
                  <MenuItem value="Administrador">Administrador</MenuItem>
                  <MenuItem value="Miembro">Miembro</MenuItem>
                  <MenuItem value="Observador">Observador</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Button variant="contained" startIcon={<SaveIcon />} sx={{ mt: 3 }}>
              Guardar cambios
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (activeSection === "notifications") {
      return (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Preferencias de notificaciones
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Controla qué alertas recibirá el usuario.
            </Typography>

            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.emailNotifications}
                    onChange={() =>
                      handlePreferenceChange("emailNotifications")
                    }
                  />
                }
                label="Recibir notificaciones por correo"
              />

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.taskNotifications}
                    onChange={() => handlePreferenceChange("taskNotifications")}
                  />
                }
                label="Avisar cuando se asignen nuevas tareas"
              />

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.commentNotifications}
                    onChange={() =>
                      handlePreferenceChange("commentNotifications")
                    }
                  />
                }
                label="Avisar cuando alguien comente en una tarea"
              />
            </Stack>
          </CardContent>
        </Card>
      );
    }

    if (activeSection === "appearance") {
      return (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Apariencia
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Ajustes visuales de la plataforma.
            </Typography>

            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={themeMode === "dark"}
                    onChange={handleThemeChange}
                  />
                }
                label="Modo oscuro"
              />

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={compactMode}
                    onChange={handleCompactModeChange}
                  />
                }
                label="Modo compacto"
              />

              <Divider />

              <Box>
                <Typography fontWeight={800} sx={{ mb: 1 }}>
                  Color principal
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Selecciona el color principal de la plataforma.
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    flexWrap: "wrap",
                  }}
                >
                  {primaryColors.map((color) => {
                    const selected = primaryColor === color;

                    return (
                      <Box
                        key={color}
                        onClick={() => handlePrimaryColorChange(color)}
                        title={color}
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          bgcolor: color,
                          border: selected ? "4px solid" : "3px solid",
                          borderColor: selected
                            ? "text.primary"
                            : "background.paper",
                          boxShadow: selected
                            ? `0 0 0 3px ${color}55`
                            : "0 0 0 1px rgba(148, 163, 184, 0.5)",
                          cursor: "pointer",
                          transition: "0.2s ease",
                          transform: selected ? "scale(1.08)" : "scale(1)",
                          "&:hover": {
                            transform: "scale(1.08)",
                          },
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      );
    }

    if (activeSection === "security") {
      return (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Seguridad
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Cambia la contraseña de acceso a tu cuenta.
            </Typography>

            <Stack spacing={2}>
              {securityError && (
                <Alert severity="error" onClose={() => setSecurityError("")}>
                  {securityError}
                </Alert>
              )}

              {securitySuccess && (
                <Alert
                  severity="success"
                  onClose={() => setSecuritySuccess("")}
                >
                  {securitySuccess}
                </Alert>
              )}

              <TextField
                label="Contraseña actual"
                type="password"
                fullWidth
                value={securityForm.currentPassword}
                onChange={(event) =>
                  setSecurityForm((prev) => ({
                    ...prev,
                    currentPassword: event.target.value,
                  }))
                }
                disabled={securityLoading}
              />

              <TextField
                label="Nueva contraseña"
                type="password"
                fullWidth
                value={securityForm.newPassword}
                onChange={(event) =>
                  setSecurityForm((prev) => ({
                    ...prev,
                    newPassword: event.target.value,
                  }))
                }
                disabled={securityLoading}
              />

              <TextField
                label="Confirmar nueva contraseña"
                type="password"
                fullWidth
                value={securityForm.confirmPassword}
                onChange={(event) =>
                  setSecurityForm((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
                disabled={securityLoading}
              />

              <Button
                variant="contained"
                startIcon={
                  securityLoading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                disabled={securityLoading}
                onClick={handleChangePassword}
              >
                {securityLoading
                  ? "Actualizando..."
                  : "Actualizar contraseña"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      );
    }

    if (activeSection === "integrations") {
      return (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Integraciones
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Servicios externos que se podrán conectar con NexusFlow.
            </Typography>

            <Stack spacing={2}>
              {integrations.map((integration) => (
                <Box
                  key={integration.name}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.default",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography fontWeight={900}>
                      {integration.name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {integration.description}
                    </Typography>
                  </Box>

                  <Chip label={integration.status} variant="outlined" />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Ajustes
        </Typography>

        <Typography color="text.secondary">
          Configura perfil, seguridad, apariencia e integraciones de la
          plataforma.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "320px 1fr",
          },
          gap: 3,
        }}
      >
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ px: 1, mb: 2 }}>
              Configuración
            </Typography>

            <Stack spacing={1}>
              {settingSections.map((section) => {
                const active = activeSection === section.id;

                return (
                  <Box
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    sx={{
                      p: 2,
                      borderRadius: 4,
                      cursor: "pointer",
                      display: "flex",
                      gap: 1.5,
                      bgcolor: active ? "primary.main" : "transparent",
                      color: active ? "#ffffff" : "text.primary",
                      border: "1px solid",
                      borderColor: active ? "primary.main" : "transparent",
                      transition: "0.2s ease",
                      "&:hover": {
                        bgcolor: active ? "primary.main" : "background.default",
                      },
                    }}
                  >
                    <Box>{section.icon}</Box>

                    <Box>
                      <Typography fontWeight={900}>{section.title}</Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: active
                            ? "rgba(255,255,255,0.8)"
                            : "text.secondary",
                        }}
                      >
                        {section.description}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>

        {renderContent()}
      </Box>
    </Box>
  );
}