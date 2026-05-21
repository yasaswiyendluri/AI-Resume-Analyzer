# AI Resume Analyzer 🚀

Built an AI-powered Resume Analyzer using React, React Router v7, Puter.js, and Tailwind CSS.
The application allows users to upload resumes, analyze them against job descriptions, and receive ATS scores, keyword matching insights, and AI-generated feedback through a modern responsive UI.

**Live Demo:** [https://ai-resume-analyzer-yasaswi.netlify.app/](https://ai-resume-analyzer-yasaswi.netlify.app/)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Key Technologies](#key-technologies)
- [What I Learned](#what-i-learned)
- [Contributing](#contributing)

---

## Features

### ✅ Smart Resume Analysis
- **ATS Compatibility Score** - Get a detailed score showing how well your resume aligns with ATS systems
- **Resume-Job Matching** - Compare your resume against specific job descriptions for precise alignment
- **Keyword Detection** - Identify missing keywords that recruiters and ATS systems look for
- **AI-Generated Feedback** - Receive actionable suggestions to improve your resume

### 🔐 Secure & Private
- **Browser-Based Authentication** - Powered by Puter.js with no backend server needed
- **Client-Side Processing** - All PDF parsing and analysis happens in your browser
- **Secure File Storage** - Your resumes are stored securely via Puter.js

### 🎨 Modern User Experience
- **Fully Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Clean UI/UX** - Intuitive interface built with Tailwind CSS and shadcn/ui
- **Fast Performance** - Optimized Vite build for lightning-fast load times

### 🛠️ Developer Friendly
- **Modular Architecture** - Clean, reusable component structure
- **TypeScript** - Type-safe codebase for better maintainability
- **Modern Tooling** - React Router v7, Vite, and Zustand for state management

---

## Tech Stack

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality component library

### Routing & Build
- **React Router v7** - Modern routing framework
- **Vite** - Fast build tool and dev server

### State Management
- **Zustand** - Lightweight state management

### Backend & Services
- **Puter.js** - Browser-based backend services
  - Authentication system
  - File storage
  - AI integrations

### AI & Processing
- **pdfjs-dist** - Client-side PDF parsing with Web Workers
- **AI API Integration** - Resume analysis and scoring

### Deployment
- **Netlify** - Hosting platform

---

## Getting Started

### Prerequisites
- Node.js 16+ and npm installed
- Git for cloning the repository
- A modern web browser

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yasaswiyendluri/AI-Resume-Analyzer.git
   cd AI-Resume-Analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

---

## Installation

### Step-by-Step Setup

```bash
# Clone the repository
git clone https://github.com/yasaswiyendluri/AI-Resume-Analyzer.git

# Navigate to the project directory
cd AI-Resume-Analyzer

# Install all dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
If needed, create a `.env` file in the root directory (currently not required for local development).

---

## Usage

### Analyzing Your Resume

1. **Upload Your Resume**
   - Click "Analyze my resume" button
   - Upload a PDF file of your resume

2. **Add Job Description**
   - Paste the target job description
   - The AI will analyze your resume against it

3. **View Results**
   - **ATS Score** - How well your resume fits ATS systems (0-100)
   - **Matching Keywords** - Keywords from the job description found in your resume
   - **Missing Keywords** - Critical keywords to add
   - **AI Suggestions** - Specific recommendations for improvement

4. **Download & Share**
   - View your detailed analysis report
   - Use insights to improve your resume

---

## Project Structure

```
AI-Resume-Analyzer/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Header.tsx
│   │   ├── ResumeUpload.tsx
│   │   ├── AnalysisResult.tsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── Home.tsx
│   │   ├── Analyze.tsx
│   │   ├── Results.tsx
│   │   └── ...
│   ├── store/              # Zustand state management
│   │   └── resumeStore.ts
│   ├── utils/              # Helper functions
│   │   ├── pdfParser.ts
│   │   ├── aiAnalyzer.ts
│   │   └── ...
│   ├── types/              # TypeScript definitions
│   └── App.tsx
├── public/                 # Static assets
├── package.json
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── README.md
```

---

## Key Technologies

### React Router v7
Modern routing framework providing:
- File-based routing
- Type-safe route definitions
- Seamless data loading

### Puter.js
Enables:
- Browser-based authentication without backend
- Secure file storage
- AI service integrations
- No server infrastructure needed

### PDF.js (pdfjs-dist)
- Client-side PDF parsing
- Web Worker support for non-blocking processing
- Secure browser-only execution

### Tailwind CSS + shadcn/ui
- Rapid UI development
- Consistent design system
- Accessible, pre-built components

### Zustand
Lightweight state management for:
- Resume data
- Analysis results
- User preferences

---



### Live Site
- **URL:** https://ai-resume-analyzer-yasaswi.netlify.app/
- **Repository:** https://github.com/yasaswiyendluri/AI-Resume-Analyzer



---

## What I Learned

Through building this project, I gained experience with:

- ✨ Modern React patterns and hooks
- 📘 TypeScript for type-safe development
- 🔄 React Router v7 framework capabilities
- 🏗️ Vite as a modern build tool
- 📄 PDF parsing with Web Workers for performance
- 🤖 AI API integration workflows
- 🎨 Building responsive UIs with Tailwind CSS
- 🌐 SPA deployment and routing configuration
- 📦 State management with Zustand
- 🚀 Production troubleshooting and optimization
- 🔐 Browser-based authentication patterns

---

## Performance Optimizations

- **Client-side processing** - Reduces server load and ensures privacy
- **Lazy loading** - Components and routes load on-demand
- **Code splitting** - Vite automatically optimizes bundle size
- **Web Workers** - PDF parsing doesn't block the main thread
- **Efficient state management** - Zustand provides minimal overhead

---

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---


## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---


## Author

**Yendluri Yasaswi** - [GitHub Profile](https://github.com/yasaswiyendluri)

---


## Future Enhancements

Potential features for future versions:
- [ ] Cover letter analyzer
- [ ] Interview prep tips based on resume analysis
- [ ] Multiple resume management
- [ ] Export analysis as PDF report
- [ ] Resume templates
- [ ] Skill endorsements
- [ ] Dark mode


---

## Resources

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Puter.js Documentation](https://docs.puter.com)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [TypeScript Documentation](https://www.typescriptlang.org)

---

**Last Updated:** May 2026

**Status:** ✅ Active & Maintained
