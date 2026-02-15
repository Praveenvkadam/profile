"use client"

import { useForm, Controller, useFieldArray } from "react-hook-form"
import { useRef, useState, useEffect, useCallback, Component } from "react"
import { updateProfile, getProfile } from "../api/profile_api"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// ── Validation Schema ──────────────────────────────────────────────────────
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_DOCUMENT_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, "Invalid phone number").optional().or(z.literal("")),
  address: z.string().optional(),
  bio: z.string().max(1000, "Bio must be less than 1000 characters").optional(),
  skills: z.string().optional(),
  educationLevel: z.string().optional(),
  university: z.string().optional(),
  courseName: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  currentlyStudying: z.boolean().optional(),
  experienceLevel: z.string().optional(),
  certificates: z.array(z.object({
    certificateName: z.string(),
    certificateStart: z.string(),
    certificateEnd: z.string(),
    certificateDescription: z.string().optional(),
  })).optional(),
  profilePhoto: z.any().optional(),
  resume: z.any().optional(),
});

// ── Date helpers (with proper timezone handling) ────────────────────────────
const toDateInput = (val) => {
  if (!val) return "";
  try {
    const date = new Date(val);
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const toMonthInput = (val) => {
  if (!val) return "";
  try {
    const date = new Date(val);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  } catch {
    return "";
  }
};

// ── File validation helper ──────────────────────────────────────────────────
const validateFile = (file, maxSize, allowedTypes) => {
  if (!file) return { valid: true };
  
  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${maxSize / 1024 / 1024}MB` };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Invalid file type" };
  }
  
  return { valid: true };
};

// ── Error Boundary Component ────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription>
              Something went wrong. Please refresh the page and try again.
              {process.env.NODE_ENV === 'development' && (
                <pre className="mt-2 text-xs">{this.state.error?.message}</pre>
              )}
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

// ── File Upload Component (Reusable) ────────────────────────────────────────
const FileUpload = ({ 
  label, 
  accept, 
  fileName, 
  onFileChange, 
  fileRef,
  description,
  disabled 
}) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input
        type="file"
        accept={accept}
        className="hidden"
        ref={fileRef}
        onChange={onFileChange}
        disabled={disabled}
        aria-label={label}
      />
      <div
        onClick={() => !disabled && fileRef.current?.click()}
        onKeyDown={(e) => !disabled && e.key === "Enter" && fileRef.current?.click()}
        tabIndex={0}
        role="button"
        aria-label={`Upload ${label}`}
        className={`border-2 border-dashed rounded-md p-10 text-center cursor-pointer transition ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${
          fileName
            ? "border-green-400 bg-green-50 text-green-700"
            : "text-muted-foreground hover:bg-muted/50"
        }`}
      >
        {fileName || `Click to upload or drag and drop`}
        <div className="text-xs mt-1">{description}</div>
      </div>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────────────
function RegistrationFormInner() {
  const { register, control, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      certificates: [
        { certificateName: "", certificateStart: "", certificateEnd: "", certificateDescription: "" }
      ]
    }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "certificates"
  });

  const photoRef = useRef(null);
  const resumeRef = useRef(null);
  const formDraftKey = "registration-form-draft";

  const [photoName, setPhotoName] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // ── Auto-save form draft ────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const formData = {
        firstName: document.querySelector('[name="firstName"]')?.value,
        lastName: document.querySelector('[name="lastName"]')?.value,
        email: document.querySelector('[name="email"]')?.value,
        // ... save other fields as needed
      };
      
      if (formData.firstName || formData.lastName || formData.email) {
        sessionStorage.setItem(formDraftKey, JSON.stringify(formData));
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // ── Restore draft on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const draft = sessionStorage.getItem(formDraftKey);
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        // Only restore if we haven't fetched profile data yet
        if (fetching && Object.keys(draftData).length > 0) {
          // Optionally show a confirmation dialog before restoring
          console.log("Draft found:", draftData);
        }
      } catch (err) {
        console.error("Failed to parse draft:", err);
      }
    }
  }, [fetching]);

  // ── Fetch & prefill ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getProfile();
        
        if (!result.success) {
          console.log("No existing profile or error:", result.error);
          setError("Failed to load profile data. You can still fill out the form.");
          setFetching(false);
          return;
        }

        const data = result.data;
        console.log("profile data:", data);

        const edu = Array.isArray(data.education) && data.education.length > 0
          ? data.education[0]
          : null;

        // skills is JSONB array → comma string for the text input
        const skillsString = Array.isArray(data.skills)
          ? data.skills.join(", ")
          : data.skills || "";

        reset({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          bio: data.bio || "",
          skills: skillsString,
          educationLevel: edu?.degree || "",
          university: edu?.institution || "",
          courseName: edu?.course || "",
          fieldOfStudy: edu?.fieldOfStudy || "",
          startDate: toMonthInput(edu?.startDate),
          endDate: toMonthInput(edu?.endDate),
          currentlyStudying: edu?.currentlyStudying || false,
          experienceLevel: edu?.experienceLevel || "",
          certificates: [],
        });

        // prefill certificates — fix ISO timestamp dates
        if (Array.isArray(data.certificates) && data.certificates.length > 0) {
          replace(
            data.certificates.map((c) => ({
              certificateName: c.certificate_name || "",
              certificateStart: toDateInput(c.start_date),
              certificateEnd: toDateInput(c.end_date),
              certificateDescription: c.description || "",
            }))
          );
        }

        // show existing file names
        if (data.profile_photo) setPhotoName(data.profile_photo.split("/").pop());
        if (data.resume_file) setResumeName(data.resume_file.split("/").pop());

        // Clear draft after successful load
        sessionStorage.removeItem(formDraftKey);

      } catch (err) {
        console.log("Error fetching profile:", err);
        setError("Failed to load profile data. You can still fill out the form.");
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [reset, replace]);

  // ── File handlers with validation ───────────────────────────────────────────
  const handlePhotoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setPhotoError("");

    const validation = validateFile(file, MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES);
    
    if (!validation.valid) {
      setPhotoError(validation.error);
      setPhotoName("");
      setValue("profilePhoto", null);
      if (photoRef.current) photoRef.current.value = "";
    } else {
      setPhotoName(file.name);
      setValue("profilePhoto", file);
    }

    setUploadingFile(false);
  }, [setValue]);

  const handleResumeChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setResumeError("");

    const validation = validateFile(file, MAX_FILE_SIZE, ACCEPTED_DOCUMENT_TYPES);
    
    if (!validation.valid) {
      setResumeError(validation.error);
      setResumeName("");
      setValue("resume", null);
      if (resumeRef.current) resumeRef.current.value = "";
    } else {
      setResumeName(file.name);
      setValue("resume", file);
    }

    setUploadingFile(false);
  }, [setValue]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateProfile(data);
      
      if (!result.success) {
        setError(result.error || "Failed to update profile. Please try again.");
        return;
      }
      
      // Clear draft on successful submit
      sessionStorage.removeItem(formDraftKey);
      
      // Clear file inputs
      if (photoRef.current) photoRef.current.value = "";
      if (resumeRef.current) resumeRef.current.value = "";
      
      setSuccessOpen(true);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (fetching) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <p className="text-muted-foreground text-sm animate-pulse">Loading your profile...</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/40 py-12 px-4">

      {/* ── Success Dialog ── */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-3xl">
              ✓
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              Profile Submitted!
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground mt-1">
              Your profile has been updated successfully. We'll use this to tailor
              opportunities and learning paths just for you.
            </DialogDescription>
          </DialogHeader>
          <Button className="mt-4 w-full" onClick={() => setSuccessOpen(false)}>
            Done
          </Button>
        </DialogContent>
      </Dialog>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-4xl mx-auto space-y-10"
      >
        <div>
          <h1 className="text-2xl font-semibold">Full Registration Form</h1>
          <p className="text-muted-foreground mt-1">
            Please complete all required fields to finalize your professional profile.
          </p>
        </div>

        {/* Error Alert with ARIA live region */}
        <div role="alert" aria-live="assertive" aria-atomic="true">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* ── 1. Identity ── */}
        <section className="space-y-6">
          <h2 className="text-lg font-medium">1. Identity</h2>
          <Separator />
          <Card>
            <CardContent className="p-6 space-y-6">

              {/* Profile Photo */}
              <FileUpload
                label="Profile Photo"
                accept="image/*"
                fileName={photoName}
                onFileChange={handlePhotoChange}
                fileRef={photoRef}
                description="SVG, PNG, JPG or GIF (max. 10MB)"
                disabled={loading || uploadingFile}
              />
              {photoError && (
                <p className="text-sm text-red-500 mt-1">{photoError}</p>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input 
                    id="firstName" 
                    {...register("firstName")} 
                    disabled={loading}
                    aria-required="true"
                    aria-invalid={!!errors.firstName}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input 
                    id="lastName" 
                    {...register("lastName")} 
                    disabled={loading}
                    aria-required="true"
                    aria-invalid={!!errors.lastName}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    {...register("email")} 
                    disabled={loading}
                    aria-required="true"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    {...register("phone")} 
                    disabled={loading}
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address" 
                  {...register("address")} 
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bio">Tell Us Where You Want to Go</Label>
                  <Button type="button" variant="outline" size="sm" disabled={loading}>
                    ✨ AI Generate
                  </Button>
                </div>
                <Textarea
                  id="bio"
                  placeholder="Add your career goals and what inspires you. This helps us tailor recommendations, learning paths, and opportunities just for you"
                  {...register("bio")}
                  disabled={loading}
                  maxLength={1000}
                />
                {errors.bio && (
                  <p className="text-sm text-red-500">{errors.bio.message}</p>
                )}
              </div>

            </CardContent>
          </Card>
        </section>

        {/* ── 2. Academic History ── */}
        <section className="space-y-6">
          <h2 className="text-lg font-medium">2. Academic History</h2>
          <Separator />
          <Card>
            <CardContent className="p-6 space-y-6">

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="educationLevel">Education Level</Label>
                  <Controller
                    name="educationLevel"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || ""}
                        disabled={loading}
                      >
                        <SelectTrigger id="educationLevel">
                          <SelectValue placeholder="Choose level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="highschool">High School</SelectItem>
                          <SelectItem value="bachelor">Bachelor</SelectItem>
                          <SelectItem value="master">Master</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university">College / University Name</Label>
                  <Input 
                    id="university" 
                    {...register("university")} 
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="courseName">Course Name</Label>
                  <Input 
                    id="courseName" 
                    {...register("courseName")} 
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fieldOfStudy">Field of Study</Label>
                  <Input 
                    id="fieldOfStudy" 
                    {...register("fieldOfStudy")} 
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Month/Year</Label>
                  <Input 
                    id="startDate" 
                    type="month" 
                    {...register("startDate")} 
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Month/Year</Label>
                  <Input 
                    id="endDate" 
                    type="month" 
                    {...register("endDate")} 
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Experience</Label>
                  <Controller
                    name="experienceLevel"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || ""}
                        disabled={loading}
                      >
                        <SelectTrigger id="experienceLevel">
                          <SelectValue placeholder="Choose experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry</SelectItem>
                          <SelectItem value="mid">Mid</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="currentlyStudying"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="currentlyStudying"
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  )}
                />
                <Label htmlFor="currentlyStudying">Currently studying (Present)</Label>
              </div>

            </CardContent>
          </Card>
        </section>

        {/* ── 3. Professional Details ── */}
        <section className="space-y-6">
          <h2 className="text-lg font-medium">3. Professional Details</h2>
          <Separator />
          <Card>
            <CardContent className="p-6 space-y-6">

              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  placeholder="JavaScript, React, Node.js (comma-separated)"
                  {...register("skills")}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">Separate each skill with a comma</p>
              </div>

              <FileUpload
                label="Resume Upload"
                accept=".pdf,.doc,.docx"
                fileName={resumeName}
                onFileChange={handleResumeChange}
                fileRef={resumeRef}
                description="PDF, DOCX up to 10MB"
                disabled={loading || uploadingFile}
              />
              {resumeError && (
                <p className="text-sm text-red-500 mt-1">{resumeError}</p>
              )}

            </CardContent>
          </Card>
        </section>

        {/* ── 4. Certificates ── */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">4. Certificates</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => append({
                certificateName: "",
                certificateStart: "",
                certificateEnd: "",
                certificateDescription: ""
              })}
              disabled={loading}
            >
              + Add More
            </Button>
          </div>
          <Separator />

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="p-6 space-y-6">

                {fields.length > 1 && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-red-500"
                      onClick={() => remove(index)}
                      disabled={loading}
                    >
                      ✕ Remove
                    </Button>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor={`certificate-name-${index}`}>Certificate Name</Label>
                    <Input 
                      id={`certificate-name-${index}`}
                      {...register(`certificates.${index}.certificateName`)} 
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`certificate-start-${index}`}>Start Date</Label>
                    <Input 
                      id={`certificate-start-${index}`}
                      type="date" 
                      {...register(`certificates.${index}.certificateStart`)} 
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`certificate-end-${index}`}>Expiration Date</Label>
                    <Input 
                      id={`certificate-end-${index}`}
                      type="date" 
                      {...register(`certificates.${index}.certificateEnd`)} 
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`certificate-description-${index}`}>Description</Label>
                  <Textarea 
                    id={`certificate-description-${index}`}
                    {...register(`certificates.${index}.certificateDescription`)} 
                    disabled={loading}
                  />
                </div>

              </CardContent>
            </Card>
          ))}
        </section>

        <Button
          type="submit"
          className="w-full py-6 text-base"
          disabled={loading || uploadingFile}
        >
          {loading ? "Submitting..." : "SUBMIT REGISTRATION"}
        </Button>

      </form>
    </div>
  );
}

// ── Export with Error Boundary ──────────────────────────────────────────────
export default function RegistrationForm() {
  return (
    <ErrorBoundary>
      <RegistrationFormInner />
    </ErrorBoundary>
  );
}