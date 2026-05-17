import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
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
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import GroupsIcon from "@mui/icons-material/Groups";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DownloadIcon from "@mui/icons-material/Download";

import { getCurrentUser } from "../services/authService.js";

import {
  getWorkspaceById,
  addWorkspaceMember,
  removeWorkspaceMember,
} from "../services/workspaceService";

import {
  getBoardsByWorkspace,
  createBoard,
  deleteBoard,
} from "../services/boardService";

import { uploadFile, getFiles, deleteFile } from "../services/fileService";

const FILE_SERVICE_URL = "http://localhost:3004";

export function WorkspaceDetailPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [boards, setBoards] = useState([]);
  const [files, setFiles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [savingBoard, setSavingBoard] = useState(false);
  const [savingMember, setSavingMember] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState("");

  const [openBoardDialog, setOpenBoardDialog] = useState(false);
  const [openMemberDialog, setOpenMemberDialog] = useState(false);

  const [boardForm, setBoardForm] = useState({
    name: "",
    description: "",
    area: "General",
    status: "Pendiente",
  });

  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    role: "Miembro",
  });

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [workspaceData, boardsData, filesData] = await Promise.all([
        getWorkspaceById(workspaceId),
        getBoardsByWorkspace(workspaceId),
        getFiles({
          relatedType: "workspace",
          relatedId: workspaceId,
        }),
      ]);

      setWorkspace(workspaceData.workspace);
      setBoards(boardsData.boards || []);
      setFiles(filesData.files || []);
    } catch (error) {
      console.error(error);
      setError("No se pudo cargar la información del workspace.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBoard() {
    if (!boardForm.name.trim()) return;

    try {
      setSavingBoard(true);
      setError("");

      const data = await createBoard({
        name: boardForm.name.trim(),
        description: boardForm.description.trim(),
        area: boardForm.area.trim() || "General",
        status: boardForm.status || "Pendiente",
        workspaceId,
      });

      setBoards((prev) => [data.board, ...prev]);

      setBoardForm({
        name: "",
        description: "",
        area: "General",
        status: "Pendiente",
      });

      setOpenBoardDialog(false);
    } catch (error) {
      console.error(error);
      setError("No se pudo crear el tablero.");
    } finally {
      setSavingBoard(false);
    }
  }

  async function handleDeleteBoard(boardId) {
    if (!window.confirm("¿Seguro que quieres eliminar este tablero?")) return;

    try {
      setError("");
      await deleteBoard(boardId);
      setBoards((prev) => prev.filter((board) => board._id !== boardId));
    } catch (error) {
      console.error(error);
      setError("No se pudo eliminar el tablero.");
    }
  }

  async function handleAddMember() {
    const name = memberForm.name.trim();
    const email = memberForm.email.trim().toLowerCase();

    if (!name || !email) {
      setError("Nombre y correo son obligatorios.");
      return;
    }

    try {
      setSavingMember(true);
      setError("");

      const roleMap = {
        Miembro: "member",
        Administrador: "admin",
        member: "member",
        admin: "admin",
      };

      const data = await addWorkspaceMember(workspaceId, {
        userId: email,
        name,
        email,
        role: roleMap[memberForm.role] || "member",
      });

      setWorkspace(data.workspace);

      setMemberForm({
        name: "",
        email: "",
        role: "Miembro",
      });

      setOpenMemberDialog(false);
    } catch (error) {
      console.error(error);
      setError(error.message || "No se pudo agregar el miembro.");
    } finally {
      setSavingMember(false);
    }
  }

  async function handleRemoveMember(userId) {
    if (!window.confirm("¿Seguro que quieres quitar este miembro?")) return;

    try {
      setError("");
      const data = await removeWorkspaceMember(workspaceId, userId);
      setWorkspace(data.workspace);
    } catch (error) {
      console.error(error);
      setError("No se pudo eliminar el miembro.");
    }
  }

  async function handleUploadWorkspaceFile(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    try {
      setUploadingFile(true);
      setError("");

      const data = await uploadFile({
        file: selectedFile,
        relatedType: "workspace",
        relatedId: workspaceId,
      });

      setFiles((prev) => [data.file, ...prev]);
    } catch (error) {
      console.error(error);
      setError("No se pudo subir el archivo.");
    } finally {
      setUploadingFile(false);
      event.target.value = "";
    }
  }

  async function handleDeleteFile(fileId) {
    if (!window.confirm("¿Seguro que quieres eliminar este archivo?")) return;

    try {
      setError("");
      await deleteFile(fileId);
      setFiles((prev) => prev.filter((file) => file._id !== fileId));
    } catch (error) {
      console.error(error);
      setError("No se pudo eliminar el archivo.");
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!workspace) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "Workspace no encontrado."}</Alert>
      </Box>
    );
  }

  const currentUser = getCurrentUser();
  const currentUserEmail = currentUser?.email?.toLowerCase() || "";
  const currentUserId = currentUser?.id || "";

  const currentMember = workspace.members?.find((member) => {
    const memberEmail = member.email?.toLowerCase();
    const memberUserId = member.userId;

    return memberEmail === currentUserEmail || memberUserId === currentUserId;
  });

  const currentRole = currentMember?.role || "member";

  const isOwner =
    currentRole === "owner" ||
    currentRole === "Propietario" ||
    workspace.ownerId === currentUserId ||
    workspace.ownerEmail?.toLowerCase() === currentUserEmail;

  const isAdmin =
    isOwner ||
    currentRole === "admin" ||
    currentRole === "Administrador";

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/workspaces")}
        sx={{ mb: 3, textTransform: "none", fontWeight: 800 }}
      >
        Volver a workspaces
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={900}>
            {workspace.name}
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {workspace.description || "Sin descripción."}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              mt: 2,
              flexWrap: "wrap",
            }}
          >
            <Chip label="Activo" color="success" />
            <Chip label={`Dueño: ${workspace.ownerName || "Usuario"}`} />
            <Chip label={`Tu rol: ${isOwner ? "Owner" : currentRole}`} />
            <Chip label={`${workspace.members?.length || 0} miembros`} />
            <Chip label={`${boards.length} tableros`} />
            <Chip label={`${files.length} archivos`} />
          </Stack>
        </Box>

        <Stack direction="row" spacing={1}>
          {isAdmin && (
            <Button
              variant="outlined"
              startIcon={<GroupsIcon />}
              sx={{ borderRadius: 3, fontWeight: 900, textTransform: "none" }}
              onClick={() => setOpenMemberDialog(true)}
            >
              Agregar miembro
            </Button>
          )}

          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ borderRadius: 3, fontWeight: 900, textTransform: "none" }}
              onClick={() => setOpenBoardDialog(true)}
            >
              Crear tablero
            </Button>
          )}
        </Stack>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "7fr 5fr" },
          gap: 3,
        }}
      >
        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <ViewKanbanIcon color="primary" sx={{ fontSize: 42 }} />
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  Tableros del workspace
                </Typography>
                <Typography color="text.secondary">
                  Crea, entra o elimina tableros asociados a este espacio.
                </Typography>
              </Box>
            </Stack>

            {boards.length === 0 ? (
              <Box
                sx={{
                  py: 6,
                  textAlign: "center",
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 4,
                }}
              >
                <Typography fontWeight={900}>No hay tableros todavía</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {isAdmin
                    ? "Crea el primer tablero para este workspace."
                    : "Aún no hay tableros disponibles."}
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {boards.map((board) => (
                  <Card
                    key={board._id || `${board.name}-${board.createdAt}`}
                    variant="outlined"
                    sx={{ borderRadius: 3 }}
                  >
                    <CardContent>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h6" fontWeight={900} noWrap>
                            {board.name}
                          </Typography>

                          <Typography color="text.secondary" noWrap>
                            {board.description || "Sin descripción."}
                          </Typography>

                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Chip size="small" label={board.area || "General"} />
                            <Chip size="small" label={board.status || "Pendiente"} />
                          </Stack>
                        </Box>

                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="contained"
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => navigate(`/boards/${board._id}`)}
                            sx={{ borderRadius: 3, textTransform: "none" }}
                          >
                            Entrar
                          </Button>

                          {isAdmin && (
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteBoard(board._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Box>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <GroupsIcon color="primary" sx={{ fontSize: 42 }} />
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Miembros
                  </Typography>
                  <Typography color="text.secondary">
                    Administra quienes participan en este workspace.
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={1.2}>
                {workspace.members?.map((member) => {
                  const memberRole = member.role || "member";

                  const memberIsOwner =
                    memberRole === "owner" || memberRole === "Propietario";

                  return (
                    <Box
                      key={`${member.userId || member.email}-${member.role}`}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={900} noWrap>
                            {member.name || "Usuario"}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                          >
                            {member.email || "Sin correo"} · {memberRole}
                          </Typography>
                        </Box>

                        {isOwner && !memberIsOwner && (
                          <IconButton
                            color="error"
                            onClick={() =>
                              handleRemoveMember(member.userId || member.email)
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 4, mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Archivos del workspace
                  </Typography>

                  <Typography color="text.secondary">
                    Documentos, evidencias o recursos generales.
                  </Typography>
                </Box>

                {isAdmin && (
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    disabled={uploadingFile}
                    sx={{
                      borderRadius: 3,
                      fontWeight: 800,
                      textTransform: "none",
                      flexShrink: 0,
                    }}
                  >
                    {uploadingFile ? "Subiendo..." : "Subir archivo"}
                    <input
                      hidden
                      type="file"
                      onChange={handleUploadWorkspaceFile}
                    />
                  </Button>
                )}
              </Box>

              {files.length === 0 ? (
                <Box
                  sx={{
                    py: 4,
                    textAlign: "center",
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 4,
                  }}
                >
                  <Typography fontWeight={800}>No hay archivos todavía</Typography>
                </Box>
              ) : (
                <Stack spacing={1.2}>
                  {files.map((file) => (
                    <Box
                      key={file._id}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={900} noWrap>
                          {file.originalName}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {file.size
                            ? `${(file.size / 1024).toFixed(1)} KB`
                            : "Archivo"}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1}>
                        <IconButton
                          component="a"
                          href={`${FILE_SERVICE_URL}/api/files/${file._id}/download`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <DownloadIcon />
                        </IconButton>

                        {isAdmin && (
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteFile(file._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Dialog
        open={openBoardDialog}
        onClose={() => setOpenBoardDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Crear tablero</DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Nombre del tablero"
            value={boardForm.name}
            onChange={(e) =>
              setBoardForm((prev) => ({ ...prev, name: e.target.value }))
            }
            sx={{ mt: 1, mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Descripción"
            value={boardForm.description}
            onChange={(e) =>
              setBoardForm((prev) => ({ ...prev, description: e.target.value }))
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Área"
            value={boardForm.area}
            onChange={(e) =>
              setBoardForm((prev) => ({ ...prev, area: e.target.value }))
            }
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenBoardDialog(false)} disabled={savingBoard}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleCreateBoard}
            disabled={savingBoard || !boardForm.name.trim()}
          >
            {savingBoard ? "Creando..." : "Crear tablero"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openMemberDialog}
        onClose={() => setOpenMemberDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Agregar miembro</DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Nombre"
            value={memberForm.name}
            onChange={(e) =>
              setMemberForm((prev) => ({ ...prev, name: e.target.value }))
            }
            sx={{ mt: 1, mb: 2 }}
          />

          <TextField
            fullWidth
            label="Correo"
            value={memberForm.email}
            onChange={(e) =>
              setMemberForm((prev) => ({ ...prev, email: e.target.value }))
            }
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Rol"
            value={memberForm.role}
            onChange={(e) =>
              setMemberForm((prev) => ({ ...prev, role: e.target.value }))
            }
            helperText="Usa: Miembro o Administrador"
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenMemberDialog(false)} disabled={savingMember}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleAddMember}
            disabled={
              savingMember ||
              !memberForm.name.trim() ||
              !memberForm.email.trim()
            }
          >
            {savingMember ? "Agregando..." : "Agregar miembro"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}