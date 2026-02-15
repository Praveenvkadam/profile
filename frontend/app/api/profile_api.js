const API = process.env.NEXT_PUBLIC_API_URL;

/**
 * Helper function to get auth token from localStorage
 * @returns {string | null}
 */
function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

/**
 * Helper function to create headers with auth token
 * @returns {HeadersInit}
 */
function getAuthHeaders() {
  const token = getAuthToken();
  const headers = {
    'Authorization': token ? `Bearer ${token}` : '',
  };
  return headers;
}

/**
 * Gets the user's profile data.
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export async function getProfile() {
  try {
    const token = getAuthToken();
    console.log('Fetching profile with token:', token ? 'Token exists' : 'No token');
    console.log('API URL:', `${API}/api/profile`);
    
    const res = await fetch(`${API}/api/profile`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    console.log('Profile fetch status:', res.status);

    let data;
    try {
      data = await res.json();
      console.log('Raw response data:', data);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      data = {};
    }

    if (!res.ok) {
      const message =
        data?.message || data?.error || res.statusText || "Failed to fetch profile";
      console.log('Profile fetch failed:', message);
      return { success: false, error: message };
    }

    // Backend returns data directly, not wrapped in {success, data}
    // So we wrap it here for consistency
    return { success: true, data: data };
  } catch (err) {
    console.error('Profile fetch error:', err);
    return {
      success: false,
      error: err?.message || "Network error. Please try again.",
    };
  }
}

/**
 * Updates the user's profile.
 * @param {Object} formData - Form data from react-hook-form
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export async function updateProfile(formData) {
  try {
    const payload = new FormData();

    // Basic info
    payload.append("firstName", formData.firstName || "");
    payload.append("lastName", formData.lastName || "");
    payload.append("phone", formData.phone || "");
    payload.append("address", formData.address || "");
    payload.append("bio", formData.bio || "");

    // Skills - convert comma-separated string to array
    const skillsArray = formData.skills
      ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    payload.append("skills", JSON.stringify(skillsArray));

    // Education - single object in array
    const education = [
      {
        degree: formData.educationLevel || null,
        institution: formData.university || null,
        course: formData.courseName || null,
        fieldOfStudy: formData.fieldOfStudy || null,
        startDate: formData.startDate || null,
        endDate: formData.currentlyStudying ? null : formData.endDate || null,
        currentlyStudying: formData.currentlyStudying || false,
        experienceLevel: formData.experienceLevel || null,
      },
    ];
    payload.append("education", JSON.stringify(education));

    // Certificates - filter out empty entries
    const certificates = (formData.certificates || [])
      .filter((c) => c.certificateName?.trim())
      .map((c) => ({
        certificateName: c.certificateName || null,
        startDate: c.certificateStart || null,
        endDate: c.certificateEnd || null,
        description: c.certificateDescription || null,
      }));
    payload.append("certificates", JSON.stringify(certificates));

    // Files - only append if they exist and are File objects
    if (formData.profilePhoto && formData.profilePhoto instanceof File) {
      payload.append("profilePhoto", formData.profilePhoto);
    }
    if (formData.resume && formData.resume instanceof File) {
      payload.append("resume", formData.resume);
    }

    const token = getAuthToken();
    const res = await fetch(`${API}/api/profile`, {
      method: "PUT",
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        // Don't set Content-Type for FormData - browser sets it automatically with boundary
      },
      body: payload,
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      // Handle specific error cases
      if (res.status === 413) {
        return { success: false, error: "File size too large - please upload smaller files" };
      }
      if (res.status === 422) {
        return { success: false, error: "Invalid data format - please check your inputs" };
      }
      if (res.status === 401) {
        return { success: false, error: "Authentication required. Please sign in again." };
      }
      
      const message =
        data?.message || data?.error || res.statusText || "Failed to update profile";
      return { success: false, error: message };
    }

    return { success: true, data };
  } catch (err) {
    // Network-level error
    if (err.name === 'AbortError') {
      return { success: false, error: "Request timeout - please try again" };
    }
    return {
      success: false,
      error: err?.message || "Network error. Please try again.",
    };
  }
}

/**
 * Deletes the user's profile.
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export async function deleteProfile() {
  try {
    const res = await fetch(`${API}/api/profile`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      const message =
        data?.message || data?.error || res.statusText || "Failed to delete profile";
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