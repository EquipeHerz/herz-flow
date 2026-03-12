# Herz Flow

Herz Flow is a comprehensive web application designed to streamline the management of companies, users, and contracts. It features a modern, responsive landing page with an interactive chatbot demo, robust authentication, and a feature-rich dashboard for administrators and users.

## 🚀 Features

### Public Landing Page
-   **Hero Section**: Engaging introduction to the platform.
-   **About & Services**: Detailed information about what Herz Flow offers.
-   **Interactive Chatbot Demo**: A live demonstration of the chatbot capabilities directly on the landing page.
-   **Client Showcase**: Display of partners and clients.
-   **Contact Form**: Easy way for potential clients to get in touch.
-   **Floating Elements**: Interactive UI elements for better engagement.
-   **WhatsApp Integration**: Direct link to support/sales via WhatsApp.

### Authentication & Security
-   **Secure Login**: Role-based authentication system.
-   **Registration**: Separate flows for User and Company registration.
-   **Role-Based Access Control (RBAC)**:
    -   **System Admin**: Full access to all resources.
    -   **Company Admin**: Manage company-specific data and users.
    -   **Sector Admin**: Manage users within specific sectors.
    -   **Standard User**: Access to personal dashboard and profile.
-   **Protected Routes**: Ensures sensitive pages are only accessible to authorized users.

### Dashboard & Management
-   **Dashboard**: Overview of key metrics and statistics (using Recharts).
-   **Company Management**:
    -   Register new companies.
    -   List and filter existing companies.
    -   Manage company details.
-   **User Management**:
    -   Register new users with specific roles.
    -   List and manage users.
-   **Contract Editor**:
    -   Create and edit contracts directly within the application.
    -   Export capabilities (PDF/Print).
-   **Profile Management**: Update user personal information and settings.

### UI/UX
-   **Modern Design**: Built with Tailwind CSS and Shadcn UI for a clean, consistent look.
-   **Responsive Layout**: Fully optimized for mobile, tablet, and desktop.
-   **Dark/Light Mode**: Integrated theme toggling.
-   **Animations**: Smooth transitions using Framer Motion.
-   **Toast Notifications**: Real-time feedback for user actions (Sonner/Toaster).

## 🛠️ Tech Stack

### Frontend
-   **React**: UI library for building the interface.
-   **Vite**: Next-generation frontend tooling for fast builds.
-   **TypeScript**: Static typing for better code quality and developer experience.

### Styling & Components
-   **Tailwind CSS**: Utility-first CSS framework.
-   **Shadcn UI**: Re-usable components built with Radix UI and Tailwind.
-   **Styled Components**: CSS-in-JS for component-level styling.
-   **Framer Motion**: Production-ready animation library for React.
-   **Lucide React**: Beautiful & consistent icons.

### State Management & Data Fetching
-   **React Query (TanStack Query)**: Powerful asynchronous state management.
-   **React Context**: Used for global Auth state.

### Routing
-   **React Router DOM**: Client-side routing.

### Forms & Validation
-   **React Hook Form**: Performant, flexible and extensible forms.
-   **Zod**: TypeScript-first schema declaration and validation.

### Utilities
-   **Leaflet / React Leaflet**: Interactive maps.
-   **Recharts**: Composable charting library.
-   **jsPDF / react-to-print**: PDF generation and printing.
-   **XLSX**: Spreadsheet parser and writer.
-   **date-fns**: Modern JavaScript date utility library.

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/EquipeHerz/herz-flow.git
    cd herz-flow
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    # or
    bun install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

[License Name] - see the LICENSE file for details.
