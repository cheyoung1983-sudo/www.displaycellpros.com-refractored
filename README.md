<div align="center">
  <img width="1200" height="475" alt="Display & Cell Pros Banner" src="/logo.png" />
</div>

# Display & Cell Pros

This repository contains the source code for the **Display & Cell Pros** web application, built with Next.js 16, Tailwind CSS, and Prisma.

## Getting Started

### Prerequisites

- **Node.js**: v22.0.0 or higher
- **npm**: v10.0.0 or higher

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-repo/displaycellpros.git
    cd displaycellpros
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure environment variables**:
    Create a `.env.local` file in the root directory and add the required variables. You can use [.env.example](.env.example) as a template.
    ```bash
    cp .env.example .env.local
    ```

4.  **Database Setup**:
    Generate the Prisma client and push the schema to your database:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

### Development

Run the development server:

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Deployment

This project is optimized for deployment on **Vercel**. Use the provided script for a standardized deployment workflow:

```powershell
./scripts/deploy_vercel.ps1
```

## Documentation

- [Production Operations Guide](README_PROD.md)
- [Project Tasks and TODOs](TODO.md)
