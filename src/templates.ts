import { Template } from "./types";
import c from "picocolors"

export const TEMPLATES: Template[] = [
  {
    id: "react-ts",
    name: "React",
    desc: "(TypeScript + Vite 8 + Rolldown)",
    color: c.blue
  },
  {
    id: "none",
    name: "Library",
    desc: "(TypeScript)",
    color: c.yellow,
    hint: "🚧 Not available yet 🚧"
  }
]
