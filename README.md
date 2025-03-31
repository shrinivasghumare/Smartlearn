# Smartlearn ✨

Welcome to **Smartlearn**! This project is built using **Next.js** with support for modern web features like authentication, state management, and page-based routing. Below you'll find all the information you need to get started with this project.

## Table of Contents

- [Installation](#installation-%EF%B8%8F)
- [Project Structure](#project-structure-%EF%B8%8F)
- [Features](#features-)
- [Component Breakdown](#component-breakdown-)
- [Usage](#usage-)
- [Contributing](#contributing-)

---

## Installation 🛠️

To run this project locally, follow these steps:

1. **Clone the repository:**

    ```bash
    git clone https://github.com/shrinivasghumare/Smartlearn.git
    ```

2. **Navigate to the project folder:**

    ```bash
    cd Smartlearn-main
    ```

3. **Install dependencies:**

    This project uses npm for package management. Install the required dependencies by running:

    ```bash
    npm install
    ```

4. **Run the development server:**

    After installing the dependencies, start the development server:

    ```bash
    npm run dev
    ```

    This will launch the app at `http://localhost:3000`.

---

## Project Structure 🏗️

Here's a quick overview of the project structure, with key files and folders:

```bash
Smartlearn/
├── src/
│   ├── app/
│   │   ├── (auth)/        # Authentication-related components and pages
│   │   ├── (components)/  # Reusable UI components
│   │   ├── (pages)/       # Main pages of the application
│   │   ├── _lib/          # Utility functions and helpers
│   │   ├── assets/        # Static assets like images and icons
│   │   ├── context/       # Global context and state management
│   │   ├── globals.css    # Global styles
│   │   ├── layout.jsx     # Main layout component
│   │   ├── page.jsx       # Home page component
├── package.json           # Project dependencies and scripts
├── README.md              # This file
```

---

## Features 🚀

- **User Authentication:** Login and signup functionality is managed through the `auth` directory.
- **Dynamic Pages:** Different pages of the app are built using Next.js' file-based routing system.
- **Reusable Components:** UI elements are modular and reusable, making the project easy to maintain.
- **Global State Management:** Shared state is managed through the `context` folder.
- **Mobile Responsive:** The app is fully responsive, offering a seamless experience across devices.

---

## Component Breakdown 🧩

### Authentication `(auth/)`
This folder contains components and pages that handle user authentication, including:

- `login.jsx`: Handles user login.
- `signup.jsx`: Handles user registration.

### Components `(components/)`
Reusable UI elements that appear across the app, including:

- `Header.jsx`: The app's main header/navigation bar.
- `VideoPlayer.jsx`: A custom video player for playing content.

### Pages `(pages/)`
This contains the app’s core pages like:

- `Home.jsx`: The home page, which lists videos and user posts.
- `Profile.jsx`: Displays the user’s profile, including uploaded content.

### Utility Functions `(_lib/)`
Helper functions for data manipulation, API calls, etc.

### Global Styles `globals.css`
This file contains the main styles that apply across the entire app.

---

## Usage 💻

After installing the project, you can modify any of the components or pages as needed. The most common commands are:

- **`npm run dev`**: Start the development server.
- **`npm run build`**: Create a production build.
- **`npm run lint`**: Run ESLint checks to maintain code quality.

---

## Contributing 🤝

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Push to your branch and create a pull request.

### CODED WITH 💖 BY PS
