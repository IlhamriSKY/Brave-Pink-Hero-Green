# 🎨 Brave Pink Hero Green

![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat&logo=laravel&logoColor=FF2D20)
![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-06B6D4?style=flat&logo=tailwind-css&logoColor=06B6D4)
![Shadcn/UI](https://img.shields.io/badge/Shadcn/UI-Latest-000000?style=flat&logo=shadcnui&logoColor=000000)
![Inertia.js](https://img.shields.io/badge/Inertia.js-2.x-9553E9?style=flat&logo=inertia&logoColor=9553E9)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat)

**Image Processing with Pink-Green Duotone Effects**

A modern web application for image conversion with Pink-Green duotone effects built using Laravel 12, React 19, Tailwind CSS 4, and Shadcn/UI.

🌐 **Demo**: [https://brave-pink-hero-green.ilhamriski.com](https://brave-pink-hero-green.ilhamriski.com)

💡 **Inspired by**: [brave-pink-hero-green.lovable.app](https://brave-pink-hero-green.lovable.app)

## ✨ Key Features

- 🎨 **Duotone Conversion**: Professional Pink-Green effects
- 🌍 **Multi-language**: Indonesian, Malaysian, English, Japanese, Chinese  
- 💻 **Client-side Processing**: All image processing is done in your browser


## 🛠️ Tech Stack

- **Backend**: Laravel 12 + Inertia.js
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Components**: Shadcn/UI
- **WebSocket**: Laravel Reverb
- **Build Tool**: Vite 7
- **Database**: SQLite (default)

## 🚀 Installation

### Prerequisites
- PHP 8.2+
- Node.js 18+
- Composer
- Git

### 1. Clone Repository
```bash
git clone https://github.com/IlhamriSKY/Brave-Pink-Hero-Green.git
cd Brave-Pink-Hero-Green
```

### 2. Install Dependencies
```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

### 3. Setup Environment
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Create database and run migrations
php artisan migrate
```

### 4. Build Assets
```bash
# For development
npm run dev

# For production
npm run build
```

### 5. Run Application

#### Development Mode (2 terminals)
```bash
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Vite dev server
npm run dev
```

#### Production Mode
```bash
# Build assets
npm run build

# Start Laravel server
php artisan serve
```

#### Using Laravel Reverb (WebSocket)
```bash
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Build assets
npm run dev

# Terminal 3: Laravel Reverb WebSocket server
php artisan reverb:start
```

## 📖 How to Use

1. **Upload Image**: Drag & drop or click upload button
2. **Select Mode**: Choose desired duotone effect
3. **Preview**: View result with before/after slider
4. **Download**: Download the processed image

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Create a Pull Request
