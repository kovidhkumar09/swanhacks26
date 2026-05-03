const API_BASE_URL = "http://129.186.192.21:8081/api";

export { API_BASE_URL };

export const API_URLS = {
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,

  getAccount: (accountId) => `${API_BASE_URL}/accounts/${accountId}/account`,
  updateAccount: (accountId) => `${API_BASE_URL}/accounts/${accountId}/update`,
  deleteAccount: (accountId) => `${API_BASE_URL}/accounts/${accountId}/delete`,
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
      account.username ||
      account.name ||
      fallbackUser.username ||
      "Student",
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
      username: username,
      password: password,
    }),
  });
}

export function registerUser(username, password) {
  return apiFetch(API_URLS.register, {
    method: "POST",
    body: JSON.stringify({
      username: username,
      password: password,
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