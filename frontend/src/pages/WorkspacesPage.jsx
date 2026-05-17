import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import BusinessIcon from "@mui/icons-material/Business";
import GroupsIcon from "@mui/icons-material/Groups";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  createWorkspace,
  getWorkspaces,
  deleteWorkspace,
} from "../services/workspaceService";

export function WorkspacesPage() {
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    loadWorkspaces();
  }, []);

  async function loadWorkspaces() {
    try {
      setLoading(true);
      setError("");

      const data = await getWorkspaces();
      setWorkspaces(data.workspaces || []);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar los workspaces.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateWorkspace() {
    if (!form.name.trim()) {
      setError("El nombre del workspace es obligatorio.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = await createWorkspace({
        name: form.name.trim(),
        description: form.description.trim(),
      });

      setWorkspaces((prev) => [data.workspace, ...prev]);

      setForm({
        name: "",
        description: "",
      });

      setOpen(false);
    } catch (error) {
      console.error(error);
      setError("No se pudo crear el workspace.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteWorkspace(workspace) {
    const confirmDelete = window.confirm(
      `¿Seguro que quieres eliminar el workspace "${workspace.name}"?`
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(workspace._id);
      setError("");

      await deleteWorkspace(workspace._id);

      setWorkspaces((prev) =>
        prev.filter((item) => item._id !== workspace._id)
      );
    } catch (error) {
      console.error(error);
      setError(
        error.message ||
          "No se pudo eliminar el workspace. Solo el dueño puede eliminarlo."
      );
    } finally {
      setDeletingId("");
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Workspaces
          </Typography>

          <Typography color="text.secondary">
            Organiza proyectos, equipos y tableros
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{
            borderRadius: 3,
            fontWeight: 900,
            textTransform: "none",
          }}
        >
          Nuevo Workspace
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 8,
          }}
        >
          <CircularProgress />
        </Box>
      ) : workspaces.length === 0 ? (
        <Alert severity="info">
          No tienes workspaces todavía. Crea uno o pide que te agreguen como
          miembro.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {workspaces.map((workspace) => (
            <Grid item xs={12} md={6} lg={4} key={workspace._id}>
              <Card
                sx={{
                  borderRadius: 5,
                  transition: "0.25s",
                  height: "100%",
                  position: "relative",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 25px 45px rgba(0,0,0,.12)",
                  },
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        width: 52,
                        height: 52,
                      }}
                    >
                      <BusinessIcon />
                    </Avatar>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label="Activo" color="success" size="small" />

                      <IconButton
                        color="error"
                        disabled={deletingId === workspace._id}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteWorkspace(workspace);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Typography variant="h6" fontWeight={900}>
                    {workspace.name}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      minHeight: 55,
                    }}
                  >
                    {workspace.description || "Sin descripción"}
                  </Typography>

                  <Stack spacing={1} sx={{ mt: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <GroupsIcon fontSize="small" />

                      <Typography variant="body2">
                        {workspace.members?.length || 0} miembros
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <DashboardIcon fontSize="small" />

                      <Typography variant="body2">Boards: 0</Typography>
                    </Stack>
                  </Stack>

                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      mt: 3,
                      borderRadius: 3,
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/workspaces/${workspace._id}`);
                    }}
                  >
                    Entrar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Crear Workspace</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Nombre"
            sx={{ mt: 2 }}
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
          />

          <TextField
            fullWidth
            multiline
            minRows={3}
            sx={{ mt: 2 }}
            label="Descripción"
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>

          <Button
            variant="contained"
            onClick={handleCreateWorkspace}
            disabled={saving}
          >
            {saving ? "Creando..." : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}