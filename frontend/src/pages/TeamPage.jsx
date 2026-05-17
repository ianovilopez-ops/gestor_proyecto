import { useEffect, useMemo, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";

import {
  Alert,
  Avatar,
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

import { getCurrentUser } from "../services/authService.js";
import { createUser, deleteUser, getUsers } from "../services/userService.js";

function getInitials(name = "", email = "") {
  const base = name || email || "Usuario";

  return base
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getRoleColor(role) {
  if (role === "Propietario") return "primary";
  if (role === "Administrador") return "secondary";
  if (role === "Miembro") return "success";
  return "default";
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

export function TeamPage() {
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id || currentUser?._id;
  const currentUserRole = currentUser?.role || "Miembro";

  const canDeleteUsers =
    currentUserRole === "Propietario" || currentUserRole === "Administrador";

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [openDialog, setOpenDialog] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "123456",
    role: "Miembro",
  });

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      setError("");

      const response = await getUsers();

      setUsers(response.users || []);
    } catch (error) {
      setError(error.message || "No se pudieron cargar los usuarios.");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const text = `${user.name} ${user.email} ${user.role}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesRole = roleFilter === "Todos" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      owners: users.filter((user) => user.role === "Propietario").length,
      admins: users.filter((user) => user.role === "Administrador").length,
      members: users.filter((user) => user.role === "Miembro").length,
    };
  }, [users]);

  const handleOpenDialog = () => {
    setSuccessMessage("");
    setError("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    if (savingUser) return;

    setOpenDialog(false);
    setForm({
      name: "",
      email: "",
      password: "123456",
      role: "Miembro",
    });
  };

  const handleCreateUser = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return;

    try {
      setSavingUser(true);
      setError("");
      setSuccessMessage("");

      const response = await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
        role: form.role,
      });

      setUsers((prevUsers) => [response.user, ...prevUsers]);
      setSuccessMessage("Usuario creado correctamente.");
      handleCloseDialog();
    } catch (error) {
      setError(error.message || "No se pudo crear el usuario.");
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!userId) return;

    if (String(currentUserId) === String(userId)) {
      setError("No puedes eliminar tu propio usuario.");
      return;
    }

    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar este usuario?"
    );

    if (!confirmed) return;

    try {
      setDeletingUserId(userId);
      setError("");
      setSuccessMessage("");

      await deleteUser(userId);

      setUsers((prevUsers) =>
        prevUsers.filter((user) => String(user._id || user.id) !== String(userId))
      );

      setSuccessMessage("Usuario eliminado correctamente.");
    } catch (error) {
      setError(error.message || "No se pudo eliminar el usuario.");
    } finally {
      setDeletingUserId("");
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
            Equipo
          </Typography>

          <Typography color="text.secondary">
            Usuarios registrados en NexusFlow conectados a MongoDB Atlas.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Actualizar usuarios">
            <span>
              <IconButton onClick={loadUsers} disabled={loadingUsers}>
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
            Nuevo usuario
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography color="text.secondary">Usuarios</Typography>
            <Typography variant="h4">{stats.total}</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="text.secondary">Propietarios</Typography>
            <Typography variant="h4">{stats.owners}</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="text.secondary">Administradores</Typography>
            <Typography variant="h4">{stats.admins}</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="text.secondary">Miembros</Typography>
            <Typography variant="h4">{stats.members}</Typography>
          </CardContent>
        </Card>
      </Box>

      {loadingUsers && <LinearProgress sx={{ mb: 2 }} />}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 220px" },
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            fullWidth
            placeholder="Buscar por nombre, correo o rol..."
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
            <InputLabel>Rol</InputLabel>
            <Select
              label="Rol"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <MenuItem value="Todos">Todos</MenuItem>
              <MenuItem value="Propietario">Propietario</MenuItem>
              <MenuItem value="Administrador">Administrador</MenuItem>
              <MenuItem value="Miembro">Miembro</MenuItem>
              <MenuItem value="Observador">Observador</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {loadingUsers ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 7 }}>
            <CircularProgress sx={{ mb: 2 }} />

            <Typography variant="h6">Cargando usuarios...</Typography>

            <Typography color="text.secondary">
              Consultando Auth Service mediante API Gateway.
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
            {filteredUsers.map((user) => {
              const userId = user._id || user.id;
              const isCurrentUser = String(currentUserId) === String(userId);

              return (
                <Card
                  key={userId}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 18px 45px rgba(15, 23, 42, 0.14)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Avatar
                        sx={(theme) => ({
                          width: 56,
                          height: 56,
                          bgcolor: alpha(theme.palette.primary.main, 0.14),
                          color: "primary.main",
                          fontWeight: 900,
                        })}
                      >
                        {getInitials(user.name, user.email)}
                      </Avatar>

                      <Box
                        sx={{
                          minWidth: 0,
                          flex: 1,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 1,
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h6" noWrap>
                            {user.name}
                          </Typography>

                          <Stack
                            direction="row"
                            spacing={0.8}
                            alignItems="center"
                          >
                            <AlternateEmailIcon fontSize="small" color="action" />

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                            >
                              {user.email}
                            </Typography>
                          </Stack>
                        </Box>

                        {canDeleteUsers && !isCurrentUser && (
                          <Tooltip title="Eliminar usuario">
                            <span>
                              <IconButton
                                color="error"
                                disabled={deletingUserId === userId}
                                onClick={() => handleDeleteUser(userId)}
                              >
                                {deletingUserId === userId ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <DeleteIcon />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        mb: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Chip
                        label={user.role || "Miembro"}
                        color={getRoleColor(user.role)}
                        size="small"
                      />

                      <Chip
                        label={user.status || "Activo"}
                        variant="outlined"
                        size="small"
                      />
                    </Stack>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 4,
                        bgcolor: "background.default",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <PersonIcon color="action" />

                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Registrado
                          </Typography>

                          <Typography fontWeight={800}>
                            {formatDate(user.createdAt)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          {filteredUsers.length === 0 && (
            <Card>
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <GroupsIcon color="action" sx={{ fontSize: 48, mb: 1 }} />

                <Typography variant="h6">No se encontraron usuarios</Typography>

                <Typography color="text.secondary">
                  Intenta con otra búsqueda o registra un nuevo usuario.
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
        <DialogTitle>Crear nuevo usuario</DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre completo"
              fullWidth
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              disabled={savingUser}
            />

            <TextField
              label="Correo electrónico"
              type="email"
              fullWidth
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  email: event.target.value,
                }))
              }
              disabled={savingUser}
            />

            <TextField
              label="Contraseña temporal"
              type="password"
              fullWidth
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  password: event.target.value,
                }))
              }
              disabled={savingUser}
              helperText="El usuario podrá iniciar sesión con esta contraseña."
            />

            <FormControl fullWidth disabled={savingUser}>
              <InputLabel>Rol</InputLabel>

              <Select
                label="Rol"
                value={form.role}
                onChange={(event) =>
                  setForm((prev) => ({
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
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} disabled={savingUser}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleCreateUser}
            disabled={
              savingUser ||
              !form.name.trim() ||
              !form.email.trim() ||
              !form.password.trim()
            }
            startIcon={
              savingUser ? <CircularProgress size={18} color="inherit" /> : null
            }
          >
            {savingUser ? "Creando..." : "Crear usuario"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}