import path from "node:path"; import { ProjectConfig } from "./types"
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { copy, run } from "./utils";


export const scaffoldProject = (config: ProjectConfig, cwd: string) => {
  const root = path.join(cwd, config.targetDir);

  fs.mkdirSync(root, { recursive: true });

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../../templates",
    config.template
  );

  const files = fs.readdirSync(templateDir);
  for (const file of files) {
    if (file === "package.json") continue;
    copy(path.join(templateDir, file), path.join(root, file));
  }

  updatePackageJson(root, templateDir, config.packageName);

  return root;
}


const updatePackageJson = (root: string, templateDir: string, packageName: string) => {
  const packageJsonPath = path.join(templateDir, "package.json")
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"))

  packageJson.name = packageName

  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify(packageJson, null, 2) + "\n"
  )
}


export const installDependencies = (root: string, packageManager: string) => {
  return run([packageManager, "install"], {
    stdio: "inherit",
    cwd: root,
  });
}
