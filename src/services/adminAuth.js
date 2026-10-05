import { requireSupabase } from '../lib/supabase';

const isAdmin = user => user?.app_metadata?.role === 'admin';

export async function getAdminUser() {
	const { data, error } = await requireSupabase().auth.getSession();
	if (error) throw error;

	const user = data.session?.user || null;
	if (user && !isAdmin(user)) {
		const { error: signOutError } = await requireSupabase().auth.signOut();
		if (signOutError) throw signOutError;
		return null;
	}
	return user;
}

export function subscribeToAuth(callback) {
	const { data: { subscription } } = requireSupabase().auth.onAuthStateChange((_event, session) => {
		callback(isAdmin(session?.user) ? session.user : null);
	});
	return () => subscription.unsubscribe();
}

export async function signInAdmin(email, password) {
	const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
	if (error) throw error;
	if (!isAdmin(data.user)) {
		const { error: signOutError } = await requireSupabase().auth.signOut();
		if (signOutError) throw signOutError;
		throw new Error('This account does not have administrator access.');
	}
	return data.user;
}

export async function signOutAdmin() {
	const { error } = await requireSupabase().auth.signOut();
	if (error) throw error;
}

export async function changeAdminPassword(currentPassword, newPassword) {
	const client = requireSupabase();
	const { data: { user }, error: userError } = await client.auth.getUser();
	if (userError) throw userError;
	if (!user?.email || !isAdmin(user)) {
		throw new Error('An authenticated administrator account is required.');
	}

	const { error: verificationError } = await client.auth.signInWithPassword({
		email: user.email,
		password: currentPassword,
	});
	if (verificationError) {
		throw new Error('The current password is incorrect.');
	}

	const { error: updateError } = await client.auth.updateUser({ password: newPassword });
	if (updateError) throw updateError;
}
