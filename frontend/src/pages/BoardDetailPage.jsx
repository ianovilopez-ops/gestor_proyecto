import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ForumIcon from "@mui/icons-material/Forum";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import RefreshIcon from "@mui/icons-material/Refresh";

import {
  Alert,
  Avatar,
  AvatarGroup,
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
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import {
  addBoardMember,
  getBoardById,
  removeBoardMember,
} from "../services/boardService.js";

import {
  createTask,
  deleteTask,
  getTasksByBoard,
  updateTask,
  updateTaskStatus,
} from "../services/taskService.js";

import { getUsers } from "../services/userService.js";
import { getRealtimeSocket } from "../services/realtimeService.js";

const fallbackColumns = [
  {
    id: "pending",
    title: "Pendiente",
    color: "#f59e0b",
  },
  {
    id: "in_progress",
    title: "En proceso",
    color: "#2563eb",
  },
  {
    id: "done",
    title: "Hecho",
    color: "#10b981",
  },
];

function getPriorityColor(priority) {
  if (priority === "Alta") return "error";
  if (priority === "Media") return "warning";
  return "success";
}

function getStatusLabel(status) {
  if (status === "pending") return "Pendiente";
  if (status === "in_progress") return "En proceso";
  if (status === "done") return "Hecho";
  return status;
}

function getMemberInitial(member) {
  if (member?.name) {
    return member.name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  if (member?.email) {
    return member.email[0]?.toUpperCase() || "U";
  }

  return "U";
}

function normalizeColumns(boardColumns) {
  if (!Array.isArray(boardColumns) || boardColumns.length === 0) {
    return fallbackColumns;
  }

  return boardColumns
    .slice()
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    .map((column) => {
      let color = "#2563eb";

      if (column.id === "pending") color = "#f59e0b";
      if (column.id === "in_progress") color = "#2563eb";
      if (column.id === "done") color = "#10b981";

      return {
        id: column.id,
        title: column.title,
        color,
      };
    });
}

function TaskCard({ task, onOpen }) {
  const taskId = task._id;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: taskId,
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.55 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        cursor: isDragging ? "grabbing" : "grab",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: isDragging
          ? "0 22px 60px rgba(15, 23, 42, 0.22)"
          : "0 10px 30px rgba(15, 23, 42, 0.07)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": {
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.14)",
        },
      }}
      {...listeners}
      {...attributes}
      onDoubleClick={() => onOpen(task)}
    >
      <CardContent sx={{ p: 2.2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 1,
            mb: 1.5,
          }}
        >
          <Chip
            label={task.priority}
            color={getPriorityColor(task.priority)}
            size="small"
          />

          <IconButton
            size="small"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onOpen(task);
            }}
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography fontWeight={900} sx={{ mb: 0.8 }}>
          {task.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            minHeight: 40,
          }}
        >
          {task.description || "Sin descripción."}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            icon={<CalendarMonthIcon />}
            label={task.dueDate || "Sin fecha"}
            size="small"
            variant="outlined"
          />
        </Stack>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
            {task.assignedTo?.initials || "U"}
          </Avatar>

          <Stack direction="row" spacing={1}>
            <Chip
              icon={<ForumIcon />}
              label={task.commentsCount || 0}
              size="small"
              variant="outlined"
            />

            <Chip
              icon={<AttachFileIcon />}
              label={task.filesCount || 0}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

