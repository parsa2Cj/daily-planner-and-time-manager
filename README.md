# Daily Planner & Time Manager

A modern, dynamic daily planner and time management application designed to help you stay organized, focused, and productive. Built with React, Vite, and Tailwind CSS, and optimized for deployment on Cloudflare.

## Features

- **Dashboard:** Overview of your daily tasks, timeline, and progress.
- **Task Management:** Create, organize, and track your tasks effortlessly.
- **Timeline Section:** Visualize your day and manage your schedule effectively.
- **Authentication:** Secure login and protected routes.
- **Admin Panel:** Specialized view for administrative management.
- **Responsive Design:** A beautiful and fully responsive UI optimized for both desktop and mobile devices.

## Tech Stack

- **Frontend:** React 19, React Router DOM
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (v4), Framer Motion for animations, Lucide React for icons
- **Backend/Deployment:** Designed to be easily deployed on Cloudflare Pages and Workers (using Wrangler)
- **Language:** TypeScript

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd daily-planner-and-time-manager
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy the `.env.example` to `.env.local` or `.env` and fill in the required variables (like your Gemini API key if needed).
   ```bash
   cp .env.example .env.local
   ```

### Running Locally

To start the development server, run:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

To build the application for production, run:

```bash
npm run build
```

This will generate a `dist` folder with the compiled assets.

### Deployment

This project is pre-configured for deployment on Cloudflare using `wrangler`. Make sure you have your Cloudflare account set up and run:

```bash
npx wrangler pages deploy dist
```

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for more details.
