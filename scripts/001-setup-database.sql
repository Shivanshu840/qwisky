-- Create database tables based on Prisma schema
-- This script will be executed to set up the initial database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The tables will be created by Prisma migrate
-- This script is for any additional setup if needed

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON "Message"("roomId");
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON "Message"("createdAt");
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON "GroupMember"("userId");
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON "GroupMember"("groupId");
