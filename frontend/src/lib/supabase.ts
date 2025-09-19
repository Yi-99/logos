import { createClient, SupabaseClient } from '@supabase/supabase-js';

class SupabaseService {
  private static instance: SupabaseService;
  private client: SupabaseClient;

  private constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables. Please check your .env file.');
    }

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public getClient(): SupabaseClient {
    return this.client;
  }

  // Auth methods
  public get auth() {
    return this.client.auth;
  }

  // Database methods
  public get from() {
    return this.client.from.bind(this.client);
  }

  // Storage methods
  public get storage() {
    return this.client.storage;
  }

  // Real-time methods
  public get channel() {
    return this.client.channel.bind(this.client);
  }

  // Functions methods
  public get functions() {
    return this.client.functions;
  }

  // Helper method to get current user
  public async getCurrentUser() {
    const { data: { user } } = await this.client.auth.getUser();
    return user;
  }

  // Helper method to get current session
  public async getCurrentSession() {
    const { data: { session } } = await this.client.auth.getSession();
    return session;
  }
}

// Export the singleton instance
const supabase = SupabaseService.getInstance();
export default supabase;

// Also export the client directly for convenience
export const supabaseClient = supabase.getClient();
