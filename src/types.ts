export type PackageManager = "npm" | "pnpm" | "yarn" | "bun" | "deno"
export type ScaffoldMode = "generate" | "genAndInstall"

export interface Template {
  id: string
  name: string,
  desc: string,
  color: (text: string | number) => string,
  hint?: string
}

export interface ProjectConfig {
  targetDir: string
  packageName: string
  template: string
  packageManager: PackageManager
  scaffoldMode: ScaffoldMode
  shouldOverwrite?: boolean
}
