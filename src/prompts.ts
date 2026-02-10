import { text, isCancel, select } from "@clack/prompts"
import { exit, isValidPackageName, toValidPackageName, transformTargetDir } from "."
import c from "picocolors"
import { TEMPLATES } from "./templates"
import { ScaffoldMode } from "./types"


export const getProjectNamePrompt = async (defaultName: string): Promise<string> => {
  const result = await text({
    message: "Provide a name for your project",
    defaultValue: defaultName,
    placeholder: defaultName,
    validate: (value) => {
      return !value || !transformTargetDir(value).length
        ? "Provide a valid project name"
        : undefined
    }
  })

  if (isCancel(result)) return exit();
  return transformTargetDir(result)
}


export const shouldOverwritePrompt = async (targetDir: string): Promise<boolean> => {
  const result = await select({
    message: `Target directory ${c.cyan(targetDir)} is not empty. Override?`,
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ]
  })

  if (isCancel(result)) return exit();
  return result
}


export const getPackageNamePrompt = async (defaultName: string): Promise<string> => {
  const result = await text({
    message: "Provide a name for your package",
    defaultValue: toValidPackageName(defaultName),
    placeholder: toValidPackageName(defaultName),
    validate: (value) => {
      return value && !isValidPackageName(value)
        ? "Invalid package name"
        : undefined
    }
  })

  if (isCancel(result)) return exit();
  return result
}

export const promptTemplate = async (): Promise<string> => {
  const result = await select({
    message: "Choose a template",
    options: TEMPLATES.map(t => ({
      label: `${t.color(t.name)} ${c.dim(t.desc || '')}`,
      value: t.id || "none",
      hint: t.hint || ''
    }))
  })

  if (isCancel(result)) return exit();
  return result
}

export const promptScaffoldMode = async (): Promise<ScaffoldMode> => {
  const result = await select({
    message: "Generate project and install dependencies?",
    options: [
      { label: "Generate only", value: "generate" },
      { label: "Generate and install", value: "genAndInstall" },
    ]
  })
  if (isCancel(result)) return exit();
  return result
}
