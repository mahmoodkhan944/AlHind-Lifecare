import { supabase } from '@/lib/supabaseClient';

async function getProfile(userId) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  return data;
}

export const auth = {
  /** Returns the current user (with role merged in), or throws if not logged in. */
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      const e = new Error('Not authenticated');
      e.status = 401;
      throw e;
    }
    const profile = await getProfile(user.id);
    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name || '',
      role: profile?.role || 'user',
      ...profile,
    };
  },

  async loginViaEmailPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  },

  async loginWithProvider(provider, redirectPath = '') {
    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}${redirectPath}`;
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (error) throw new Error(error.message);
  },

  /** Sign up with email/password. Supabase sends a 6-digit OTP code by email
   *  (configure the "Confirm signup" template in Supabase to use {{ .Token }}). */
  async register({ email, password, full_name }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  /** Verifies the 6-digit signup code and completes login. */
  async verifyOtp({ email, otpCode }) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'signup',
    });
    if (error) throw new Error(error.message);
    return { access_token: data?.session?.access_token };
  },

  /** Resends the signup confirmation OTP code. */
  async resendOtp(email) {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw new Error(error.message);
  },

  /** Not needed with Supabase — verifyOtp() already establishes the session. Kept as a no-op for API compatibility. */
  setToken() {},

  /** Sends a password-reset email containing a link back to /reset-password. */
  async resetPasswordRequest(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  },

  /** Called on the /reset-password page, after Supabase has already established
   *  a recovery session from the email link (handled automatically by the SDK). */
  async resetPassword({ newPassword }) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  },

  async updateMe(updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { email, password, full_name, ...profileFields } = updates;
    if (email || password) {
      const { error } = await supabase.auth.updateUser({ ...(email && { email }), ...(password && { password }) });
      if (error) throw new Error(error.message);
    }
    const patch = { ...profileFields, ...(full_name && { full_name }) };
    if (Object.keys(patch).length > 0) {
      const { error } = await supabase.from('profiles').update(patch).eq('id', user.id);
      if (error) throw new Error(error.message);
    }
    return this.me();
  },

  async logout() {
    await supabase.auth.signOut();
  },
};