function KanbanColumn({ column, tasks, onOpenTask }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <Box
      ref={setNodeRef}
      sx={(theme) => ({
        minWidth: { xs: 300, md: "auto" },
        bgcolor: isOver
          ? alpha(theme.palette.primary.main, 0.12)
          : "background.paper",
        border: "1px solid",
        borderColor: isOver ? "primary.main" : "divider",
        borderRadius: 5,
        overflow: "hidden",
        transition: "0.2s ease",
      })}
    >
      <Box
        sx={(theme) => ({
          px: 2.5,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.common.white, 0.025)
              : alpha(theme.palette.common.black, 0.025),
        })}
      >
        <Stack
          direction="row"
          spacing={1.2}
          alignItems="center"
          sx={{ minWidth: 0 }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: column.color,
              flexShrink: 0,
            }}
          />

          <Typography
            fontWeight={900}
            sx={{
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {column.title}
          </Typography>
        </Stack>

        <Chip
          label={tasks.length}
          size="small"
          sx={{
            height: 24,
            minWidth: 28,
            borderRadius: 999,
            fontWeight: 900,
            bgcolor: "action.selected",
            color: "text.primary",
            "& .MuiChip-label": {
              px: 1,
            },
          }}
        />
      </Box>

      <Stack
        spacing={2}
        sx={{
          minHeight: 420,
          p: 2,
        }}
      >
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onOpen={onOpenTask} />
        ))}

        {tasks.length === 0 && (
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              minHeight: 120,
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 4,
              color: "text.secondary",
              textAlign: "center",
              px: 2,
            }}
          >
            Suelta tareas aquí
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export function BoardDetailPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [loadingBoard, setLoadingBoard] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [savingTask, setSavingTask] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingTask, setDeletingTask] = useState(false);
  const [error, setError] = useState("");

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [openMemberDialog, setOpenMemberDialog] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState("");

  const [memberForm, setMemberForm] = useState({
    userId: "",
    role: "Miembro",
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "Media",
    dueDate: "",
  });

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "Media",
    dueDate: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns = useMemo(() => {
    return normalizeColumns(board?.columns);
  }, [board]);

  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;

    const completed = tasks.filter((task) => task.status === "done").length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  const tasksByColumn = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.id] = tasks.filter((task) => task.status === column.id);
      return acc;
    }, {});
  }, [columns, tasks]);

  const boardMembers = board?.members?.length ? board.members : [];
  const loading = loadingBoard || loadingTasks;

  const availableUsers = users.filter((user) => {
    const userId = user._id || user.id;

    return !boardMembers.some(
      (member) => member.userId === userId || member.email === user.email
    );
  });

  const emitRealtimeEvent = (eventName, payload) => {
    const socket = getRealtimeSocket();

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(eventName, payload);
  };

  const loadBoard = async () => {
    try {
      setLoadingBoard(true);
      setError("");

      const response = await getBoardById(boardId);

      setBoard(response.board);
    } catch (error) {
      setError(error.message || "No se pudo cargar el tablero.");
    } finally {
      setLoadingBoard(false);
    }
  };

  const loadTasks = async () => {
    try {
      setLoadingTasks(true);

      const response = await getTasksByBoard(boardId);

      setTasks(response.tasks || []);
    } catch (error) {
      setError(error.message || "No se pudieron cargar las tareas.");
    } finally {
      setLoadingTasks(false);
    }
  };

  const loadAll = async () => {
    await Promise.all([loadBoard(), loadTasks()]);
  };

  useEffect(() => {
    loadAll();
  }, [boardId]);

  useEffect(() => {
    const socket = getRealtimeSocket();

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join-board", boardId);

    const handleJoinedBoard = (payload) => {
      console.log("Socket conectado al tablero:", payload);
    };

    const handleTaskCreated = ({ boardId: payloadBoardId, task }) => {
      if (payloadBoardId !== boardId || !task) return;

      setTasks((prevTasks) => {
        const alreadyExists = prevTasks.some(
          (currentTask) => currentTask._id === task._id
        );

        if (alreadyExists) return prevTasks;

        return [task, ...prevTasks];
      });
    };

    const handleTaskUpdated = ({ boardId: payloadBoardId, task }) => {
      if (payloadBoardId !== boardId || !task) return;

      setTasks((prevTasks) =>
        prevTasks.map((currentTask) =>
          currentTask._id === task._id ? task : currentTask
        )
      );
    };

    const handleTaskMoved = ({ boardId: payloadBoardId, task }) => {
      if (payloadBoardId !== boardId || !task) return;

      setTasks((prevTasks) =>
        prevTasks.map((currentTask) =>
          currentTask._id === task._id ? task : currentTask
        )
      );
    };

    const handleTaskDeleted = ({ boardId: payloadBoardId, taskId }) => {
      if (payloadBoardId !== boardId || !taskId) return;

      setTasks((prevTasks) =>
        prevTasks.filter((currentTask) => currentTask._id !== taskId)
      );
    };

    socket.on("joined-board", handleJoinedBoard);
    socket.on("task-created", handleTaskCreated);
    socket.on("task-updated", handleTaskUpdated);
    socket.on("task-moved", handleTaskMoved);
    socket.on("task-deleted", handleTaskDeleted);

    return () => {
      socket.emit("leave-board", boardId);

      socket.off("joined-board", handleJoinedBoard);
      socket.off("task-created", handleTaskCreated);
      socket.off("task-updated", handleTaskUpdated);
      socket.off("task-moved", handleTaskMoved);
      socket.off("task-deleted", handleTaskDeleted);
    };
  }, [boardId]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    const validColumn = columns.some((column) => column.id === newStatus);

    if (!validColumn) return;

    const currentTask = tasks.find((task) => task._id === taskId);

    if (!currentTask || currentTask.status === newStatus) return;

    const previousTasks = tasks;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId
          ? {
              ...task,
              status: newStatus,
            }
          : task
      )
    );

    try {
      const response = await updateTaskStatus(taskId, {
        status: newStatus,
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskId ? response.task : task))
      );

      emitRealtimeEvent("task-moved", {
        boardId,
        task: response.task,
      });
    } catch (error) {
      setTasks(previousTasks);
      setError(error.message || "No se pudo mover la tarea.");
    }
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    if (savingTask) return;

    setOpenCreateDialog(false);
    setForm({
      title: "",
      description: "",
      status: "pending",
      priority: "Media",
      dueDate: "",
    });
  };

  const handleCreateTask = async () => {
    if (!form.title.trim()) return;

    try {
      setSavingTask(true);
      setError("");

      const response = await createTask({
        boardId,
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate.trim() || "Sin fecha",
      });

      setTasks((prevTasks) => [response.task, ...prevTasks]);

      emitRealtimeEvent("task-created", {
        boardId,
        task: response.task,
      });

      handleCloseCreateDialog();
    } catch (error) {
      setError(error.message || "No se pudo crear la tarea.");
    } finally {
      setSavingTask(false);
    }
  };

  const handleOpenTask = (task) => {
    setSelectedTask(task);

    setEditForm({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "pending",
      priority: task.priority || "Media",
      dueDate: task.dueDate || "",
    });
  };

  const handleCloseTaskDialog = () => {
    if (savingEdit || deletingTask) return;

    setSelectedTask(null);
    setEditForm({
      title: "",
      description: "",
      status: "pending",
      priority: "Media",
      dueDate: "",
    });
  };

  const handleUpdateSelectedTask = async () => {
    if (!selectedTask || !editForm.title.trim()) return;

    try {
      setSavingEdit(true);
      setError("");

      const response = await updateTask(selectedTask._id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        status: editForm.status,
        priority: editForm.priority,
        dueDate: editForm.dueDate.trim() || "Sin fecha",
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === selectedTask._id ? response.task : task
        )
      );

      setSelectedTask(response.task);

      emitRealtimeEvent("task-updated", {
        boardId,
        task: response.task,
      });
    } catch (error) {
      setError(error.message || "No se pudo actualizar la tarea.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteSelectedTask = async () => {
    if (!selectedTask) return;

    const confirmDelete = window.confirm(
      `¿Eliminar la tarea "${selectedTask.title}"?`
    );

    if (!confirmDelete) return;

    try {
      setDeletingTask(true);
      setError("");

      const deletedTaskId = selectedTask._id;

      await deleteTask(deletedTaskId);

      setTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== deletedTaskId)
      );

      emitRealtimeEvent("task-deleted", {
        boardId,
        taskId: deletedTaskId,
      });

      handleCloseTaskDialog();
    } catch (error) {
      setError(error.message || "No se pudo eliminar la tarea.");
    } finally {
      setDeletingTask(false);
    }
  };

  const loadUsersForBoard = async () => {
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

  const handleOpenMemberDialog = async () => {
    setOpenMemberDialog(true);
    setMemberForm({
      userId: "",
      role: "Miembro",
    });

    await loadUsersForBoard();
  };

  const handleCloseMemberDialog = () => {
    if (addingMember) return;

    setOpenMemberDialog(false);
    setMemberForm({
      userId: "",
      role: "Miembro",
    });
  };

  const handleAddMemberToBoard = async () => {
    if (!memberForm.userId) return;

    const selectedUser = users.find(
      (user) => (user._id || user.id) === memberForm.userId
    );

    if (!selectedUser) return;

    try {
      setAddingMember(true);
      setError("");

      const response = await addBoardMember(boardId, {
        userId: selectedUser._id || selectedUser.id,
        name: selectedUser.name,
        email: selectedUser.email,
        role: memberForm.role,
      });

      setBoard(response.board);
      handleCloseMemberDialog();
    } catch (error) {
      setError(error.message || "No se pudo agregar el miembro.");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMemberFromBoard = async (member) => {
    const userId = member.userId;

    if (!userId) return;

    const confirmRemove = window.confirm(
      `¿Quitar a ${member.name || member.email} de este tablero?`
    );

    if (!confirmRemove) return;

    try {
      setRemovingMemberId(userId);
      setError("");

      const response = await removeBoardMember(boardId, userId);

      setBoard(response.board);
    } catch (error) {
      setError(error.message || "No se pudo quitar el miembro.");
    } finally {
      setRemovingMemberId("");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: "center", py: 7 }}>
          <CircularProgress sx={{ mb: 2 }} />

          <Typography variant="h6">Cargando tablero y tareas...</Typography>

          <Typography color="text.secondary">
            Consultando MongoDB Atlas mediante microservicios.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error && !board) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/boards")}
          sx={{ mb: 2 }}
        >
          Volver a tableros
        </Button>

        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={loadAll}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!board) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/boards")}
          sx={{ mb: 2 }}
        >
          Volver a tableros
        </Button>

        <Alert severity="warning">No se encontró el tablero solicitado.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/boards")}
            sx={{ mb: 1 }}
          >
            Volver a tableros
          </Button>

          <Typography variant="h4" sx={{ mb: 1 }}>
            {board.name}
          </Typography>

          <Typography color="text.secondary">
            {board.description || "Gestiona tareas por estado con vista Kanban."}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
            <Chip label={board.area || "General"} color="primary" />
            <Chip label={board.status || "Pendiente"} variant="outlined" />
            <Chip
              label={`Creado por: ${board.createdBy || "Usuario"}`}
              variant="outlined"
            />
          </Stack>
        </Box>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Actualizar tablero y tareas">
            <IconButton onClick={loadAll}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            size="large"
            onClick={handleOpenMemberDialog}
          >
            Agregar miembro
          </Button>

          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Nueva tarea
          </Button>
        </Stack>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr" },
            gap: 3,
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h6">Avance del tablero</Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Progreso calculado con base en tareas reales marcadas como hechas.
            </Typography>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={(theme) => ({
                height: 12,
                borderRadius: 99,
                bgcolor: alpha(theme.palette.primary.main, 0.14),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 99,
                },
              })}
            />

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {progress}% completado
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "flex-start", md: "flex-end" },
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box>
              <Typography fontWeight={800}>Miembros activos</Typography>
              <Typography variant="body2" color="text.secondary">
                Integrantes asociados al tablero
              </Typography>
            </Box>

            <Stack spacing={1} alignItems={{ xs: "flex-start", md: "flex-end" }}>
              <AvatarGroup max={4}>
                {boardMembers.length > 0 ? (
                  boardMembers.map((member, index) => (
                    <Avatar
                      key={`${member.email}-${index}`}
                      sx={{ bgcolor: "primary.main" }}
                      title={`${member.name || member.email} - ${
                        member.role || "Miembro"
                      }`}
                    >
                      {getMemberInitial(member)}
                    </Avatar>
                  ))
                ) : (
                  <Avatar sx={{ bgcolor: "primary.main" }}>U</Avatar>
                )}
              </AvatarGroup>

              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                justifyContent="flex-end"
              >
                {boardMembers.map((member) => (
                  <Chip
                    key={member.userId || member.email}
                    label={`${member.name || member.email} · ${
                      member.role || "Miembro"
                    }`}
                    size="small"
                    variant="outlined"
                    onDelete={
                      boardMembers.length > 1
                        ? () => handleRemoveMemberFromBoard(member)
                        : undefined
                    }
                    disabled={removingMemberId === member.userId}
                  />
                ))}
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(3, 300px)",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: 3,
            overflowX: { xs: "auto", md: "visible" },
            pb: 2,
          }}
        >
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasksByColumn[column.id] || []}
              onOpenTask={handleOpenTask}
            />
          ))}
        </Box>
      </DndContext>

      <Dialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Crear nueva tarea</DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Título de la tarea"
              fullWidth
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  title: event.target.value,
                }))
              }
              disabled={savingTask}
            />

            <TextField
              label="Descripción"
              fullWidth
              multiline
              minRows={3}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              disabled={savingTask}
            />

            <TextField
              label="Estado"
              select
              fullWidth
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  status: event.target.value,
                }))
              }
              disabled={savingTask}
            >
              {columns.map((column) => (
                <MenuItem key={column.id} value={column.id}>
                  {column.title}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Prioridad"
              select
              fullWidth
              value={form.priority}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  priority: event.target.value,
                }))
              }
              disabled={savingTask}
            >
              <MenuItem value="Alta">Alta</MenuItem>
              <MenuItem value="Media">Media</MenuItem>
              <MenuItem value="Baja">Baja</MenuItem>
            </TextField>

            <TextField
              label="Fecha límite"
              fullWidth
              placeholder="Ejemplo: Hoy, Mañana, Viernes"
              value={form.dueDate}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  dueDate: event.target.value,
                }))
              }
              disabled={savingTask}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseCreateDialog} disabled={savingTask}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleCreateTask}
            disabled={savingTask || !form.title.trim()}
            startIcon={
              savingTask ? <CircularProgress size={18} color="inherit" /> : null
            }
          >
            {savingTask ? "Creando..." : "Crear tarea"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(selectedTask)}
        onClose={handleCloseTaskDialog}
        fullWidth
        maxWidth="sm"
      >
        {selectedTask && (
          <>
            <DialogTitle>Editar tarea</DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  label="Título de la tarea"
                  fullWidth
                  value={editForm.title}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  disabled={savingEdit || deletingTask}
                />

                <TextField
                  label="Descripción"
                  fullWidth
                  multiline
                  minRows={3}
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  disabled={savingEdit || deletingTask}
                />

                <TextField
                  label="Estado"
                  select
                  fullWidth
                  value={editForm.status}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      status: event.target.value,
                    }))
                  }
                  disabled={savingEdit || deletingTask}
                >
                  {columns.map((column) => (
                    <MenuItem key={column.id} value={column.id}>
                      {column.title}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Prioridad"
                  select
                  fullWidth
                  value={editForm.priority}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      priority: event.target.value,
                    }))
                  }
                  disabled={savingEdit || deletingTask}
                >
                  <MenuItem value="Alta">Alta</MenuItem>
                  <MenuItem value="Media">Media</MenuItem>
                  <MenuItem value="Baja">Baja</MenuItem>
                </TextField>

                <TextField
                  label="Fecha límite"
                  fullWidth
                  placeholder="Ejemplo: Hoy, Mañana, Viernes"
                  value={editForm.dueDate}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      dueDate: event.target.value,
                    }))
                  }
                  disabled={savingEdit || deletingTask}
                />

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    bgcolor: "background.default",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography fontWeight={800} sx={{ mb: 1 }}>
                    Información de la tarea
                  </Typography>

                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      label={`Estado actual: ${getStatusLabel(
                        selectedTask.status
                      )}`}
                      variant="outlined"
                    />

                    <Chip
                      label={`Responsable: ${
                        selectedTask.assignedTo?.name || "Usuario"
                      }`}
                      variant="outlined"
                    />

                    <Chip
                      label={`Creada: ${
                        selectedTask.createdAt
                          ? new Date(
                              selectedTask.createdAt
                            ).toLocaleDateString("es-MX")
                          : "Sin fecha"
                      }`}
                      variant="outlined"
                    />
                  </Stack>
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions
              sx={{
                px: 3,
                pb: 3,
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Button
                color="error"
                onClick={handleDeleteSelectedTask}
                disabled={savingEdit || deletingTask}
              >
                {deletingTask ? "Eliminando..." : "Eliminar"}
              </Button>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  onClick={handleCloseTaskDialog}
                  disabled={savingEdit || deletingTask}
                >
                  Cancelar
                </Button>

                <Button
                  variant="contained"
                  onClick={handleUpdateSelectedTask}
                  disabled={savingEdit || deletingTask || !editForm.title.trim()}
                  startIcon={
                    savingEdit ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : null
                  }
                >
                  {savingEdit ? "Guardando..." : "Guardar cambios"}
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={openMemberDialog}
        onClose={handleCloseMemberDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Agregar miembro al tablero</DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {loadingUsers ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography>Cargando usuarios...</Typography>
              </Box>
            ) : (
              <>
                <TextField
                  label="Usuario"
                  select
                  fullWidth
                  value={memberForm.userId}
                  onChange={(event) =>
                    setMemberForm((prev) => ({
                      ...prev,
                      userId: event.target.value,
                    }))
                  }
                  disabled={addingMember}
                  helperText={
                    availableUsers.length === 0
                      ? "Todos los usuarios ya pertenecen a este tablero."
                      : "Selecciona un usuario registrado."
                  }
                >
                  {availableUsers.map((user) => (
                    <MenuItem
                      key={user._id || user.id}
                      value={user._id || user.id}
                    >
                      {user.name} · {user.email} · {user.role}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Rol en el tablero"
                  select
                  fullWidth
                  value={memberForm.role}
                  onChange={(event) =>
                    setMemberForm((prev) => ({
                      ...prev,
                      role: event.target.value,
                    }))
                  }
                  disabled={addingMember}
                >
                  <MenuItem value="Propietario">Propietario</MenuItem>
                  <MenuItem value="Administrador">Administrador</MenuItem>
                  <MenuItem value="Miembro">Miembro</MenuItem>
                  <MenuItem value="Observador">Observador</MenuItem>
                </TextField>
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseMemberDialog} disabled={addingMember}>
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={handleAddMemberToBoard}
            disabled={
              addingMember ||
              loadingUsers ||
              !memberForm.userId ||
              availableUsers.length === 0
            }
            startIcon={
              addingMember ? <CircularProgress size={18} color="inherit" /> : null
            }
          >
            {addingMember ? "Agregando..." : "Agregar miembro"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}