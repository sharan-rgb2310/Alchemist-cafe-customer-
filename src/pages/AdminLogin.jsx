import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import '../styles/admin-theme.css';
import logo from '../assets/logo.png';
import { signInAdmin } from '../services/adminAuth';

const schema = z.object({
	email: z.string().trim().email('Enter a valid email address'),
	password: z.string().min(1, 'Enter your password'),
});

export default function AdminLogin() {
	const navigate = useNavigate();
	const location = useLocation();
	const reduceMotion = useReducedMotion();
	const [showPassword, setShowPassword] = useState(false);
	const [loginError, setLoginError] = useState('');
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
		resolver: zodResolver(schema),
		defaultValues: { email: '', password: '' },
	});

	const submit = async ({ email, password }) => {
		setLoginError('');
		try {
			await signInAdmin(email.trim(), password);
			navigate(location.state?.from?.pathname || '/admin', { replace: true });
		} catch (error) {
			const message = error.message || '';
			setLoginError(/invalid login credentials/i.test(message)
				? 'Supabase could not verify this email and password. Confirm the administrator user exists in Supabase Authentication, its email is confirmed, and the password is correct.'
				: message || 'Unable to sign in. Please try again.');
		}
	};

	return <main className="ac-login-page">
		<motion.section className="ac-login-card" initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : .45, ease: 'easeOut' }}>
			<Link to="/register" className="ac-login-brand" aria-label="Alchemist Cafe home">
				<img src={logo} alt="Alchemist – The Lake View Café" />
			</Link>
			<p className="ac-login-eyebrow">ADMIN PORTAL</p>
			<h1>Welcome</h1>
			<p className="ac-login-subtitle">Sign in to manage your Alchemist Café community.</p>
			<form className="ac-login-form" autoComplete="off" noValidate onSubmit={handleSubmit(submit)}>
				<label className="ac-login-field">
					<span>Email address</span>
					<span className="ac-login-input-wrap"><Mail size={17} aria-hidden="true" /><input type="email" autoComplete="off" aria-invalid={!!errors.email} {...register('email')} /></span>
					{errors.email && <small role="alert">{errors.email.message}</small>}
				</label>
				<div className="ac-login-field">
					<label htmlFor="admin-password">Password</label>
					<span className="ac-login-input-wrap"><LockKeyhole size={17} aria-hidden="true" /><input id="admin-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" aria-invalid={!!errors.password} {...register('password')} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}</button></span>
					{errors.password && <small role="alert">{errors.password.message}</small>}
				</div>
				<AnimatePresence>{loginError && <motion.p className="ac-login-error" role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{loginError}</motion.p>}</AnimatePresence>
				<button className="ac-login-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle size={17} className="ac-login-spinner" /> : null}{isSubmitting ? 'Signing in…' : 'Sign In'}{!isSubmitting && <ArrowRight size={17} aria-hidden="true" />}</button>
			</form>
		</motion.section>
	</main>;
}
