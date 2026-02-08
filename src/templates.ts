import { Template } from "./types";
import c from "picocolors"

export const TEMPLATES: Template[] = [
  {
    id: "react-ts-swc",
    name: "React",
    desc: "(TypeScript + SWC)",
    color: c.blue
  },
  {
    id: "none",
    name: "Lib",
    desc: "(TypeScript)",
    color: c.yellow
  }
]
