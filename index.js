#!/usr/bin/env node

const { program } = require("commander");
const inquirer = require("inquirer");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
async function installDependencies(packages, dev = false, projectPath) {
  try {
    const installType = dev ? "--save-dev" : "--save";
    console.log(`Installing ${packages.join(", ")}...`);
    execSync(`npm install ${installType} ${packages.join(" ")}`, {
      cwd: projectPath, // Ensure installation happens in the project directory
      stdio: "inherit",
    });
    console.log(`Installed ${packages.join(", ")} successfully.`);
  } catch (error) {
    console.error(`Failed to install packages: ${error.message}`);
  }
}

// Function to copy directories and files
async function copyDirectory(src, dest) {
  await fs.ensureDir(dest);
  await fs.copy(src, dest, { overwrite: true });
}

// Function to enhance package.json
function enhancePackageJson(projectPath) {
  const packageJsonPath = path.join(projectPath, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = require(packageJsonPath);

    // Add or modify scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      lint: "eslint src/",
      format: "prettier --write src/",
    };

    // Add additional dependencies
    packageJson.dependencies = {
      ...packageJson.dependencies,
      axios: "^0.21.1",
    };

    // Add dev dependencies
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      eslint: "^7.32.0",
      prettier: "^2.3.2",
    };

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("Updated package.json with additional configurations.");
  }
}

// Function to create a project from scratch
async function createFromScratch(language, type, options) {
  const currentPath = process.cwd();
  const projectDir = path.join(currentPath, type);

  if (!fs.existsSync(projectDir)) {
    console.log("Project directory does not exist. Creating new project...");

    // Initialize the project
    if (language === "javascript" && type === "react") {
      execSync(`npm create vite@latest ${type} --template react`, {
        cwd: currentPath,
        stdio: "inherit",
      });
    } else if (language === "javascript" && type === "vue") {
      execSync(`npm init vue@latest ${type} --template vue`, {
        cwd: currentPath,
        stdio: "inherit",
      });
    }

    // Move into the project directory
    const projectPath = path.join(currentPath, type);

    // Handle dependencies
    const dependencies = [];
    const devDependencies = [];

    if (options.uiLibrary === "Material-UI") {
      dependencies.push("@mui/material", "@emotion/react", "@emotion/styled");
    }

    if (options.uiLibrary === "Bootstrap") {
      dependencies.push("bootstrap");
    }

    // Handle Routing
    if (options.useRouting) {
      dependencies.push("react-router-dom");
    }

    // Install dependencies
    if (dependencies.length > 0) {
      await installDependencies(dependencies, false, projectPath);
    }

    // Install dev dependencies
    if (devDependencies.length > 0) {
      await installDependencies(devDependencies, true, projectPath);
    }

    enhancePackageJson(projectPath);
    console.log("Project created and enhanced successfully.");
  } else {
    console.log("Project directory already exists.");
  }
}
// Function to enhance an existing project
async function enhanceProject(projectPath, options) {
  const templatePath = path.join(
    __dirname,
    "templates",
    options.language,
    options.type
  );

  if (fs.existsSync(templatePath)) {
    await copyDirectory(templatePath, projectPath);
    const dependencies = [];
    const devDependencies = [];

    // Handle UI Library
    if (options.uiLibrary === "Material-UI") {
      dependencies.push("@mui/material", "@emotion/react", "@emotion/styled");
    }

    if (options.uiLibrary === "Bootstrap") {
      dependencies.push("bootstrap");
    }

    // Handle Routing
    if (options.useRouting) {
      dependencies.push("react-router-dom");
    }

    // Install dependencies
    if (dependencies.length > 0) {
      await installDependencies(dependencies, false);
    }

    // Install dev dependencies
    if (devDependencies.length > 0) {
      await installDependencies(devDependencies, true);
    }

    enhancePackageJson(projectPath);
    console.log(`Enhanced project structure in ${options.language}`);
  } else {
    console.log("Template not found.");
  }
}

// CLI Commands
program
  .command("create <language> <type>")
  .description("Create a new project")
  .action(async (language, type) => {
    console.log(`Selected language: ${language}, type: ${type}`);

    const primaryAnswers = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Do you want to create a project from scratch ?",
        choices: ["Create from scratch"],
        default: "Create from scratch",
      },
    ]);

    const projectDir = path.join(process.cwd(), type);

    if (primaryAnswers.action === "Create from scratch") {
      const answers = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: `Are you sure you want to create a ${type} project from scratch in ${language}?`,
          default: true,
        },
        {
          type: "list",
          name: "uiLibrary",
          message: "Which UI library do you want to install?",
          choices: ["None", "Material-UI", "Bootstrap"],
          default: false,
          when: () => type === "react" || type === "vue",
        },
        {
          type: "confirm",
          name: "useRouting",
          message: "Do you want to include routing (e.g., react-router-dom)?",
          default: false,
          when: () => type === "react",
        },
      ]);

      if (answers.confirm) {
        const options = {
          uiLibrary: answers.uiLibrary,
          useRouting: answers.useRouting,
        };

        await createFromScratch(language, type, options);
        await enhanceProject(projectDir, {
          language,
          type,
          uiLibrary: answers.uiLibrary,
          useRouting: answers.useRouting,
        });
      } else {
        console.log("Operation canceled.");
      }
    } else if (primaryAnswers.action === "Enhance existing project") {
      const enhanceAnswers = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: `Are you sure you want to enhance the ${type} project in ${language}?`,
          default: true,
        },
        {
          type: "list",
          name: "uiLibrary",
          message: "Which UI library do you want to install?",
          choices: ["None", "Material-UI", "Bootstrap"],
          default: "None",
          when: (answers) => answers.confirm,
        },
        {
          type: "confirm",
          name: "useRouting",
          message: "Do you want to include routing (e.g., react-router-dom)?",
          default: false,
          when: (answers) => answers.confirm && type === "react",
        },
      ]);

      if (enhanceAnswers.confirm) {
        await enhanceProject(projectDir, {
          language,
          type,
          uiLibrary: enhanceAnswers.uiLibrary,
          useRouting: enhanceAnswers.useRouting,
        });
      } else {
        console.log("Operation canceled.");
      }
    }
  });

program.parse(process.argv);
