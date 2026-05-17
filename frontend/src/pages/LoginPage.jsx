import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import { loginUser, registerUser, saveSession } from "../services/authService.js";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState(
    location.pathname === "/register" ? "register" : "login"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const isLogin = mode === "login";

  useEffect(() => {
    setMode(location.pathname === "/register" ? "register" : "login");
    setError("");
  }, [location.pathname]);

  function handleModeChange(value) {
    if (loading) return;

    setMode(value);
    setError("");

    navigate(value === "register" ? "/register" : "/login", {
      replace: true,
    });
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = isLogin
        ? await loginUser({
            email: form.email,
            password: form.password,
          })
        : await registerUser({
            name: form.name,
            email: form.email,
            password: form.password,
            role: "Propietario",
          });

      saveSession({
        token: response.token,
        user: response.user,
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setError(error.message || "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 460 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" color="primary" gutterBottom>
            NexusFlow
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {isLogin
              ? "Inicia sesión para acceder a tu workspace."
              : "Crea tu cuenta para comenzar en NexusFlow."}
          </Typography>

          <Tabs
            value={mode}
            onChange={(_, value) => handleModeChange(value)}
            sx={{ mb: 3 }}
          >
            <Tab label="Iniciar sesión" value="login" />
            <Tab label="Registrarse" value="register" />
          </Tabs>

          {loading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Conectando con el servidor...
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {!isLogin && (
                <TextField
                  label="Nombre completo"
                  fullWidth
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  disabled={loading}
                  required
                />
              )}

              <TextField
                label="Correo electrónico"
                type="email"
                fullWidth
                value={form.email}
                onChange={(event) => handleChange("email", event.target.value)}
                disabled={loading}
                required
              />

              <TextField
                label="Contraseña"
                type="password"
                fullWidth
                value={form.password}
                onChange={(event) => handleChange("password", event.target.value)}
                disabled={loading}
                required
              />

              <Button
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={18} color="inherit" /> : null
                }
              >
                {loading
                  ? isLogin
                    ? "Iniciando sesión..."
                    : "Creando cuenta..."
                  : isLogin
                    ? "Iniciar sesión"
                    : "Crear cuenta"}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}