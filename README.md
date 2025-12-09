# Alcohol Label Validation System

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

## THought Process

Made the client a vite app because I didnt need the resources a next app gives (not going to use its routing/SSR/SEO). I also decided on using tanstack query to make the pattern for querying the server simple and highlights a clear pattern of how to continue to do things in the future. For the form I used react hook form because it does a really good job of letting me but forms together and also giving me a way to validate these forms using a zod schema before they get sent to the server. Decided on having a dedicated NestJS server because I think Nest is like Express but comes with a lot of built in things that makes it easy to grow. I also just like having my server be really structured, in this case because its an mvp I only had a Controller layer, and then a App layer (service files) but if it were to be more serious i would have a dedicated repo layer and maybe also split the App layer into reads and writes service files instead of one/two service files doing everything. I think this rides that fine line of not over engineering but still giving a clear path of how to grow should the project need to handle more requests/users in the future. On the backend for the actual 'AI' processing I used tesseract js and had to play around with a couple different things but for an MVP I found that just normalizing that raw extracted string and then doing some fuzzy search on it yielded the best results. I also gave back the confidence rating to the user should it fail.

I used typescript for the frontend and the backend with a types file for both to keep things consistent but If i had more time I would tweak the tsconfig so that i could have one dto file that exports all the types from the server and also then lets me import them into the frontend, so that I dont have to repeat the types in two different types files.

You can also access the app at https://treasury-take-home.vercel.app/ but keep in mind if its not working right away its because the server is still spinning up (renders free tier means that inactivity = server spins down, so will have to wait 50 seconds max for it to come back up).

## Getting Started

### Prerequisites

- Node.js (v20.19 or higher)
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

## API Endpoints

- `POST /label-validation/validate` - Upload and validate an alcohol label image
- `GET /label-validation` - Retrieve all label validations
- `GET /label-validation/:id` - Retrieve a label validations

## Development

### Backend Development

```bash
cd alcohol-labeler-backend
npm run start:dev
```

### Frontend Development

```bash
cd alcohol-labeler-frontend
npm run dev
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
