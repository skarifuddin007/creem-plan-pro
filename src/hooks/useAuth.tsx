import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      console.log('Profile data fetched:', data);
      setProfile(data);
    } catch (error) {
      console.error('Profile fetch failed:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      console.log('Refreshing profile for user:', user.id);
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // First, try to get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // If there's an error, try to refresh the session
          try {
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (!refreshError && refreshData.session && mounted) {
              setSession(refreshData.session);
              setUser(refreshData.session.user);
              
              if (refreshData.session.user) {
                setTimeout(() => {
                  fetchProfile(refreshData.session.user.id);
                }, 0);
              }
            }
          } catch (refreshErr) {
            console.error('Session refresh failed:', refreshErr);
          }
        } else if (session && mounted) {
          setSession(session);
          setUser(session.user);
          
          if (session.user) {
            setTimeout(() => {
              fetchProfile(session.user.id);
            }, 0);
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile with setTimeout to prevent deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Set up Realtime subscription for profile changes
  useEffect(() => {
    if (!user) return;

    console.log('Setting up Realtime listener for user:', user.id);
    
    const channel = supabase
      .channel(`profile-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Profile Realtime update received:', payload);
          if (payload.eventType === 'UPDATE' && payload.new) {
            console.log('Updating profile with new data:', payload.new);
            setProfile(payload.new);
          } else if (payload.eventType === 'INSERT' && payload.new) {
            console.log('New profile created:', payload.new);
            setProfile(payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up Realtime listener');
      supabase.removeChannel(channel);
    };
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};