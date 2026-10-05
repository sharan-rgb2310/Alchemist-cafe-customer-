import { requireSupabase } from '../lib/supabase';
import { iso } from '../utils/dates';

const CACHE_KEY = 'alchemist.customers.v1';

const readCache = () => {
	try {
		const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
		if (!Array.isArray(cached)) return [];

		const current = cached.filter(customer =>
			customer
			&& !/^c(?:[1-9]|1[0-4])$/.test(customer.id)
			&& !/@example\.com$/i.test(customer.email || '')
		);
		if (current.length !== cached.length) {
			localStorage.setItem(CACHE_KEY, JSON.stringify(current));
		}
		return current;
	} catch {
		return [];
	}
};

const writeCache = customers => {
	try {
		localStorage.setItem(CACHE_KEY, JSON.stringify(customers));
	} catch (error) {
		console.warn('Customer data was saved to Supabase, but the local cache could not be updated.', error);
	}
};

const fromRow = row => ({
	id: row.id,
	name: row.name,
	phone: row.phone,
	email: row.email,
	birthday: row.birthday || '',
	anniversary: row.anniversary || '',
	status: row.status,
	notes: row.notes || '',
	photo: row.photo || '',
	joinedAt: row.joined_at,
	activity: Array.isArray(row.activity) ? row.activity : [],
});

const toRow = customer => ({
	name: customer.name,
	phone: customer.phone,
	email: customer.email || '',
	birthday: customer.birthday || null,
	anniversary: customer.anniversary || null,
	status: customer.status || 'New',
	notes: customer.notes || '',
	photo: customer.photo || null,
	activity: Array.isArray(customer.activity) ? customer.activity : [],
});

export const getCachedCustomers = () => readCache();

export const getCustomers = async () => {
	const { data, error } = await requireSupabase()
		.from('customers')
		.select('*')
		.order('name');
	if (error) throw error;

	const customers = data.map(fromRow);
	writeCache(customers);
	return customers;
};

export const createCustomer = async details => {
	const today = iso(new Date());
	const customer = {
		...details,
		joinedAt: today,
		activity: [{ id: Date.now(), text: 'Added to the Alchemist community', date: today }],
	};
	const client = requireSupabase();
	const { data: { session }, error: sessionError } = await client.auth.getSession();
	if (sessionError) throw sessionError;

	if (session?.user?.app_metadata?.role !== 'admin') {
		const row = toRow(customer);
		const { error } = await client.from('customers').insert({
			name: row.name,
			phone: row.phone,
			email: row.email,
			birthday: row.birthday,
			anniversary: row.anniversary,
			status: row.status,
			notes: row.notes,
		});
		if (error) throw error;

		return { ...customer, id: null };
	}

	const { data, error } = await client
		.from('customers')
		.insert(toRow(customer))
		.select('*')
		.single();
	if (error) throw error;

	const saved = fromRow(data);
	writeCache([saved, ...readCache().filter(item => item.id !== saved.id)]);
	return saved;
};

export const updateCustomer = async (id, details) => {
	const current = readCache().find(customer => customer.id === id);
	const today = iso(new Date());
	const customer = {
		...details,
		activity: [
			{ id: Date.now(), text: 'Profile updated', date: today },
			...(current?.activity || []),
		],
	};
	const { data, error } = await requireSupabase()
		.from('customers')
		.update(toRow(customer))
		.eq('id', id)
		.select('*')
		.single();
	if (error) throw error;

	const saved = fromRow(data);
	writeCache(readCache().map(item => item.id === id ? saved : item));
	return saved;
};

export const deleteCustomer = async id => {
	const { error } = await requireSupabase()
		.from('customers')
		.delete()
		.eq('id', id);
	if (error) throw error;

	writeCache(readCache().filter(customer => customer.id !== id));
};
