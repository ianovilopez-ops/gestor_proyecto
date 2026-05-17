import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import { getCurrentUser, getToken, logoutUser } from "../services/authService.js";

export function LandingPage() {
  const navigate = useNavigate();

  const token = getToken();
  const currentUser = getCurrentUser();

  function handleLogout() {
    logoutUser();
    navigate("/", { replace: true });
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top left, rgba(139,92,246,.35), transparent 35%), linear-gradient(135deg, #020617 0%, #111827 50%, #1e1b4b 100%)",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 1050,
          borderRadius: 8,
          overflow: "hidden",
          bgcolor: "#0f172a",
          color: "#ffffff",
          border: "1px solid rgba(255,255,255,.12)",
          boxShadow: "0 30px 90px rgba(0,0,0,.45)",
        }}
      >
        <CardContent sx={{ p: { xs: 4, md: 7 } }}>
          <Stack spacing={4}>
            <Chip
              icon={<RocketLaunchIcon />}
              label="NexusFlow"
              sx={{
                alignSelf: "flex-start",
                bgcolor: "#7c3aed",
                color: "#ffffff",
                fontWeight: 900,
                px: 1,
              }}
            />

            <Box>
              <Typography
                variant="h1"
                fontWeight={900}
                sx={{
                  fontSize: { xs: "2.6rem", md: "5rem" },
                  lineHeight: 0.95,
                  maxWidth: 760,
                }}
              >
                Gestión de proyectos inteligente
              </Typography>

              <Typography
                sx={{
                  mt: 3,
                  maxWidth: 720,
                  color: "#cbd5e1",
                  fontSize: { xs: "1rem", md: "1.25rem" },
                }}
              >
                Organiza workspaces, tableros, tareas, archivos, mensajes y
                notificaciones en tiempo real desde una sola plataforma.
              </Typography>
            </Box>

            {token && currentUser ? (
              <Stack spacing={2}>
                <Chip
                  label={`Sesión activa: ${currentUser.name || currentUser.email}`}
                  sx={{
                    alignSelf: "flex-start",
                    borderColor: "#22c55e",
                    color: "#86efac",
                  }}
                  variant="outlined"
                />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    size="large"
                    variant="contained"
                    startIcon={<LoginIcon />}
                    onClick={() => navigate("/dashboard")}
                    sx={{
                      borderRadius: 4,
                      fontWeight: 900,
                      px: 4,
                      bgcolor: "#7c3aed",
                      "&:hover": { bgcolor: "#6d28d9" },
                    }}
                  >
                    Entrar al sistema
                  </Button>

                  <Button
                    size="large"
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                      borderRadius: 4,
                      fontWeight: 900,
                      px: 4,
                    }}
                  >
                    Cambiar cuenta
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  size="large"
                  variant="contained"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate("/login")}
                  sx={{
                    borderRadius: 4,
                    fontWeight: 900,
                    px: 4,
                    bgcolor: "#7c3aed",
                    "&:hover": { bgcolor: "#6d28d9" },
                  }}
                >
                  Iniciar sesión
                </Button>

                <Button
                  size="large"
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  onClick={() => navigate("/register")}
                  sx={{
                    borderRadius: 4,
                    fontWeight: 900,
                    px: 4,
                    borderColor: "#a78bfa",
                    color: "#ddd6fe",
                    "&:hover": {
                      borderColor: "#c4b5fd",
                      bgcolor: "rgba(124,58,237,.12)",
                    },
                  }}
                >
                  Crear cuenta
                </Button>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}