import { intro, text, isCancel, cancel, select, log } from "@clack/prompts"
import fs from "node:fs"
import path from "node:path";
import { fileURLToPath } from "node:url";
import c from "picocolors"

const cwd = process.cwd();


/* Defaults */
const defaultProjectName = "numer-project"

/* State */
let targetDir = defaultProjectName
let template = "none"
let packageManager = "npm"
let scaffoldMode: "generate" | "genAndInstall" = "generate"


const init = async () => {
  intro(c.bgCyan(c.black(" Hi Numer! 👋 ")))


  /* 1. Project name */

  const projectName = await text({
    message: "Provide a name for your project",
    defaultValue: defaultProjectName,
    validate: (value) => {
      return !value || !transformProjectName(value).length
        ? "Provide a valid project name"
        : undefined
    }
  })

  if (isCancel(projectName)) return exit();
  targetDir = transformProjectName(projectName)


  /* 2. Check if target dir exists */
  if (fs.existsSync(targetDir) && !isEmpty(targetDir)) {
    const shouldOverwrite = await select({
      message: `Target directory ${c.cyan(targetDir)} is not empty. Override?`,
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ]
    })

    if (isCancel(shouldOverwrite)) return exit();

    /* TODO:
       move clearing a directory to the end of 
       the script, so that the user can cancel the 
       process without losing data
    */
    shouldOverwrite
      ? fs.rmSync(targetDir, { recursive: true, force: true })
      : exit()
  }

  /* 3. Choose a template */
  const projectTemplate = await select({
    message: "Choose a template",
    options: [
      { label: "React + TS + SWC", value: "react-ts-swc" },
      { label: "Lib + TS (🚧)", value: "none" },
    ]
  })
  if (isCancel(projectTemplate)) return exit();
  template = projectTemplate

  if (template === "none") {
    log.message(c.yellow("🚧 Template is not available yet 🚧"))
    exit()
  }


  /* 4. Get package manager */
  const packageManager = getPackageManager(process.env.npm_config_user_agent)


  /* 5. Should install or only scaffold */
  const job = await select({
    message: "Generate project and install dependencies?",
    options: [
      { label: "Generate only", value: "generate" },
      { label: "Generate and install", value: "genAndInstall" },
    ]
  })
  if (isCancel(job)) return exit();
  scaffoldMode = job


  /* 6. Scaffold */
  const root = path.join(cwd, targetDir)
  fs.mkdirSync(root, { recursive: true })
  log.step(`Scaffolding ${c.cyan(targetDir)} in ${c.cyan(root)}`)

  /* Copy template files */
  const templateDir = path.resolve(fileURLToPath(import.meta.url), "../../templates", template)

  const files = fs.readdirSync(templateDir)
  for (const file of files) {
    if (file === "package.json") continue
    copy(path.join(templateDir, file), path.join(root, file))
  }
}


init()




/* HELPERS */

const exit = () => {
  cancel("Cancelled");
  process.exit(0)
}

const transformProjectName = (name: string) => name.trim().replace(/\/+$/g, "")

const isEmpty = (path: string) => fs.readdirSync(path).length === 0

const getPackageManager = (userAgent: string | undefined) => {
  if (!userAgent) return "npm"
  const _specs = userAgent.split(" ")[0]
  const manager = _specs.split("/")[0]
  return manager
}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const src = path.resolve(srcDir, file)
    const dest = path.resolve(destDir, file)
    copy(src, dest)
  }
}
