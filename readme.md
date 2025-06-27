# Qwisky - Real-time Chat Application

![Qwisky Features](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mj6xlUpwa6xxRYBqulgTV9i4eoXwrl.png)

A modern, full-stack real-time chat application built with Next.js 14, Socket.IO, and PostgreSQL. Qwisky provides instant messaging, group chats, friend systems, and voice messaging with a professional, responsive interface.

![Chat Interface](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-LlZgqteIcZTWyQq9gsZs0b8QPAJ8wp.png)

## Key Features

- **Real-time messaging** with [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) connections via Socket.IO
- **Google OAuth authentication** using NextAuth.js
- **Group chat management** with admin controls and member invitations
- **Direct messaging** with friend request system
- **Voice message recording** using [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- **Emoji picker** with categorized selection
- **Dark/light theme** switching with system preference detection
- **Typing indicators** and online status tracking
- **Professional chat bubbles** with read receipts
- **Responsive design** optimized for mobile and desktop

![Friend Requests](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jguYRMctwr53gp4my7OmFTJXRWtZSr.png)

![Active Chat](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-H1AJAqDNtzXNxG1f81mVPB2HmhSUGj.png)

## Interesting Technical Implementations

### Frontend Techniques

- **[CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)** for dynamic theming with Tailwind CSS v4
- **[Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)** for message visibility tracking
- **[MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)** for voice message recording with real-time audio processing
- **[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)** integration for audio playback controls
- **[CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)** and **[Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)** for responsive layouts
- **[CSS Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)** for chat bubble tails and hover animations
- **[CSS Gradients](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient)** for modern UI aesthetics

### Backend Architecture

- **[WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)** real-time communication with room-based message broadcasting
- **[Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)** fallback for typing indicators
- **[Prisma ORM](https://www.prisma.io/)** with PostgreSQL for type-safe database operations
- **[NextAuth.js](https://next-auth.js.org/)** session management with database adapters
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** for RESTful endpoints

### State Management

- **React Context API** for Socket.IO connection management
- **[useReducer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)** pattern for complex state updates
- **Optimistic UI updates** for instant message rendering

## Notable Technologies & Libraries

### Core Framework
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://react.dev/)** - UI library with concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety and developer experience

### Real-time Communication
- **[Socket.IO](https://socket.io/)** - WebSocket library with fallbacks
- **[Socket.IO Client](https://socket.io/docs/v4/client-api/)** - Browser WebSocket client

### Database & ORM
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM with type safety
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[@prisma/client](https://www.prisma.io/docs/concepts/components/prisma-client)** - Auto-generated database client

### Authentication
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication library for Next.js
- **[@next-auth/prisma-adapter](https://next-auth.js.org/adapters/prisma)** - Database adapter for sessions

### UI Components & Styling
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI components
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme switching
- **[class-variance-authority](https://cva.style/docs)** - Component variant management
- **[clsx](https://github.com/lukeed/clsx)** - Conditional className utility

### Typography
- **[Inter](https://fonts.google.com/specimen/Inter)** - Primary font from Google Fonts

### Development Tools
- **[date-fns](https://date-fns.org/)** - Date utility library
- **[concurrently](https://github.com/open-cli-tools/concurrently)** - Run multiple commands

## Project Structure

\`\`\`
qwisky/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes and endpoints
│   ├── auth/                     # Authentication pages
│   ├── chat/                     # Main chat application
│   └── globals.css               # Global styles and theme variables
├── components/                   # React components
│   ├── chat/                     # Chat-specific components
│   ├── landing/                  # Landing page components
│   ├── providers/                # Context providers
│   ├── ui/                       # Reusable UI components
│   └── debug/                    # Development debugging tools
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries and configurations
├── prisma/                       # Database schema and migrations
├── scripts/                      # Database setup and Socket.IO server
├── package.json                  # Dependencies and scripts
├── tailwind.config.ts           # Tailwind CSS configuration
└── tsconfig.json                # TypeScript configuration
\`\`\`

### Key Directories

- **[`app/api/`](./app/api/)** - Contains RESTful API endpoints for messages, groups, friends, and user management
- **[`components/chat/`](./components/chat/)** - Core chat functionality including message bubbles, voice recording, and emoji picker
- **[`components/ui/`](./components/ui/)** - Reusable UI components built with Radix UI primitives
- **[`components/providers/`](./components/providers/)** - React Context providers for Socket.IO, authentication, and theming
- **[`lib/`](./lib/)** - Configuration files for Prisma, NextAuth.js, and utility functions
- **[`scripts/`](./scripts/)** - Database setup SQL files and standalone Socket.IO server
- **[`prisma/`](./prisma/)** - Database schema definition and migration files

The application uses a clean separation of concerns with dedicated directories for different aspects of the system. The [`components/chat/`](./components/chat/) directory contains the core messaging functionality, while [`components/ui/`](./components/ui/) houses reusable interface elements. The [`app/api/`](./app/api/) directory follows RESTful conventions for data operations, and the [`scripts/`](./scripts/) directory contains the separate Socket.IO server for real-time communication.

## Environment Setup

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/qwisky"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Socket.IO Port
SOCKET_PORT=3001
\`\`\`

## Installation & Development

1. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up the database**
   \`\`\`bash
   npx prisma generate
   npx prisma db push
   \`\`\`

3. **Run database setup scripts**
   Execute the SQL files in the [`scripts/`](./scripts/) directory in your PostgreSQL database.

4. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

This will start both the Next.js application and the Socket.IO server concurrently.

## Architecture Highlights

### Real-time Communication
The application uses a separate Socket.IO server ([`scripts/start-socket-server.js`](./scripts/start-socket-server.js)) that handles WebSocket connections independently from the Next.js application. This architecture provides better scalability and separation of concerns.

### Database Design
The Prisma schema ([`prisma/schema.prisma`](./prisma/schema.prisma)) implements a comprehensive chat system with:
- User authentication and profiles
- Group management with role-based permissions
- Direct messaging with friendship systems
- Message history and read receipts
- Invitation and notification systems

### Component Architecture
The UI follows a modular design pattern with:
- Reusable components in [`components/ui/`](./components/ui/)
- Feature-specific components in [`components/chat/`](./components/chat/)
- Context providers for global state management
- Custom hooks for complex logic abstraction

## License

MIT License - see the [LICENSE](./LICENSE) file for details.
