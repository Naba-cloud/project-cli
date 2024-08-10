#!/usr/bin/env node

const { program } = require("commander");
const inquirer = require("inquirer");
const fs = require("fs-extra");
const path = require("path");

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

// Main function to create structure
async function createStructure(language, type, options) {
  const currentPath = process.cwd();
  const templatePath = path.join(__dirname, "templates", language, type);

  if (fs.existsSync(templatePath)) {
    await copyDirectory(templatePath, currentPath);
    enhancePackageJson(currentPath);
    console.log(`Enhanced ${type} project structure in ${language}`);
  } else {
    console.log("Template not found.");
  }
}

// CLI Commands
program
  .command("create <language> <type>")
  .description("Create a new project folder structure")
  .action(async (language, type, options) => {
    console.log(`Creating ${type} project in ${language}`);
    const answers = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to create a ${type} project in ${language}?`,
        default: true,
      },
    ]);

    if (answers.confirm) {
      await createStructure(language, type, options);
    } else {
      console.log("Operation canceled.");
    }
  });

program.parse(process.argv);
