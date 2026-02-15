
import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(req) {
    try {
        const body = await req.json()
        const { firstName, fieldOfStudy, experienceLevel, skills } = body

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const prompt = `
Write a professional career goal statement.

Name: ${firstName || "a professional"}
Field of Study: ${fieldOfStudy || "General"}
Experience Level: ${experienceLevel || "Entry"}
Skills: ${skills || "General"}

Make it concise, ambitious, and professional. 120–150 words max.
`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        return NextResponse.json({ bio: text })
    } catch (error) {
        console.error("AI Generation Error:", error)
        return NextResponse.json({ error: "Failed to generate bio" }, { status: 500 })
    }
}
