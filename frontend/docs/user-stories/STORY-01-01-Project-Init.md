# STORY-01-01: Project Initialization

## 1. Description
Initialize the frontend project structure using Vite, React, and TypeScript. This forms the bedrock of the entire application, ensuring all core dependencies and configuration builds are in place.

## 2. Goals
- Set up a modern, performant development environment.
- Establish the base UI theming layer (Material UI).
- Define the directory structure for future scalability.

## 3. Acceptance Criteria
- [ ] **Project Created**: `frontend` directory contains a working Vite + React + TypeScript setup.
- [ ] **Dependencies Installed**:
    - `mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`.
    - `zustand` (State).
    - `react-router-dom` (Routing).
    - `axios` (HTTP Requests).
    - `tanstack/react-query` (Data Fetching).
- [ ] **Theme Configured**:
    - MUI ThemeProvider is active at the root.
    - Default mode is **Dark Mode**.
    - Primary colors configured (e.g., Teal/Green for profit, Red for loss).
- [ ] **Clean Slate**: Remove default Vite/React boilerplate code (logos, count state).

## 4. Technical Notes
- Use `npm create vite@latest frontend -- --template react-ts`.
- Directory structure should ideally include:
    - `src/components/common`
    - `src/components/layout`
    - `src/hooks`
    - `src/pages`
    - `src/store`
    - `src/api`
    - `src/types`
