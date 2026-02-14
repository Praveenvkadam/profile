"use client"

import { useForm, Controller } from "react-hook-form"
import { useRef, useState } from "react"

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

export default function RegistrationForm() {
  const { register, control, handleSubmit, setValue } = useForm()
  const photoRef = useRef(null)
  const resumeRef = useRef(null)
  const [photoName, setPhotoName] = useState("")
  const [resumeName, setResumeName] = useState("")

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <div className="min-h-screen bg-muted/40 py-12 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-4xl mx-auto space-y-10"
      >
        <div>
          <h1 className="text-2xl font-semibold">
            Full Registration Form with AI Bio
          </h1>
          <p className="text-muted-foreground mt-1">
            Please complete all required fields to finalize your professional profile.
          </p>
        </div>

        <section className="space-y-6">
          <h2 className="text-lg font-medium">1. Identity</h2>
          <Separator />

          <Card>
            <CardContent className="p-6 space-y-6">

              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={photoRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setPhotoName(file.name)
                      setValue("profilePhoto", file)
                    }
                  }}
                />
                <div
                  onClick={() => photoRef.current?.click()}
                  className="border-2 border-dashed rounded-md p-10 text-center text-muted-foreground cursor-pointer hover:bg-muted/50 transition"
                >
                  {photoName || "Click to upload or drag and drop"}
                  <div className="text-xs mt-1">
                    SVG, PNG, JPG or GIF (max. 800x400px)
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input {...register("firstName")} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input {...register("lastName")} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" {...register("email")} />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input {...register("phone")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea {...register("address")} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Self-Description</Label>
                  <Button type="button" variant="outline" size="sm">
                    ✨ AI Generate
                  </Button>
                </div>
                <Textarea {...register("bio")} />
              </div>

            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <h2 className="text-lg font-medium">2. Academic History</h2>
          <Separator />

          <Card>
            <CardContent className="p-6 space-y-6">

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Education Level</Label>
                  <Controller
                    name="educationLevel"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
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
                  <Label>College / University Name</Label>
                  <Input {...register("university")} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Course Name</Label>
                  <Input {...register("courseName")} />
                </div>
                <div className="space-y-2">
                  <Label>Field of Study</Label>
                  <Input {...register("fieldOfStudy")} />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Start Month/Year</Label>
                  <Input type="month" {...register("startDate")} />
                </div>
                <div className="space-y-2">
                  <Label>End Month/Year</Label>
                  <Input type="month" {...register("endDate")} />
                </div>
                <div className="space-y-2">
                  <Label>Experience</Label>
                  <Controller
                    name="experienceLevel"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
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
                <Checkbox {...register("currentlyStudying")} />
                <Label>Currently studying (Present)</Label>
              </div>

            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <h2 className="text-lg font-medium">3. Professional Details</h2>
          <Separator />

          <Card>
            <CardContent className="p-6 space-y-6">

              <div className="space-y-2">
                <Label>Skills</Label>
                <Input {...register("skills")} />
              </div>

              <div className="space-y-2">
                <Label>Resume Upload</Label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  ref={resumeRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setResumeName(file.name)
                      setValue("resume", file)
                    }
                  }}
                />
                <div
                  onClick={() => resumeRef.current?.click()}
                  className="border-2 border-dashed rounded-md p-10 text-center text-muted-foreground cursor-pointer hover:bg-muted/50 transition"
                >
                  {resumeName || "Upload your resume or drag and drop"}
                  <div className="text-xs mt-1">
                    PDF, DOCX up to 10MB
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">4. Certificates</h2>
            <Button type="button" variant="ghost" size="sm">
              + Add More
            </Button>
          </div>
          <Separator />

          <Card>
            <CardContent className="p-6 space-y-6">

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Certificate Name</Label>
                  <Input {...register("certificateName")} />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" {...register("certificateStart")} />
                </div>
                <div className="space-y-2">
                  <Label>Expiration Date</Label>
                  <Input type="date" {...register("certificateEnd")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea {...register("certificateDescription")} />
              </div>

            </CardContent>
          </Card>
        </section>

        <Button type="submit" className="w-full py-6 text-base">
          SUBMIT REGISTRATION
        </Button>

      </form>
    </div>
  )
}