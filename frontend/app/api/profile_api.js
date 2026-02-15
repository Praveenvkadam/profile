import axios from "axios";

const url = process.env.NEXT_PUBLIC_API_URL;

const API = axios.create({
  baseURL: `${url}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const updateProfile = async (formData) => {
  const payload = new FormData();

  // Basic fields
  payload.append("firstName", formData.firstName || "");
  payload.append("lastName",  formData.lastName  || "");
  payload.append("phone",     formData.phone     || "");
  payload.append("address",   formData.address   || "");
  payload.append("bio",       formData.bio       || "");

  // Skills — comma-separated string → JSON array
  const skillsArray = formData.skills
    ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  payload.append("skills", JSON.stringify(skillsArray));

  // Education — scattered fields → array of objects
  const education = [
    {
      degree:            formData.educationLevel   || null,
      institution:       formData.university       || null,
      course:            formData.courseName       || null,
      fieldOfStudy:      formData.fieldOfStudy     || null,
      startDate:         formData.startDate        || null,
      endDate:           formData.currentlyStudying ? null : formData.endDate || null,
      currentlyStudying: formData.currentlyStudying || false,
      experienceLevel:   formData.experienceLevel  || null,
    },
  ];
  payload.append("education", JSON.stringify(education));

  // Certificates — useFieldArray array → backend format
  const certificates = (formData.certificates || [])
    .filter((c) => c.certificateName?.trim())
    .map((c) => ({
      certificateName: c.certificateName        || null,
      startDate:       c.certificateStart       || null,
      endDate:         c.certificateEnd         || null,
      description:     c.certificateDescription || null,
    }));
  payload.append("certificates", JSON.stringify(certificates));

  // Files
  if (formData.profilePhoto) payload.append("profilePhoto", formData.profilePhoto);
  if (formData.resume)       payload.append("resume",       formData.resume);

  const response = await API.put("/profile", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};