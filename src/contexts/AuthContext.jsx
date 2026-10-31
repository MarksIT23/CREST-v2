import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync Supabase Auth User with public.profiles
  const fetchProfile = async (authUser) => {
    if (!authUser) return null;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          program: profile.program,
          studentId: profile.student_id,
          accountStatus: profile.account_status,
          bio: profile.bio,
          avatarUrl: profile.avatar_url,
        };
      }
    } catch {
      // ignore
    }

    // Fallback to auth metadata
    return {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      role: authUser.user_metadata?.role || 'student',
      program: authUser.user_metadata?.program,
      studentId: authUser.user_metadata?.studentId,
      accountStatus: authUser.user_metadata?.accountStatus || 'active',
      bio: authUser.user_metadata?.bio,
    };
  };

  useEffect(() => {
    // 1. Initial session load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const fullUser = await fetchProfile(session.user);
        setUser(fullUser);
        localStorage.setItem('crest_user', JSON.stringify(fullUser));
      } else {
        // Fallback to cached user if offline
        try {
          const stored = localStorage.getItem('crest_user');
          if (stored) setUser(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
      setLoading(false);
    });

    // 2. Auth state subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const fullUser = await fetchProfile(session.user);
        setUser(fullUser);
        localStorage.setItem('crest_user', JSON.stringify(fullUser));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('crest_user');
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    if (!email || !password) return { ok: false, error: 'Email and password are required.' };

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      const fullUser = await fetchProfile(data.user);
      if (fullUser.accountStatus === 'pending') {
        await supabase.auth.signOut();
        return {
          ok: false,
          error: fullUser.role === 'faculty'
            ? 'Your faculty account is awaiting approval from an administrator.'
            : 'Your account is awaiting approval from a faculty member or administrator.',
        };
      }

      if (fullUser.accountStatus === 'rejected') {
        await supabase.auth.signOut();
        return { ok: false, error: 'Your account registration was declined. Please contact the CECT department.' };
      }

      setUser(fullUser);
      localStorage.setItem('crest_user', JSON.stringify(fullUser));
      return { ok: true, user: fullUser };
    } catch (err) {
      return { ok: false, error: err.message || 'Login failed.' };
    }
  };

  const register = async ({ name, email, password, role, program, studentId }) => {
    if (!name || !email || !password) return { ok: false, error: 'All fields are required.' };

    try {
      const isAutoActive = role === 'admin';
      const accountStatus = isAutoActive ? 'active' : 'pending';

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name,
            role: role || 'student',
            program,
            studentId,
            accountStatus,
          },
        },
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      // Record registration activity in audit trail
      try {
        await supabase.from('activities').insert({
          type: 'registration',
          detail: `New ${role || 'student'} account registered (${email})`,
          user_name: name,
        });
      } catch {
        // non-fatal
      }

      if (accountStatus === 'pending') {
        return {
          ok: true,
          pending: true,
          message: role === 'faculty'
            ? 'Registration submitted! Your faculty account requires administrator approval before you can sign in.'
            : 'Registration submitted! Your student account requires approval before you can sign in.',
        };
      }

      const fullUser = await fetchProfile(data.user);
      setUser(fullUser);
      localStorage.setItem('crest_user', JSON.stringify(fullUser));
      return { ok: true, user: fullUser };
    } catch (err) {
      return { ok: false, error: err.message || 'Registration failed.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('crest_user');
  };

  const updateProfile = async (patch) => {
    if (!user) return;
    try {
      const updates = {};
      if (patch.name) updates.name = patch.name;
      if (patch.bio !== undefined) updates.bio = patch.bio;
      if (patch.program) updates.program = patch.program;

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (!error && data) {
        const nextUser = {
          ...user,
          name: data.name,
          bio: data.bio,
          program: data.program,
        };
        setUser(nextUser);
        localStorage.setItem('crest_user', JSON.stringify(nextUser));
        return { ok: true, user: nextUser };
      }
    } catch {
      // fallback
    }
    const nextUser = { ...user, ...patch };
    setUser(nextUser);
    localStorage.setItem('crest_user', JSON.stringify(nextUser));
    return { ok: true, user: nextUser };
  };

  const can = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) return roles.includes(user.role);
    return user.role === roles;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, can, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react/only-export-components
export const useAuth = () => useContext(AuthContext);
