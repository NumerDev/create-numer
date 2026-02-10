import { cancel } from "@clack/prompts"
import fs from "node:fs"
import path from "node:path"
import spawn from "cross-spawn"
import { PackageManager } from "./types"
import type { SpawnOptions } from 'node:child_process'

export const exit = () => {
  cancel("Cancelled");
  process.exit(0)
}

export const transformTargetDir = (name: string) => {
  return name
    .trim()
    .replace(/[<>:"\\|?*]/g, '') // Remove forbidden characters
    .replace(/\/+$/g, "") // Remove trailing slashes
}

export const isValidPackageName = (projectName: string) => {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName,
  )
}

export const toValidPackageName = (projectName: string) => {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // Spaces => hyphens
    .replace(/^[._]/, '') // Remove leading dots
    .replace(/[^a-z\d\-~]+/g, '-') // Non-alphanumeric characters => hyphens
}

export const isDirEmpty = (path: string) => fs.readdirSync(path).length === 0

export const isValidPackageManager = (pkgManager: string): pkgManager is PackageManager => {
  return ["npm", "pnpm", "yarn", "bun", "deno"].includes(pkgManager)
}

export const getPackageManager = (userAgent: string | undefined): PackageManager => {
  if (!userAgent) return "npm"
  const _specs = userAgent.split(" ")[0]
  const manager = _specs.split("/")[0]

  return isValidPackageManager(manager) ? manager : "npm"
}

export const copy = (src: string, dest: string) => {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

export const copyDir = (srcDir: string, destDir: string) => {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const src = path.resolve(srcDir, file)
    const dest = path.resolve(destDir, file)
    copy(src, dest)
  }
}

export const emptyDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    return
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === '.git') {
      continue
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true })
  }
}

export const run = ([command, ...args]: string[], options?: SpawnOptions) => {
  const { status, error } = spawn.sync(command, args, options)
  if (status != null && status > 0) {
    process.exit(status)
  }

  if (error) {
    console.error(`\n${command} ${args.join(' ')} error!`)
    console.error(error)
    process.exit(1)
  }
}
