# Development Guide

## Project Overview
This project consists of two subprojects:
- **SFU Server (Node.js)**: Backend for media server operations.
- **Client (Vite + React)**: Frontend for the user interface.

The project uses a monorepo structure, where the root folder contains shared dependencies and scripts.

---

## Installing Dependencies

1. **Install all shared dependencies**:
   Run the following command in the root directory to install shared dependencies for both subprojects:
   ```bash
   yarn install
   ```

2. **Install dependencies for a specific subproject**:
   If you need to install a package for a specific subproject:
   - Navigate to the folder (`sfu` or `client`).
   - Run the installation command, e.g.,:
     ```bash
     cd sfu
     yarn add <package-name>
     ```
     or
     ```bash
     cd client
     yarn add <package-name>
     ```

---

## Root Package Scripts

The root folder contains shared scripts to manage the entire project. Below is a description of each script:

### Scripts

- **`lint`**:
  ```bash
  yarn lint
  ```
  Runs ESLint to analyze code for linting issues in all `*.ts` and `*.tsx` files across the project.

- **`lint:fix`**:
  ```bash
  yarn lint:fix
  ```
  Runs ESLint to automatically fix linting issues.

- **`format`**:
  ```bash
  yarn format
  ```
  Formats all project files using Prettier.

- **`build`**:
  ```bash
  yarn build
  ```
  Builds both the SFU server and the client subprojects.

- **`build:sfu`**:
  ```bash
  yarn build:sfu
  ```
  Builds the SFU server subproject.

- **`build:client`**:
  ```bash
  yarn build:client
  ```
  Builds the client subproject.

- **`dev`**:
  ```bash
  yarn dev
  ```
  Starts both the SFU server and the client in development mode concurrently.

---

## Guide for the Vite Client

The client is built using Vite and React. Below are the steps to work with the client:

1. **Install Dependencies**:
   ```bash
   cd client
   yarn install
   ```

2. **Run in Development Mode**:
   ```bash
   yarn dev
   ```
   This starts the development server on the client side.

3. **Build for Production**:
   ```bash
   yarn build
   ```
   This generates the production-ready static files in the `dist` folder.

4. **Lint and Format**:
   - Lint:
     ```bash
     yarn lint
     ```
   - Format:
     ```bash
     yarn format
     ```

---

## Guide for the SFU Server

The SFU server is built using Node.js. Below are the steps to work with the server:

1. **Install Dependencies**:
   ```bash
   cd sfu
   yarn install
   ```

2. **Run in Development Mode**:
   ```bash
   yarn dev
   ```
   This starts the server in development mode, watches for file changes, and applies database migrations.

3. **Build for Production**:
   ```bash
   yarn build
   ```
   This builds the server into the `dist` folder.

4. **Run the Server**:
   ```bash
   yarn start
   ```
   This starts the production server.

5. **Testing**:
   - Run all tests:
     ```bash
     yarn test
     ```
   - Watch for file changes and re-run tests:
     ```bash
     yarn test:watch
     ```
   - Generate a coverage report:
     ```bash
     yarn test:coverage
     ```

6. **Lint and Format**:
   - Lint:
     ```bash
     yarn lint
     ```
   - Format:
     ```bash
     yarn format
     ```

---

## Guide for Drizzle-Kit

Drizzle-Kit is used to manage database migrations and schema generation.

### Scripts

- **`db:migrate`**:
  ```bash
  yarn db:migrate
  ```
  Applies all pending database migrations.

- **`db:push`**:
  ```bash
  yarn db:push
  ```
  Pushes the schema to the database without creating migrations.

- **`db:generate-dev`**:
  ```bash
  yarn db:generate-dev
  ```
  Generates TypeScript types for the database schema for development.

- **`db:studio`**:
  ```bash
  yarn db:studio
  ```
  Opens a web interface for managing the database.

---

## Development Workflow

1. **Install dependencies**:
   Run `yarn install` in the root directory.

2. **Start development servers**:
   ```bash
   yarn dev
   ```
   This starts both the client and SFU server concurrently.

3. **Apply database migrations (if needed)**:
   ```bash
   yarn db:migrate
   ```

4. **Build for production**:
   ```bash
   yarn build
   ```

5. **Run tests**:
   ```bash
   yarn test
   ```

