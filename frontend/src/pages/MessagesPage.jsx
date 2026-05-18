import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

import messageService from "../services/messageService";
import { getUsers } from "../services/teamService";
import { getCurrentUser } from "../services/authService";
import { connectSocket } from "../services/socketService";
import { createNotification } from "../services/notificationService.js";

export default function MessagesPage() {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const currentUserId = currentUser?._id || currentUser?.id;

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const socket = connectSocket();

    socket.emit("join-user", currentUserId);

    socket.on("message:new", (message) => {
      const isCurrentConversation =
        selectedUser &&
        (String(message.senderId) === String(selectedUser._id) ||
          String(message.receiverId) === String(selectedUser._id));

      if (isCurrentConversation) {
        setMessages((prev) => {
          const exists = prev.some(
            (item) =>
              item._id &&
              message._id &&
              String(item._id) === String(message._id)
          );

          return exists ? prev : [...prev, message];
        });
      }

      loadConversations();
    });

    return () => {
      socket.off("message:new");
      socket.emit("leave-user", currentUserId);
    };
  }, [selectedUser, currentUserId]);

  async function loadConversations() {
    try {
      setLoadingConversations(true);
      setError("");

      const [conversationsData, usersData] = await Promise.all([
        messageService.getConversations().catch(() => ({ conversations: [] })),
        getUsers(),
      ]);

      const conversationsList = conversationsData.conversations || [];
      const usersList = usersData.users || [];

      const normalizedUsers = usersList.map((user) => ({
        _id: user._id || user.id,
        name: user.name || user.email || "Usuario",
        email: user.email || "Sin correo",
      }));

      const merged = [...conversationsList, ...normalizedUsers]
        .filter((user) => user._id)
        .filter((user) => String(user._id) !== String(currentUserId))
        .filter(
          (user, index, self) =>
            index ===
            self.findIndex((item) => String(item._id) === String(user._id))
        );

      setConversations(merged);
    } catch (error) {
      console.error("Error cargando usuarios/conversaciones:", error);
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoadingConversations(false);
    }
  }

  async function loadMessages(user) {
    try {
      setSelectedUser(user);
      setLoadingMessages(true);
      setError("");

      const data = await messageService.getMessages(user._id || user.id);
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error cargando mensajes:", error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !selectedUser) return;

    const content = newMessage.trim();
    const receiverId = selectedUser._id || selectedUser.id;

    try {
      setError("");
      setNewMessage("");

      const response = await messageService.sendMessage(selectedUser, content);

      const savedMessage =
        response.data ||
        response.message || {
          _id: crypto.randomUUID(),
          senderId: currentUserId,
          senderName: currentUser?.name || "Yo",
          senderEmail: currentUser?.email || "",
          receiverId,
          receiverName: selectedUser.name,
          receiverEmail: selectedUser.email,
          content,
          createdAt: new Date().toISOString(),
        };

      setMessages((prev) => {
        const exists = prev.some(
          (item) =>
            item._id &&
            savedMessage._id &&
            String(item._id) === String(savedMessage._id)
        );

        return exists ? prev : [...prev, savedMessage];
      });

      const socket = connectSocket();

      socket.emit("message:send", savedMessage);

      try {
        const notificationResponse = await createNotification({
          userId: receiverId,
          title: "Mensaje nuevo",
          message: `${currentUser?.name || "Alguien"} te envió un mensaje.`,
          type: "message",
          priority: "Media",
          relatedType: "message",
          relatedId: savedMessage._id,
          metadata: {
            senderId: currentUserId,
            senderName: currentUser?.name || "Usuario",
            receiverId,
          },
        });

        const createdNotification =
          notificationResponse.notification ||
          notificationResponse.data ||
          notificationResponse.notificationCreated;

        if (createdNotification) {
          socket.emit("notification-created", {
            userId: receiverId,
            notification: createdNotification,
          });
        }
      } catch (notificationError) {
        console.error("Error creando notificación:", notificationError);
      }

      await loadConversations();
    } catch (error) {
      console.error("Respuesta backend:", error.response?.data);
      console.error("Usuario seleccionado:", selectedUser);

      setNewMessage(content);
      setError(error.response?.data?.message || "No se pudo enviar el mensaje.");
    }
  }

  return (
    <Box
      sx={{
        height: "calc(100vh - 90px)",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "330px 1fr" },
        gap: 2,
        p: 2,
        bgcolor: "#020617",
        color: "#f8fafc",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid rgba(255,255,255,0.14)",
          bgcolor: "#0f172a",
          color: "#f8fafc",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Typography variant="h5" fontWeight={900}>
            Mensajes
          </Typography>

          <Typography variant="body2" sx={{ color: "#cbd5e1" }}>
            Usuarios y conversaciones del equipo
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />

        <List sx={{ overflowY: "auto", flex: 1, p: 1 }}>
          {loadingConversations ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : conversations.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography sx={{ color: "#cbd5e1" }}>
                No hay usuarios disponibles.
              </Typography>
            </Box>
          ) : (
            conversations.map((conversation) => (
              <ListItemButton
                key={conversation._id}
                selected={selectedUser?._id === conversation._id}
                onClick={() => loadMessages(conversation)}
                sx={{
                  borderRadius: 4,
                  mb: 1,
                  color: "#f8fafc",
                  "&.Mui-selected": {
                    bgcolor: "#7c3aed",
                    color: "#ffffff",
                  },
                  "&.Mui-selected:hover": {
                    bgcolor: "#6d28d9",
                  },
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ fontWeight: 900, bgcolor: "#475569" }}>
                    {conversation.name?.charAt(0)?.toUpperCase() || "U"}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Typography fontWeight={800} noWrap>
                      {conversation.name || "Usuario"}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ color: "#cbd5e1" }} noWrap>
                      {conversation.email || "Sin correo"}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid rgba(255,255,255,0.14)",
          bgcolor: "#0f172a",
          color: "#f8fafc",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {!selectedUser ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              p: 4,
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight={900}>
                Selecciona un usuario
              </Typography>

              <Typography sx={{ color: "#cbd5e1", mt: 1 }}>
                Elige una persona para iniciar un chat.
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                borderBottom: "1px solid rgba(255,255,255,0.12)",
                bgcolor: "#111827",
              }}
            >
              <Avatar sx={{ fontWeight: 900, bgcolor: "#475569" }}>
                {selectedUser.name?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>

              <Box>
                <Typography fontWeight={900}>
                  {selectedUser.name || "Usuario"}
                </Typography>

                <Typography variant="body2" sx={{ color: "#cbd5e1" }}>
                  {selectedUser.email || "Sin correo"}
                </Typography>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ borderRadius: 0 }}>
                {error}
              </Alert>
            )}

            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                p: 2,
                bgcolor: "#020617",
                display: "flex",
                flexDirection: "column",
                gap: 1.2,
              }}
            >
              {loadingMessages ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : messages.length === 0 ? (
                <Box sx={{ textAlign: "center", mt: 5 }}>
                  <Typography sx={{ color: "#94a3b8" }}>
                    Todavía no hay mensajes. Envía el primero.
                  </Typography>
                </Box>
              ) : (
                messages.map((message) => {
                  const isMine =
                    String(message.senderId) === String(currentUserId);

                  const messageKey =
                    message._id ||
                    `${message.senderId}-${message.receiverId}-${message.createdAt}-${message.content}`;

                  return (
                    <Box
                      key={messageKey}
                      sx={{
                        alignSelf: isMine ? "flex-end" : "flex-start",
                        maxWidth: "70%",
                      }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          px: 2,
                          py: 1.2,
                          borderRadius: isMine
                            ? "18px 18px 6px 18px"
                            : "18px 18px 18px 6px",
                          bgcolor: isMine ? "#7c3aed" : "#1e293b",
                          color: "#ffffff",
                        }}
                      >
                        <Typography variant="body2">{message.content}</Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 0.5,
                            opacity: 0.7,
                            textAlign: "right",
                          }}
                        >
                          {message.createdAt
                            ? new Date(message.createdAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : ""}
                        </Typography>
                      </Paper>
                    </Box>
                  );
                })
              )}
            </Box>

            <Box
              sx={{
                p: 1.5,
                display: "flex",
                gap: 1,
                borderTop: "1px solid rgba(255,255,255,0.12)",
                bgcolor: "#111827",
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#f8fafc",
                    borderRadius: 3,
                    bgcolor: "#020617",
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.2)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#7c3aed",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#7c3aed",
                    },
                  },
                  "& input::placeholder": {
                    color: "#94a3b8",
                    opacity: 1,
                  },
                }}
              />

              <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 900,
                  bgcolor: "#7c3aed",
                  "&:hover": {
                    bgcolor: "#6d28d9",
                  },
                }}
              >
                Enviar
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}