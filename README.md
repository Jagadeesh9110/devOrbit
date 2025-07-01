# 🐞 devOrbit - AI-powered Bug Tracker App

A fast, clean, and AI-enhanced bug tracking tool built for developers, student teams, freelancers, and startups. Track bugs, assign them, upload attachments, and collaborate using advanced analytics and AI insights — all in one place.

---

## 📸 Preview

> Live demo coming soon...

---

## 🚀 Features

### ✅ Pages

- **Main Page**: App overview with AI-powered bug search and OAuth login (Google, GitHub).
- **Dashboard Page**: Bug/project summary with AI-driven insights (bug trends, resolution stats).
- **Projects Page**: Manage projects, view and report bugs with AI-powered duplicate detection.
- **Bugs Page**: Create/edit/search bugs with smart semantic search and Cloudinary uploads (images, PDFs).
- **Team Page**: Manage teams with AI-based insights (skills, workload).
- **Analytics Page**: Get reports powered by AI on bug distribution, resolution times, etc.
- **Profile Page**: View user activity with AI performance hints and social profile linking.
- **Settings Page**: Set user preferences (AI notifications, invite team members, more).

### 🧠 AI Features

- ✅ **Duplicate Detection** using Sentence-BERT
- ✅ **Semantic Bug Search** (meaning-based match, not keyword-based)
- ✅ **AI Analytics**: Smart insights on bugs, team and performance
- 🔜 **Upcoming**: Resolution suggestions, severity/priority prediction, Pinecone vector DB support

### 📂 Core Features

- ✅ JWT and Social OAuth (Google, GitHub) login
- ✅ Create/Edit/Delete bugs
- ✅ Bug assignment, status update, commenting
- ✅ File uploads via Cloudinary (images and PDFs)
- ✅ Bug history, PR linking, time tracking
- ✅ Notifications, team collaboration

---

## 🛠️ Tech Stack

### Frontend

- [Next.js](https://nextjs.org/) (App Router, SSR)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

### Backend

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Node.js](https://nodejs.org/)
- [MongoDB + Mongoose](https://mongoosejs.com/)

### Authentication

- [JWT](https://jwt.io/)
- [NextAuth.js](https://next-auth.js.org/) (Google, GitHub)

### File Uploads

- [Cloudinary](https://cloudinary.com/)

### AI/ML

- [@xenova/transformers](https://www.npmjs.com/package/@xenova/transformers) (HuggingFace models)
- Sentence-BERT: For embeddings and similarity search

---

## 👥 Target Users

| Audience                       | Why It Fits                                         |
| ----------------------------- | --------------------------------------------------- |
| 🏢 Startups & Small Tech Teams | Fast, AI-powered alternative to Jira/ClickUp        |
| 💻 Freelancers / Indie Devs    | Solo-friendly bug tracking with PR links            |
| 🎓 Student Teams               | Collaborative bug fixing + AI learning insights     |
| 🧪 QA Testers & Agencies       | Bug submission + semantic detection + assignments   |
| 🌐 SaaS Product Teams          | Public feedback & scalable reporting (coming soon)  |

---

## 📦 Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- Cloudinary account
- Google and GitHub OAuth credentials

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-username/devOrbit.git
cd devOrbit

# 2. Install dependencies
npm install

# 3. Create .env.local and add the following:
```

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT Secrets
JWT_ACCESS_TOKEN=your_access_secret
JWT_REFRESH_TOKEN=your_refresh_secret
JWT_VERIFICATION_TOKEN=your_verification_secret
JWT_RESET_TOKEN=your_reset_secret

# Email credentials (for reset/verification emails)
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_app_password

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Cloudinary
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_FOLDER=bug-tracker-uploads
```

```bash
# 4. Run the development server
npm run dev
```

> Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment (Vercel Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) → Import your repo
3. Add the same env variables from `.env.local` into **Project Settings → Environment Variables**
4. Adjust `next.config.js` if needed:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_CLOUDINARY_PRESET_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME,
  },
};

module.exports = nextConfig;
```

5. Set OAuth redirect URIs in:

- **Google Cloud Console** → `https://devorbit.vercel.app/api/auth/callback/google`
- **GitHub Developer Settings** → Same format

6. Click **Deploy** — Done!

---

## 🤖 AI & File Upload Integration

- **Cloudinary**: Handles image and PDF uploads with dynamic folder structure.
- **AI Embeddings**: Uses `@xenova/transformers` to store bug text as embeddings in MongoDB.
- **Search**: Semantic matching and duplicate bug detection powered by Sentence-BERT.

---

## 🤝 Contributing

```bash
# Fork the repo
# Create your feature branch
git checkout -b feature/your-feature

# Commit your changes
git commit -m "✨ Add: Your feature"

# Push to GitHub
git push origin feature/your-feature

# Open a Pull Request
```

---

## 📄 License

MIT License

---

## 📬 Contact

Have feedback or issues? [Open an issue](https://github.com/your-username/devOrbit/issues) on GitHub.

---

### ✅ Next Steps

- Replace `https://github.com/your-username/devOrbit.git` with your actual GitHub repo URL.
- Add GitHub/Vercel badges, stars, forks if needed.
- Upload screenshots or GIFs under the **📸 Preview** section.
