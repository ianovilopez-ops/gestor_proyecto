import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { createBoard, getBoards } from "../services/boardService.js";

export function BoardsPage() {
  const navigate = useNavigate();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const [form, setForm] = useState({
    name: "",
    area: "",
    description: "",
    status: "Pendiente",
  });

  const loadBoards = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getBoards();
      setBoards(response.boards || []);
    } catch (error) {
      setError(error.message || "No se pudieron cargar los tableros.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const handleCreateBoard = async () => {
    if (!form.name.trim()) return;

    try {
      setSaving(true);
      setError("");

      const response = await createBoard({
        name: form.name.trim(),
        area: form.area.trim() || "General",
        description: form.description.trim(),
        status: form.status,
      });

      setBoards((prev) => [response.board, ...prev]);
      setOpenDialog(false);
      setForm({
        name: "",
        area: "",
        description: "",
        status: "Pendiente",
      });
    } catch (error) {
      setError(error.message || "No se pudo crear el tablero.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4">Tableros</Typography>
          <Typography color="text.secondary">
            Tableros reales conectados al backend.
          </Typography>
        </Box>

        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Nuevo tablero
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Cargando tableros...</Typography>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 3,
          }}
        >
          {boards.map((board) => (
            <Card key={board._id}>
              <CardContent>
                <Typography variant="h6">{board.name}</Typography>
                <Typography color="primary" sx={{ mb: 1 }}>
                  {board.area || "General"}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {board.description || "Sin descripción."}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Miembros: {board.members?.length || 0}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/boards/${board._id}`)}
                >
                  Abrir tablero
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => !saving && setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Crear tablero</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              disabled={saving}
              fullWidth
            />
            <TextField
              label="Área"
              value={form.area}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, area: event.target.value }))
              }
              disabled={saving}
              fullWidth
            />
            <TextField
              label="Descripción"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              disabled={saving}
              multiline
              minRows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateBoard}
            disabled={saving || !form.name.trim()}
          >
            {saving ? "Creando..." : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
