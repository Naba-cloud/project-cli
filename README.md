Project CLI is a command-line tool designed to enhance the folder structure of JavaScript projects, including frameworks like React, and Vue. This tool extends the basic setup provided by tools like Create React App (CRA) and Vite, applying professional best practices to help you create and maintain scalable projects.

Features
Enhanced Folder Structure: Extends basic project setups with additional folders and configurations for scalability and maintainability.
Supports Multiple Frameworks: Works with popular JavaScript frameworks like React, Vue.
Customizable: Easily extend or modify the generated structure to fit your project needs.
Professional Best Practices: Implements industry-standard practices for organizing files and code.

To install the Project CLI globally on your system, use npm:

npm install -g project-cli
If you're working with the source code and want to link it globally, navigate to the project directory and run:
npm link
After installation, you can use the project-cli command to create a new project with an enhanced folder structure.
Creating a New Project
To create a new project with a specific framework, run:
project-cli create <language> <framework>
Troubleshooting
If you encounter any issues, such as the command not being recognized, ensure that:
The global npm directory is in your PATH.
You have run the npm link successfully.
You have the correct permissions to install global npm packages.
