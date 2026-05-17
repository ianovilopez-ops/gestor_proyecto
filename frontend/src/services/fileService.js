import { getToken } from "./authService";

const FILE_SERVICE_URL = "http://localhost:3004";

export async function uploadFile({
  file,
  relatedType = "general",
  relatedId = "",
}) {
  const token = getToken();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("relatedType", relatedType);
  formData.append("relatedId", relatedId);

  const response = await fetch(`${FILE_SERVICE_URL}/api/files/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo subir el archivo.");
  }

  return data;
}

export async function getFiles({ relatedType = "", relatedId = "" } = {}) {
  const token = getToken();

  const params = new URLSearchParams();

  if (relatedType) params.append("relatedType", relatedType);
  if (relatedId) params.append("relatedId", relatedId);

  const response = await fetch(
    `${FILE_SERVICE_URL}/api/files?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron cargar los archivos.");
  }

  return data;
}

export async function deleteFile(fileId) {
  const token = getToken();

  const response = await fetch(`${FILE_SERVICE_URL}/api/files/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo eliminar el archivo.");
  }

  return data;
}