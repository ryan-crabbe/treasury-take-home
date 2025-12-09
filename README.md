# Alcohol Label Validation System

A full-stack application that uses OCR (Optical Character Recognition) to validate alcohol beverage labels for compliance with regulatory requirements.

## Technology Stack

### Backend

- **NestJS**: A progressive Node.js framework for building efficient server-side applications
- **TypeScript**: Type-safe JavaScript development
- **Tesseract.js**: OCR library for text extraction from images
- **Multer**: Middleware for handling file uploads
- **Zod**: Schema validation library
- **Fuzzball**: Fuzzy string matching for text comparison

### Frontend

- **React 19**: Modern React with latest features
- **Vite**: Fast build tool and development server
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework
- **React Hook Form**: Performant forms with easy validation
- **TanStack Query**: Powerful data synchronization for React
- **shadcn/ui**: High-quality, accessible UI components
- **Lucide React**: Beautiful & consistent icon library

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd treasury-take-home
   ```

2. **Set up environment variables**

   Create a `.env` file in the `alcohol-labeler-frontend` directory:

   ```bash
   cd alcohol-labeler-frontend
   echo "FRONTEND_URL=http://localhost:5173" > .env
   echo "VITE_API_URL=http://localhost:3000" >> .env
   ```

   Create a `.env` file in the `alcohol-labeler-backend` directory:

   ```bash
   cd ../
   echo "FRONTEND_URL=http://localhost:5173" > .env
   echo "VITE_API_URL=http://localhost:3000" >> .env
   ```

3. **Install dependencies**

   Install backend dependencies:

   ```bash
   cd alcohol-labeler-backend
   npm install
   ```

   Install frontend dependencies:

   ```bash
   cd ../alcohol-labeler-frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**

   ```bash
   cd alcohol-labeler-backend
   npm run start:dev
   ```

   The API will be available at `http://localhost:3000`

2. **Start the frontend development server** (in a new terminal)
   ```bash
   cd alcohol-labeler-frontend
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## Features

- **Image Upload**: Upload alcohol label images for validation
- **OCR Processing**: Extract text from label images using Tesseract.js
- **Label Validation**: Check compliance against regulatory requirements
- **Results Display**: View validation results with detailed feedback
- **Responsive UI**: Modern, accessible interface built with shadcn/ui components

## API Endpoints

- `POST /label-validation/validate` - Upload and validate an alcohol label image
- `GET /label-validation` - Retrieve all label validations

## Development

### Backend Development

```bash
cd alcohol-labeler-backend
npm run start:dev  # Start in watch mode
npm run test       # Run tests
npm run lint       # Run linter
```

### Frontend Development

```bash
cd alcohol-labeler-frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run linter
```

## Project Structure

```
treasury-take-home/
├── alcohol-labeler-backend/     # NestJS API server
│   ├── src/
│   │   ├── label-validation/    # Label validation module
│   │   ├── ocr/                 # OCR service
│   │   └── ...
│   └── uploads/                 # Uploaded files directory
├── alcohol-labeler-frontend/    # React frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── queries.ts           # API queries
│   │   └── ...
│   └── public/                  # Static assets
└── README.md
```

## License

This project is for educational/demonstration purposes.
