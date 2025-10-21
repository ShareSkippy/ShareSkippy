# ShareSkippy 🐕

A community-based dog sharing platform that connects dog lovers with dog owners for free, collaborative dog care experiences.

## About

ShareSkippy makes it easy for dog owners to find trusted community members who can help with dog walking, sitting, and care. Whether you need help when you're busy, traveling, or just want your dog to have more social time, ShareSkippy connects you with caring neighbors in your area.

## Features

- 🐾 **Community Matching** - Find dog lovers in your neighborhood
- 📍 **Location-Based** - Connect with people nearby
- 🔒 **Trust & Safety** - Verified profiles and community ratings
- 💚 **Free & Community-Driven** - No fees, just neighbors helping neighbors
- 📱 **Easy to Use** - Simple interface for finding and offering help

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel
- **Styling**: DaisyUI, Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 20.11.1 or higher
- Git
- A code editor (we recommend VS Code)

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/ShareSkippy.git
   cd ShareSkippy
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your values in `.env.local`:
   - Get Supabase credentials from your team lead or create your own project
   - Get Resend API key from https://resend.com (optional for most features)

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Verify Setup

Run these commands to ensure everything is working:

```bash
npm run validate  # Runs all checks: formatting, linting, type checking, tests
```

## Development Environment

- Node: 20.x (see `.nvmrc`)
- Package manager: npm (see `packageManager` in `package.json`)

## Contributing

This is a community-driven project. We welcome contributions!

## License

MIT License
