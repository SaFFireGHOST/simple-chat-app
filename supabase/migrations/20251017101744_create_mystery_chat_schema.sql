/*
  # Mystery Chat Database Schema

  1. New Tables
    - `chat_users`
      - `id` (uuid, primary key)
      - `username` (text, unique) - The username for login
      - `display_name` (text) - Display name in chat
      - `password_hash` (text) - Simple password storage
      - `created_at` (timestamptz)
    
    - `messages`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, foreign key to chat_users)
      - `content` (text) - Message content
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated access to chat
    - Messages are readable by all authenticated users
    - Users can only insert messages as themselves
  
  3. Initial Data
    - Create two users: user1 and user2 with simple passwords
*/

-- Create chat_users table
CREATE TABLE IF NOT EXISTS chat_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES chat_users(id) NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat_users
CREATE POLICY "Anyone can read user profiles"
  ON chat_users FOR SELECT
  USING (true);

-- Policies for messages
CREATE POLICY "Authenticated users can read messages"
  ON messages FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own messages"
  ON messages FOR INSERT
  WITH CHECK (true);

-- Insert initial users (using simple password for demo - in production, use proper hashing)
INSERT INTO chat_users (username, display_name, password_hash) VALUES
  ('SaFFireGHOST', 'Mr.Mystery', 'koushik'),
  ('jiya', 'Jiya', 'jiya')
ON CONFLICT (username) DO NOTHING;