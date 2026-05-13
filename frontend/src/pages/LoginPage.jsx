import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import { loginUser, registerUser, saveSession } from "../services/authService.js";

export function LoginPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "ian@test.com",
    password: "123456",
    role: "Miembro",
  });

  const isLogin = mode === "login";

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
            role: form.role,
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
            Accede a tu workspace colaborativo.
          </Typography>

          <Tabs
            value={mode}
            onChange={(_, value) => {
              if (loading) return;
              setMode(value);
              setError("");
            }}
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
                onChange={(event) =>
                  handleChange("password", event.target.value)
                }
                disabled={loading}
                required
              />

              {!isLogin && (
                <FormControl fullWidth disabled={loading}>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    label="Rol"
                    value={form.role}
                    onChange={(event) =>
                      handleChange("role", event.target.value)
                    }
                  >
                    <MenuItem value="Propietario">Propietario</MenuItem>
                    <MenuItem value="Administrador">Administrador</MenuItem>
                    <MenuItem value="Miembro">Miembro</MenuItem>
                    <MenuItem value="Observador">Observador</MenuItem>
                  </Select>
                </FormControl>
              )}

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
