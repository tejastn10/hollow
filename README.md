<p align="center">
  <img src="logo.svg" alt="Hollow Logo">
</p>

# Hollow ⚡

![Electron](https://img.shields.io/badge/Electron-Latest-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19%2B-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-007ACC?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6%2B-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?logo=open-source-initiative&logoColor=white)

**Hollow** is a modern Electron application template with React and TypeScript. Built with
performance and developer experience in mind, it provides a solid foundation for creating
cross-platform desktop applications with web technologies.

---

## Features 🌟

- **Electron Framework**: Build cross-platform desktop apps with JavaScript, HTML, and CSS
- **React + TypeScript**: Modern frontend development with type safety
- **Vite-powered**: Enjoy lightning-fast HMR during development
- **Cross-platform Building**: Easily package for Windows, macOS, and Linux
- **Developer Experience**:
  - **ESLint**: Maintain code quality with static analysis
  - **Prettier**: Keep your codebase consistent with automatic formatting
  - **Hot Reloading**: See changes instantly during development
  - **Production Ready**: Optimized build configurations for all platforms

---

## Getting Started 🚀

### Prerequisites

Ensure you have the following installed:

- **Node.js**: v22 or later
- **npm**: v8 or later

---

### Installation ⚙️

1. Clone the repository:

   ```bash
   git clone https://github.com/tejastn10/hollow.git
   cd hollow
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Your Electron app should launch automatically in development mode.

---

## Development Workflow 💻

### IDE Setup

For the best development experience, we recommend:

- [VSCode](https://code.visualstudio.com/) with the following extensions:
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### Available Scripts

- **Development Mode**:

  ```bash
  npm run dev
  ```

- **Type Checking**:

  ```bash
  npm run typecheck
  ```

- **Linting**:

  ```bash
  npm run lint
  ```

- **Formatting**:

  ```bash
  npm run format
  ```

---

## Building for Production 🏗️

Hollow comes with pre-configured build scripts for all major platforms:

### Windows

```bash
npm run build:win
```

### macOS

```bash
npm run build:mac
```

### Linux

```bash
npm run build:linux
```

### All Platforms

```bash
npm run build
```

Build outputs will be available in the `dist` directory.

---

## Project Structure 📁

```bash
hollow/
├── .husky/                     # Git hooks configuration
│   ├── _/                      # Husky internals
│   ├── commit-msg              # Commit message validation hook
│   └── pre-commit              # Pre-commit hook
├── build/                      # Build-related files
│   ├── entitlements.mac.plist  # macOS app entitlements
│   ├── icon.icns               # macOS app icon
│   ├── icon.ico                # Windows app icon
│   └── icon.png                # Generic app icon
├── out/                        # Build output directory
│   ├── main/                   # Main process compiled files
│   └── preload/                # Preload scripts
├── resources/                  # Resource files
│   └── icon.png                # Application icon
├── src/                        # Source code
├── .gitignore                  # Git ignore configuration
├── .commitlintrc.yml           # Commitlint configuration
├── .nvmrc                      # Node version manager config
├── .prettierignore             # Prettier ignore patterns
├── .prettierrc.yml             # Prettier configuration
├── dev-app-update.yml          # Auto-updater dev configuration
├── electron-builder.yml        # Electron builder configuration
├── eslint.config.mjs           # ESLint configuration
├── LICENSE.md                  # License file
├── package.json                # Project dependencies and scripts
├── package-lock.json           # Locked dependencies
├── README.md                   # Project documentation
├── tsconfig.eslint.json        # TypeScript config for ESLint
├── tsconfig.json               # Main TypeScript configuration
├── tsconfig.node.json          # Node-specific TypeScript config
├── tsconfig.web.json           # Web-specific TypeScript config
└── vite.config.ts              # Vite configuration
```

---

## Customization 🔧

### Application Information

To customize your application details, modify the following files:

- `package.json`: Update name, description, version, and author
- `electron-builder.json`: Configure build options for different platforms

### Styling and Theming

The project includes minimal styling to get you started. Feel free to integrate your preferred
styling solution:

- CSS/SCSS Modules
- Styled Components
- Tailwind CSS
- Material UI or other component libraries

---

## License 📜

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.

---

## Acknowledgments 🙌

- Built with **Electron** for cross-platform desktop applications
- Powered by **Vite** for lightning-fast development
- Strengthened with **TypeScript** for robust applications
- Made with ❤️ for developers who want to build desktop apps with web technologies
