# Supabase Singleton Client

This directory contains the Supabase client implementation using the singleton pattern, ensuring a single instance is used throughout the application.

## Usage

### Basic Import and Usage

```typescript
import supabase from '../lib/supabase';

// Use anywhere in your application
const { data, error } = await supabase.from('table_name').select('*');
```

### Authentication

```typescript
import supabase from '../lib/supabase';

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// Sign out
await supabase.auth.signOut();

// Get current user
const user = await supabase.getCurrentUser();

// Get current session
const session = await supabase.getCurrentSession();
```

### Database Operations

```typescript
import supabase from '../lib/supabase';

// Select data
const { data, error } = await supabase.from('philosophers').select('*');

// Insert data
const { data, error } = await supabase.from('chats').insert({
  user_id: userId,
  philosopher_id: philosopherId
});

// Update data
const { data, error } = await supabase.from('chats')
  .update({ updated_at: new Date() })
  .eq('id', chatId);

// Delete data
const { data, error } = await supabase.from('chats')
  .delete()
  .eq('id', chatId);
```

### Real-time Subscriptions

```typescript
import supabase from '../lib/supabase';

// Subscribe to changes
const subscription = supabase
  .channel('chat-messages')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'chat_messages' }, 
    (payload) => {
      console.log('New message:', payload.new);
    }
  )
  .subscribe();

// Unsubscribe
subscription.unsubscribe();
```

### Storage Operations

```typescript
import supabase from '../lib/supabase';

// Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('user-avatar.jpg', file);

// Download file
const { data, error } = await supabase.storage
  .from('avatars')
  .download('user-avatar.jpg');

// Get public URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-avatar.jpg');
```

## Service Examples

### In React Components

```typescript
import React, { useEffect, useState } from 'react';
import supabase from '../lib/supabase';

const MyComponent: React.FC = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('philosophers').select('*');
      if (data) setData(data);
    };
    fetchData();
  }, []);

  return <div>{/* Your component */}</div>;
};
```

### In Service Classes

```typescript
import supabase from '../lib/supabase';

class PhilosopherService {
  async getAll() {
    const { data, error } = await supabase.from('philosophers').select('*');
    if (error) throw error;
    return data;
  }

  async getById(id: string) {
    const { data, error } = await supabase.from('philosophers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }
}
```

### In Utility Functions

```typescript
import supabase from '../lib/supabase';

export const getCurrentUserId = async (): Promise<string | null> => {
  const user = await supabase.getCurrentUser();
  return user?.id || null;
};

export const isUserAuthenticated = async (): Promise<boolean> => {
  const session = await supabase.getCurrentSession();
  return !!session;
};
```

## Benefits of Singleton Pattern

1. **Single Instance**: Only one Supabase client instance is created and reused
2. **Memory Efficient**: Reduces memory usage by avoiding multiple instances
3. **Consistent Configuration**: Same configuration used throughout the app
4. **Easy to Mock**: Single point to mock for testing
5. **Type Safety**: Full TypeScript support

## Environment Variables Required

Make sure your `.env` file contains:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Error Handling

The singleton includes built-in error checking for missing environment variables and will throw an error if they're not found.

```typescript
// This will throw an error if env vars are missing
import supabase from '../lib/supabase'; // Error thrown here if env vars missing
```
