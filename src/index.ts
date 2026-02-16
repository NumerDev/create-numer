import { intro, log, outro } from "@clack/prompts"
import fs from "node:fs"
import path from "node:path"
import c from "picocolors"
import { PackageManager, ProjectConfig, ScaffoldMode } from "./types"
import { getPackageNamePrompt, getProjectNamePrompt, promptScaffoldMode, promptTemplate, shouldOverwritePrompt } from "./prompts"
import { emptyDir, exit, getPackageManager, isDirEmpty, isValidPackageName, toValidPackageName, } from "./utils"
import { installDependencies, scaffoldProject } from "./scaffold"


const cwd = process.cwd();
const defaultProjectName = "project-name"
let targetDir = defaultProjectName
let template = "none"
let packageManager: PackageManager = "pnpm"
let scaffoldMode: ScaffoldMode = "generate"
let packageName = defaultProjectName

const init = async () => {
  intro(c.bgCyan(c.black(" Numer v0.0.0 ")));


  /* ----------------------------------- *\
     1. Project name
  \* ----------------------------------- */

  targetDir = await getProjectNamePrompt(defaultProjectName)
  packageName = path.basename(path.resolve(targetDir))


  /* ----------------------------------- *\
     2. Check if target dir exists
  \* ----------------------------------- */

  if (fs.existsSync(targetDir) && !isDirEmpty(targetDir)) {
    const shouldOverwrite = await shouldOverwritePrompt(targetDir)

    if (!shouldOverwrite) return exit();
    emptyDir(targetDir);
  }


  /* ----------------------------------- *\
     3. Get a package name
  \* ----------------------------------- */

  packageName = isValidPackageName(packageName)
    ? toValidPackageName(packageName)
    : await getPackageNamePrompt(packageName)


  /* ----------------------------------- *\
     4. Choose a template
  \* ----------------------------------- */

  template = await promptTemplate()

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

  scaffoldMode = await promptScaffoldMode();


  /* ----------------------------------- *\
     7. Generate the project
  \* ----------------------------------- */

  const config: ProjectConfig = {
    targetDir,
    packageName,
    template,
    packageManager,
    scaffoldMode,
  }

  log.step(`Scaffolding ${c.cyan(targetDir)}`)

  const root = scaffoldProject(config, cwd)

  if (config.scaffoldMode === 'genAndInstall') {
    log.step(`Installing dependencies with ${c.cyan(config.packageManager)}...`)
    installDependencies(root, config.packageManager)
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
