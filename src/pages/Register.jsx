import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Coffee, Loader2, Mail, Phone, User } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import logo from '../assets/logo.png';
import coffeeCupArt from '../assets/coffee-cup-festival-svgrepo-com.svg';
import coffeeArt from '../assets/coffee-svgrepo-com.svg';
import { useApp } from '../context/AppContext';

const today = () => {
	const date = new Date();
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const validPastDate = value => {
	if (!value) return true;
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const [year, month, day] = value.split('-').map(Number);
	const parsed = new Date(year, month - 1, day);
	return parsed.getFullYear() === year
		&& parsed.getMonth() === month - 1
		&& parsed.getDate() === day
		&& value <= today();
};
const schema = z.object({
	name: z.string().trim().min(2, 'Please enter your full name').max(120, 'Name must be 120 characters or fewer'),
	phone: z.string().trim().min(1, 'Please enter your mobile number').max(32, 'Phone number must be 32 characters or fewer').refine(value => /^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/.test(value), 'Please enter a valid Indian mobile number'),
	email: z.string().trim().min(1, 'Please enter your email address').max(254, 'Email must be 254 characters or fewer').email('Please enter a valid email address'),
	birthday: z.string().min(1, 'Please enter your date of birth').refine(validPastDate, 'Date of birth must be a valid date and cannot be in the future'),
	anniversary: z.string().refine(validPastDate, 'Anniversary must be a valid date and cannot be in the future'),
});

function Field({ icon: Icon, label, error, children }) {
	return <label className="register-field"><span className="register-label">{label}</span><span className="register-input-wrap"><Icon aria-hidden="true" size={17} className="register-field-icon" />{children}</span>{error && <span role="alert" className="register-error">{error}</span>}</label>;
}

export default function Register() {
	const { addCustomer } = useApp();
	const navigate = useNavigate();
	const shouldReduceMotion = useReducedMotion();
	const [submitError, setSubmitError] = useState('');
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
		resolver: zodResolver(schema),
		defaultValues: { name: '', phone: '', email: '', birthday: '', anniversary: '' },
	});

	const onSubmit = async values => {
		setSubmitError('');
		try {
			await addCustomer({ ...values, notes: '', status: 'New' });
			navigate('/registration-success');
		} catch (error) {
			setSubmitError(`We couldn't save your registration. ${error.message}`);
		}
	};

	return <main className="registration-page">
		<img src={coffeeCupArt} className="registration-bg-svg registration-bg-top-left" alt="" aria-hidden="true" />
		<img src={coffeeArt} className="registration-bg-svg registration-bg-top-right" alt="" aria-hidden="true" />
		<img src={coffeeArt} className="registration-bg-svg registration-bg-bottom-left" alt="" aria-hidden="true" />
		<img src={coffeeCupArt} className="registration-bg-svg registration-bg-bottom-right" alt="" aria-hidden="true" />
		<motion.form initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: shouldReduceMotion ? 0 : 0.45 }} onSubmit={handleSubmit(onSubmit)} noValidate aria-labelledby="register-title" className="registration-card">
			<header className="registration-header">
				<img src={logo} alt="Alchemist Cafe" className="registration-logo" />
				<p className="registration-eyebrow">Welcome</p>
				<h1 id="register-title">Join our community</h1>
			</header>
			<div className="registration-fields">
				<Field icon={User} label="Full name" error={errors.name?.message}><input className="registration-input" autoComplete="name" placeholder="Your full name" aria-invalid={!!errors.name} {...register('name')} /></Field>
				<Field icon={Phone} label="Mobile number" error={errors.phone?.message}><input className="registration-input" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 XXXXX XXXXX" aria-invalid={!!errors.phone} {...register('phone')} /></Field>
				<div className="registration-date-grid">
					<Field icon={CalendarDays} label="Date of birth" error={errors.birthday?.message}><input className="registration-input" type="date" aria-invalid={!!errors.birthday} {...register('birthday')} /></Field>
					<Field icon={CalendarDays} label="Anniversary"><input className="registration-input" type="date" {...register('anniversary')} /></Field>
				</div>
				<Field icon={Mail} label="Email address" error={errors.email?.message}><input className="registration-input" type="email" autoComplete="email" placeholder="name@example.com" aria-invalid={!!errors.email} {...register('email')} /></Field>
			</div>
			{submitError && <p role="alert" className="register-error">{submitError}</p>}
			<div className="registration-actions">
				<button type="submit" disabled={isSubmitting} className="registration-submit">{isSubmitting ? <Loader2 className="animate-spin" size={17} aria-hidden="true" /> : <Coffee size={16} aria-hidden="true" />}{isSubmitting ? 'Joining...' : 'Join Alchemist'}</button>
			</div>
		</motion.form>
	</main>;
}