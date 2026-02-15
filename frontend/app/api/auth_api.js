const API = process.env.NEXT_PUBLIC_API_URL;

/**
 * Registers a new user.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export async function registerUser({ email, password }) {
  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Try to parse JSON regardless of status so we can read the error message
    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      // Use server-provided message if available, otherwise fall back to status text
      const message =
        data?.message || data?.error || res.statusText || "Registration failed";
      return { success: false, error: message };
    }

    return { success: true, data };
  } catch (err) {
    // Network-level error (no internet, CORS, wrong URL, etc.)
    return {
      success: false,
      error: err?.message || "Network error. Please try again.",
    };
  }
}

/**
 * Resets a user's password by email.
 * @param {{ email: string, newPassword: string, confirmPassword: string }} payload
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export async function resetPassword({ email, newPassword, confirmPassword }) {
  try {
    const res = await fetch(`${API}/api/auth/reset-by-email`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword, confirmPassword }),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      const message =
        data?.message || data?.error || res.statusText || "Password reset failed";
      return { success: false, error: message };
    }

    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err?.message || "Network error. Please try again.",
    };
  }
}

/**
 * Logs in an existing user.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export async function loginUser({ email, password }) {
  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      const message =
        data?.message || data?.error || res.statusText || "Login failed";
      return { success: false, error: message };
    }

    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err?.message || "Network error. Please try again.",
    };
  }
}