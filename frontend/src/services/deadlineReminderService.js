import { getBoards } from "./boardService.js";
import { getTasksByBoard } from "./taskService.js";
import { getNotifications, createNotification } from "./notificationService.js";

function normalizeDate(dateValue) {
  if (!dateValue || dateValue === "Sin fecha") return null;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return null;

  date.setHours(0, 0, 0, 0);

  return date;
}

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today;
}

function getTomorrow() {
  const tomorrow = getToday();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return tomorrow;
}

function sameDay(firstDate, secondDate) {
  if (!firstDate || !secondDate) return false;

  return firstDate.getTime() === secondDate.getTime();
}

function isExpired(date) {
  if (!date) return false;

  return date.getTime() < getToday().getTime();
}

function notificationExists(notifications, dedupeKey) {
  return notifications.some(
    (notification) => notification.dedupeKey === dedupeKey
  );
}

export async function checkDeadlineReminders() {
  const [boardsData, notificationsData] = await Promise.all([
    getBoards(),
    getNotifications(),
  ]);

  const boards = boardsData.boards || [];
  const notifications = notificationsData.notifications || [];

  for (const board of boards) {
    const tasksData = await getTasksByBoard(board._id);
    const tasks = tasksData.tasks || [];

    for (const task of tasks) {
      if (task.status === "done") continue;

      const dueDate = normalizeDate(task.dueDate);

      if (!dueDate) continue;

      if (isExpired(dueDate)) {
        const dedupeKey = `${task._id}-deadline-expired`;

        if (!notificationExists(notifications, dedupeKey)) {
          await createNotification({
            title: "Tarea vencida",
            message: `La tarea "${task.title}" está vencida.`,
            type: "deadline",
            relatedId: task._id,
            relatedType: "task",
            priority: "Alta",
            dedupeKey,
            metadata: {
              boardId: board._id,
            },
          });
        }

        continue;
      }

      if (sameDay(dueDate, getToday())) {
        const dedupeKey = `${task._id}-deadline-today`;

        if (!notificationExists(notifications, dedupeKey)) {
          await createNotification({
            title: "Entrega hoy",
            message: `La tarea "${task.title}" vence hoy.`,
            type: "deadline",
            relatedId: task._id,
            relatedType: "task",
            priority: task.priority || "Alta",
            dedupeKey,
            metadata: {
              boardId: board._id,
            },
          });
        }

        continue;
      }

      if (sameDay(dueDate, getTomorrow())) {
        const dedupeKey = `${task._id}-deadline-tomorrow`;

        if (!notificationExists(notifications, dedupeKey)) {
          await createNotification({
            title: "Entrega mañana",
            message: `La tarea "${task.title}" vence mañana.`,
            type: "deadline",
            relatedId: task._id,
            relatedType: "task",
            priority: task.priority || "Media",
            dedupeKey,
            metadata: {
              boardId: board._id,
            },
          });
        }
      }
    }
  }
}