# Real-Time Chat Application

A modern, full-stack real-time chat application built with Next.js, Socket.IO, Prisma, and PostgreSQL. Features Google authentication, group management, and real-time messaging.

## Features

- **Google Authentication**: Secure login with Google OAuth
- **Real-time Messaging**: Instant messaging using Socket.IO
- **Group Management**: Create and manage chat groups
- **Room System**: Multiple chat rooms within groups
- **Responsive Design**: Works on desktop and mobile devices
- **Typing Indicators**: See when others are typing
- **Message History**: Persistent chat history
- **Clean UI**: Modern interface built with shadcn/ui

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Socket.IO
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google Provider
- **UI Components**: shadcn/ui
- **Real-time**: Socket.IO

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials

## Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/chatapp"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Site URL (for Socket.IO)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
\`\`\`

## Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd realtime-chat-app
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up the database**
   \`\`\`bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # (Optional) Seed the database
   npx prisma db seed
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to \`http://localhost:3000\`

## Usage

1. **Sign In**: Click "Continue with Google" to authenticate
2. **Create Groups**: Use the "+" button next to "Chat Groups" to create a new group
3. **Create Rooms**: Click the "+" button next to a group name to create rooms within that group
4. **Start Chatting**: Select a room from the sidebar and start messaging
5. **Real-time Features**: Messages appear instantly, and you can see typing indicators

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── chat/              # Chat application pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── chat/              # Chat-related components
│   ├── providers/         # Context providers
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility libraries
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   └── socket.ts          # Socket.IO configuration
├── prisma/                # Database schema and migrations
└── scripts/               # Database setup scripts
\`\`\`

## API Endpoints

- \`GET /api/groups\` - Fetch user's groups
- \`POST /api/groups\` - Create a new group
- \`POST /api/groups/[groupId]/rooms\` - Create a room in a group
- \`GET /api/messages\` - Fetch messages for a room
- \`POST /api/messages\` - Send a new message
- \`GET /api/socket\` - Initialize Socket.IO connection

## Socket.IO Events

- \`join-room\` - Join a chat room
- \`leave-room\` - Leave a chat room
- \`send-message\` - Send a message
- \`receive-message\` - Receive a message
- \`typing\` - User is typing
- \`stop-typing\` - User stopped typing

## Database Schema

The application uses the following main entities:

- **User**: User accounts with Google OAuth
- **Group**: Chat groups that contain multiple rooms
- **Room**: Individual chat rooms within groups
- **Message**: Chat messages with timestamps
- **GroupMember**: Many-to-many relationship between users and groups

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact the development team.
