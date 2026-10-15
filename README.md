# ECEForge — Academic Knowledge Hub for ECE Students

> **Learn. Build. Engineer.**

ECEForge is a dedicated academic resource platform exclusively designed for Electronics and Communication Engineering (ECE) students following Visvesvaraya Technological University (VTU) academic schemes.

---

## Key Highlights

- **Scheme-Specific Isolation**: Strictly isolates resources between **VTU 2022 Scheme** and **VTU 2025 Scheme**. No mixed syllabi or wrong module notes.
- **Semester Precision**: Organized semester-by-semester (Semesters 3, 4, 5, 6, and 7).
- **Categorized Study Materials**:
  - Unit-wise Lecture Notes (Units 1 through 5)
  - Complete Subject Notes
  - Previous Examination Question Papers
  - Laboratory Manuals & Viva Preparation
  - Important Examination Questions
- **In-Browser PDF Viewer**: Fullscreen toggle, direct download tracking, and resilient fallback links.
- **Advanced Real-Time Search**: Instant filtering across subject names, VTU codes (e.g. `21EC51`, `BEC302`), units, and categories.
- **Admin Control Center**: Secure administrator dashboard to create schemes, manage semester subjects, upload PDFs up to 25 MB, and manage drafts.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (Midnight Navy, Cyan, Restrained Violet palette)
- **Icons**: Lucide React
- **Backend / Database**: Google Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth (Admin custom claim / roles)
- **Storage**: Firebase Cloud Storage (PDF attachments)
- **Hosting**: Firebase Hosting (Static SPA rewrites)

---

## Getting Started

### 1. Prerequisites
- Node.js (v18 or v20 LTS)
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)

### 2. Environment Variables
Create a `.env.local` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Installation
```bash
npm install
```

### 4. Seed Academic Catalog
Populate initial VTU 2022 and VTU 2025 schemes and core ECE subjects:
```bash
npx tsx scripts/seedData.ts
```

### 5. Run Development Server
```bash
npm run dev
```

### 6. Build for Production
```bash
npm run build
```

---

## Security & Rules

- `firestore.rules`: Public read access for active schemes, subjects, and published resources. Writes restricted to authenticated administrators.
- `storage.rules`: PDFs publicly readable; uploads restricted to authenticated administrators with 25 MB max size and PDF MIME type validation.

---

## License & Attribution

ECEForge is an independent student academic resource project. VTU syllabus codes and names are referenced under educational fair-use principles.
