# Inflamm AI Landing Page

A clean, minimalist landing page for Inflamm AI built with Next.js, React, and TailwindCSS.

## 🎨 Design Features

- **Clean Minimalist Design**: Light beige background with bold dark gray typography
- **Responsive Layout**: Fully responsive across desktop, tablet, and mobile devices
- **Modern Animations**: Smooth Framer Motion animations with fade-in and slide-up effects
- **Interactive Elements**: Hover effects, button animations, and scroll-based navbar changes
- **Accessibility**: Semantic HTML structure with proper contrast ratios

## 🚀 Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS with custom color palette
- **Animations**: Framer Motion for smooth transitions
- **Typography**: Inter font family for modern, clean text
- **TypeScript**: Full type safety throughout the codebase

## 🎯 Key Components

### Navbar (`components/Navbar.tsx`)
- Fixed position with scroll-based transparency
- Infinity symbol logo with orange-to-yellow gradient
- Responsive navigation with mobile menu button
- Smooth hover animations on all interactive elements

### Hero Section (`components/HeroSection.tsx`)
- Large, bold headline: "Trustless Health, Boundless Memory"
- Compelling description about encrypted health and infinite recall
- Two call-to-action buttons with pill-shaped design
- Subtle green circle accent with delayed animation
- Fully responsive typography scaling

### Footer (`components/Footer.tsx`)
- Simple, clean footer design
- Consistent with overall minimalist aesthetic

## 🎨 Color Palette

- **Background**: `#FFF9F3` (Light beige)
- **Primary Text**: `#2B2B2B` (Dark gray)
- **Secondary Text**: `#6B7280` (Muted gray)
- **Logo Gradient**: Orange (`#FF6B35`) to Yellow (`#FFD700`)
- **Accent**: Green (`#4ADE80`) for subtle circle element

## 📱 Responsive Breakpoints

- **Mobile**: `< 640px` - Stacked layout, smaller text, full-width buttons
- **Tablet**: `640px - 768px` - Medium text sizes, horizontal button layout
- **Desktop**: `> 768px` - Large text, full navigation, optimized spacing
- **Large Desktop**: `> 1024px` - Maximum text sizes, generous spacing

## 🎬 Animation Features

- **Page Load**: Staggered fade-in animations for all elements
- **Navbar**: Slides down from top on page load
- **Scroll Effects**: Navbar becomes semi-transparent with backdrop blur
- **Button Interactions**: Scale and color transitions on hover/tap
- **Accent Element**: Delayed green circle animation for visual interest

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
├── app/
│   ├── globals.css          # Global styles and CSS variables
│   ├── layout.tsx           # Root layout with Inter font
│   └── page.tsx             # Main landing page
├── components/
│   ├── Navbar.tsx           # Navigation component
│   ├── HeroSection.tsx      # Hero section with CTA buttons
│   └── Footer.tsx           # Footer component
├── tailwind.config.ts       # TailwindCSS configuration
└── package.json             # Dependencies and scripts
```

## 🎯 Performance

- **Lighthouse Score**: Optimized for performance, accessibility, and SEO
- **Bundle Size**: Minimal JavaScript footprint with tree-shaking
- **Images**: Optimized SVG logos for crisp display at any size
- **Fonts**: Inter font loaded efficiently via Next.js Google Fonts

## 🚀 Deployment

The project is ready for deployment on:
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Any static hosting service

## 📝 Customization

### Colors
Update the color palette in `tailwind.config.ts`:
```typescript
colors: {
  beige: '#FFF9F3',
  'dark-gray': '#2B2B2B',
  'muted-gray': '#6B7280',
}
```

### Content
- Update text content in component files
- Modify the infinity logo SVG in `Navbar.tsx`
- Adjust animation timing in Framer Motion components

### Styling
- Add new Tailwind classes for custom styling
- Extend the design system in `globals.css`
- Modify responsive breakpoints as needed

## 📄 License

This project is built for Inflamm AI. All rights reserved.

---

Built with ❤️ using Next.js, React, and TailwindCSS