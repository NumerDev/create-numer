import { intro, text, isCancel, cancel, select, log, outro } from "@clack/prompts"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import c from "picocolors"
import spawn from "cross-spawn"
import type { SpawnOptions } from 'node:child_process'

const cwd = process.cwd();


/* Defaults */
const defaultProjectName = "project-name"

/* State */
let targetDir = defaultProjectName
let template = "none"
let packageManager = "pnpm"
let scaffoldMode: "generate" | "genAndInstall" = "generate"
let packageName = defaultProjectName

const init = async () => {
  intro(c.bgCyan(c.black(" Numer v0.0.0 ")));


  /* ----------------------------------- *\
     1. Project name
  \* ----------------------------------- */

  const projectName = await text({
    message: "Provide a name for your project",
    defaultValue: defaultProjectName,
    validate: (value) => {
      return !value || !transformTargetDir(value).length
        ? "Provide a valid project name"
        : undefined
    }
  })

  if (isCancel(projectName)) return exit();
  targetDir = transformTargetDir(projectName)

  /* ----------------------------------- *\
     2. Check if target dir exists
  \* ----------------------------------- */

  if (fs.existsSync(targetDir) && !isDirEmpty(targetDir)) {
    const shouldOverwrite = await select({
      message: `Target directory ${c.cyan(targetDir)} is not empty. Override?`,
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ]
    })

    if (isCancel(shouldOverwrite)) return exit();

    shouldOverwrite
      ? emptyDir(targetDir)
      : exit()
  }


  /* ----------------------------------- *\
     3. Get a package name
  \* ----------------------------------- */

  if (!isValidPackageName(packageName)) {
    const providedPackageName = await text({
      message: "Provide a name for your package",
      defaultValue: toValidPackageName(packageName),
      placeholder: toValidPackageName(packageName),
      validate: (value) => {
        return !value || isValidPackageName(value)
          ? "Invalid package name"
          : undefined
      }
    })

    if (isCancel(providedPackageName)) return exit();
    packageName = transformTargetDir(providedPackageName)
  }


  /* ----------------------------------- *\
     4. Choose a template
  \* ----------------------------------- */

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


  /* ----------------------------------- *\
     5. Get package manager
  \* ----------------------------------- */

  packageManager = getPackageManager(process.env.npm_config_user_agent)


  /* ----------------------------------- *\
     6. Should install or only scaffold
  \* ----------------------------------- */

  const job = await select({
    message: "Generate project and install dependencies?",
    options: [
      { label: "Generate only", value: "generate" },
      { label: "Generate and install", value: "genAndInstall" },
    ]
  })
  if (isCancel(job)) return exit();
  scaffoldMode = job


  /* ----------------------------------- *\
     7. Generate the project
  \* ----------------------------------- */

  const root = path.join(cwd, targetDir)
  fs.mkdirSync(root, { recursive: true })
  log.step(`Scaffolding ${c.cyan(targetDir)} in ${c.cyan(root)}`)

  /* Copy template files */
  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../../templates",
    template
  )

  const files = fs.readdirSync(templateDir)
  for (const file of files) {
    if (file === "package.json") continue
    copy(path.join(templateDir, file), path.join(root, file))
  }

  const packageJsonPath = path.join(templateDir, "package.json")
  const packageJson = JSON.parse(
    fs.readFileSync(packageJsonPath, "utf-8")
  )

  packageJson.name = packageName
  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2) + '\n')

  if (scaffoldMode === 'genAndInstall') {
    log.step(`Installing dependencies with ${c.cyan(packageManager)}...`)
    run([packageManager, "install"], {
      stdio: 'inherit',
      cwd: root
    })
  }


  /* ----------------------------------- *\
     8. Outro messages
  \* ----------------------------------- */

  const isInProjectDir = path.relative(cwd, root) !== '';
  const isInstalled = scaffoldMode !== 'genAndInstall';
  const outroDone = `Project created ${c.greenBright('successfully')}!`;
  const outroInfoMessage = c.blue(`Next steps:\n`)

  const outroCd = `${c.blue('cd')} ${c.cyan(targetDir)}`;
  const outroInstall = c.blue(`${packageManager} install`);
  const outroDev = c.blue(`${packageManager} dev`);
  const outroTest = c.blue(`${packageManager} test`);

  const outroCmd = (command: string = "", description: string = "") =>
    `  ${c.blue(command)}\n\t${c.dim(description)}`;

  interface OutroStep {
    type: "text" | "cmd"
    show: boolean,
    msg?: string,
    cmd?: string,
    desc?: string
  }

  const outroStepps: OutroStep[] = [
    { type: "text", msg: outroDone, show: true },
    { type: "text", msg: outroInfoMessage, show: true },
    { type: "cmd", cmd: outroCd, desc: "Go to project directory", show: isInProjectDir },
    { type: "cmd", cmd: outroInstall, desc: "Install dependencies", show: isInstalled },
    { type: "cmd", cmd: outroDev, desc: "Run development server", show: true },
    { type: "cmd", cmd: outroTest, desc: "Run tests", show: true },
  ]

  const outroMessagee = outroStepps
    .filter(step => step.show)
    .map(step => step.type === "text"
      ? step.msg
      : outroCmd(step.cmd, step.desc)
    ).join("\n   ")

  outro(outroMessagee)
}


init().catch(error => {
  console.error(error)
})



/* ----------------------------------- *\
   HELPERS
\* ----------------------------------- */

const exit = () => {
  cancel("Cancelled");
  process.exit(0)
}

const transformTargetDir = (name: string) => {
  return name
    .trim()
    .replace(/[<>:"\\|?*]/g, '') // Remove forbidden characters
    .replace(/\/+$/g, "") // Remove trailing slashes
}

const isValidPackageName = (projectName: string) => {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName,
  )
}

const toValidPackageName = (projectName: string) => {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // Spaces => hyphens
    .replace(/^[._]/, '') // Remove leading dots
    .replace(/[^a-z\d\-~]+/g, '-') // Non-alphanumeric characters => hyphens
}

const isDirEmpty = (path: string) => fs.readdirSync(path).length === 0

const getPackageManager = (userAgent: string | undefined) => {
  if (!userAgent) return "npm"
  const _specs = userAgent.split(" ")[0]
  const manager = _specs.split("/")[0]
  return manager
}

const copy = (src: string, dest: string) => {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

const copyDir = (srcDir: string, destDir: string) => {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const src = path.resolve(srcDir, file)
    const dest = path.resolve(destDir, file)
    copy(src, dest)
  }
}

const emptyDir = (dir: string) => {
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

const run = ([command, ...args]: string[], options?: SpawnOptions) => {
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
