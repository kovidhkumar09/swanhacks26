const BACKEND_ROOT =
  process.env.REACT_APP_BACKEND_ROOT ||
  "https://unote-backend-production.up.railway.app";

const API_BASE_URL = `${BACKEND_ROOT}/api`;
const APP_V1_BASE_URL = `${BACKEND_ROOT}/app/v1`;

export { BACKEND_ROOT, API_BASE_URL, APP_V1_BASE_URL };

export const API_URLS = {
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,

  getAccount: (accountId) => `${API_BASE_URL}/accounts/${accountId}/account`,
  updateAccount: (accountId) => `${API_BASE_URL}/accounts/${accountId}/update`,
  deleteAccount: (accountId) => `${API_BASE_URL}/accounts/${accountId}/delete`,

  classes: `${APP_V1_BASE_URL}/classes`,
  units: `${APP_V1_BASE_URL}/units`,
  notes: `${APP_V1_BASE_URL}/notes`,
  textEntryNotes: `${APP_V1_BASE_URL}/notes/textentry`,
  links: `${APP_V1_BASE_URL}/links`,

  addVideoComment: (noteId) => `${API_BASE_URL}/notes/${noteId}/timestamps/add`,
  getVideoComments: (noteId) =>
    `${API_BASE_URL}/notes/${noteId}/timestamps/get/all`,
  updateVideoComment: (noteId, commentId) =>
    `${API_BASE_URL}/notes/${noteId}/timestamps/${commentId}/update`,
  deleteVideoComment: (noteId, commentId) =>
    `${API_BASE_URL}/notes/${noteId}/timestamps/${commentId}/delete`,

  addPdfComment: (noteId) => `${API_BASE_URL}/notes/${noteId}/pdf-comments/add`,
  getPdfComments: (noteId) =>
    `${API_BASE_URL}/notes/${noteId}/pdf-comments/get/all`,
  updatePdfComment: (noteId, commentId) =>
    `${API_BASE_URL}/notes/${noteId}/pdf-comments/${commentId}/update`,
  deletePdfComment: (noteId, commentId) =>
    `${API_BASE_URL}/notes/${noteId}/pdf-comments/${commentId}/delete`,

  addGenericComment: (noteId) => `${API_BASE_URL}/notes/${noteId}/comments/add`,
  getGenericComments: (noteId) =>
    `${API_BASE_URL}/notes/${noteId}/comments/get/all`,
  updateGenericComment: (noteId, commentId) =>
    `${API_BASE_URL}/notes/${noteId}/comments/${commentId}/update`,
  deleteGenericComment: (noteId, commentId) =>
    `${API_BASE_URL}/notes/${noteId}/comments/${commentId}/delete`,
};

export function getStoredToken() {
  return sessionStorage.getItem("token");
}

export function getStoredUserDetails() {
  const storedUser = sessionStorage.getItem("userDetails");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

export function getStoredUsername() {
  const userDetails = getStoredUserDetails();

  return userDetails?.username || userDetails?.name || "Student";
}

export function getStoredAccountId() {
  const userDetails = getStoredUserDetails();

  return userDetails?.id || userDetails?.accountId || userDetails?.userId || 2;
}

function extractAccountFromResponse(response) {
  if (!response || typeof response !== "object") {
    return {};
  }

  return response.account || response.user || response.data || response;
}

export function saveAuthSession(response, fallbackUser = {}) {
  const account = extractAccountFromResponse(response);

  const token =
    response?.token ||
    response?.jwt ||
    response?.accessToken ||
    response?.bearerToken ||
    account?.token ||
    "";

  if (token) {
    sessionStorage.setItem("token", token);
  }

  const userDetails = {
    ...account,
    id:
      account.id ||
      account.accountId ||
      response?.accountId ||
      fallbackUser.id ||
      fallbackUser.accountId ||
      2,

    username:
      account.username || account.name || fallbackUser.username || "Student",
  };

  sessionStorage.setItem("userDetails", JSON.stringify(userDetails));

  return userDetails;
}

export function clearAuthSession() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("userDetails");
}

export async function apiFetch(url, options = {}) {
  const token = getStoredToken();
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      data ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

export function loginUser(username, password) {
  return apiFetch(API_URLS.login, {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
  });
}

export function registerUser(username, password) {
  return apiFetch(API_URLS.register, {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
  });
}

export function getAccount(accountId = getStoredAccountId()) {
  return apiFetch(API_URLS.getAccount(accountId), {
    method: "GET",
  });
}

export function updateAccount(accountId = getStoredAccountId(), updatedData) {
  return apiFetch(API_URLS.updateAccount(accountId), {
    method: "PUT",
    body: JSON.stringify(updatedData),
  });
}

export function deleteAccount(accountId = getStoredAccountId()) {
  return apiFetch(API_URLS.deleteAccount(accountId), {
    method: "DELETE",
  });
}

/* ---------- Video Comment API ---------- */

export function addVideoComment(noteId, payload) {
  return apiFetch(API_URLS.addVideoComment(noteId), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getVideoComments(noteId) {
  return apiFetch(API_URLS.getVideoComments(noteId), {
    method: "GET",
  });
}

export function updateVideoComment(noteId, commentId, payload) {
  return apiFetch(API_URLS.updateVideoComment(noteId, commentId), {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteVideoCommentById(noteId, commentId) {
  return apiFetch(API_URLS.deleteVideoComment(noteId, commentId), {
    method: "DELETE",
  });
}

export function addPdfComment(noteId, payload) {
  return apiFetch(API_URLS.addPdfComment(noteId), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getPdfComments(noteId) {
  return apiFetch(API_URLS.getPdfComments(noteId), {
    method: "GET",
  });
}

export function updatePdfComment(noteId, commentId, payload) {
  return apiFetch(API_URLS.updatePdfComment(noteId, commentId), {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deletePdfCommentById(noteId, commentId) {
  return apiFetch(API_URLS.deletePdfComment(noteId, commentId), {
    method: "DELETE",
  });
}

export function addGenericComment(noteId, payload) {
  return apiFetch(API_URLS.addGenericComment(noteId), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getGenericComments(noteId) {
  return apiFetch(API_URLS.getGenericComments(noteId), {
    method: "GET",
  });
}

export function updateGenericComment(noteId, commentId, payload) {
  return apiFetch(API_URLS.updateGenericComment(noteId, commentId), {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteGenericCommentById(noteId, commentId) {
  return apiFetch(API_URLS.deleteGenericComment(noteId, commentId), {
    method: "DELETE",
  });
}
