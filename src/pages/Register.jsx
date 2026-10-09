import { useRef, useState } from 'react';
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

const toIsoDate = value => {
	if (!value) return null;
	const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
	if (!match) return null;
	const [, dayValue, monthValue, yearValue] = match;
	const day = Number(dayValue);
	const month = Number(monthValue);
	const year = Number(yearValue);
	if (year < 1 || month < 1 || month > 12) return null;
	const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
	const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	if (day < 1 || day > daysInMonth[month - 1]) return null;
	return `${year}-${monthValue}-${dayValue}`;
};
const validDate = value => !value || toIsoDate(value) !== null;
const formatIsoDateForDisplay = value => {
	if (!value) return '';
	const [year, month, day] = value.split('-');
	return `${day}/${month}/${year}`;
};
const formatDateDigits = digits => {
	const day = digits.slice(0, 2);
	const month = digits.slice(2, 4);
	const year = digits.slice(4, 8);
	return [day, month, year].filter((part, index) => part || index < Math.ceil(digits.length / 2)).join('/');
};
const caretAfterDigits = (value, digitCount, totalDigits) => {
	if (digitCount === 0) return 0;
	if (digitCount === 2 && totalDigits > 2) return 3;
	if (digitCount === 4 && totalDigits > 4) return 6;
	let seen = 0;
	for (let index = 0; index < value.length; index += 1) {
		if (/\d/.test(value[index])) seen += 1;
		if (seen === digitCount) return index + 1;
	}
	return value.length;
};
const schema = z.object({
	name: z.string().trim().min(1, 'Please enter your name').max(120, 'Name must be 120 characters or fewer'),
	phone: z.string().trim().max(32, 'Phone number must be 32 characters or fewer').refine(value => !value || /^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/.test(value), 'Please enter a valid Indian mobile number'),
	email: z.string().trim().max(254, 'Email must be 254 characters or fewer').refine(value => !value || z.string().email().safeParse(value).success, 'Please enter a valid email address'),
	birthday: z.string().refine(validDate, 'Date of birth must be a valid date'),
	anniversary: z.string().refine(validDate, 'Anniversary must be a valid date'),
});

function Field({ icon: Icon, label, error, children }) {
	return <label className="register-field"><span className="register-label">{label}</span><span className="register-input-wrap"><Icon aria-hidden="true" size={17} className="register-field-icon" />{children}</span>{error && <span role="alert" className="register-error">{error}</span>}</label>;
}

function DateField({ label, name, error, register, setValue, isoDateOverrides }) {
	const inputRef = useRef(null);
	const { ref: registeredRef, onChange: registeredOnChange, ...registered } = register(name);
	const updateDigits = (input, digits, caretDigits) => {
		const limitedDigits = digits.slice(0, 8);
		const formatted = formatDateDigits(limitedDigits);
		input.value = formatted;
		setValue(name, formatted, { shouldDirty: true, shouldValidate: true });
		input.setSelectionRange(caretAfterDigits(formatted, caretDigits, limitedDigits.length), caretAfterDigits(formatted, caretDigits, limitedDigits.length));
	};
	const handleManualChange = event => {
		const input = event.currentTarget;
		const rawValue = input.value;
		const digitsBeforeCaret = rawValue.slice(0, input.selectionStart).replace(/\D/g, '').length;
		const digits = rawValue.replace(/\D/g, '').slice(0, 8);
		input.value = formatDateDigits(digits);
		isoDateOverrides.current[name] = null;
		registeredOnChange(event);
		const caret = caretAfterDigits(input.value, digitsBeforeCaret, digits.length);
		input.setSelectionRange(caret, caret);
	};
	const handleManualKeyDown = event => {
		const input = event.currentTarget;
		const { selectionStart, selectionEnd, value } = input;
		if (selectionStart !== selectionEnd) return;
		const digits = value.replace(/\D/g, '');
		if (event.key === 'Backspace' && value[selectionStart - 1] === '/') {
			event.preventDefault();
			const digitIndex = value.slice(0, selectionStart - 1).replace(/\D/g, '').length - 1;
			updateDigits(input, digits.slice(0, digitIndex) + digits.slice(digitIndex + 1), Math.max(0, digitIndex));
			isoDateOverrides.current[name] = null;
		} else if (event.key === 'Delete' && value[selectionStart + 1] === '/') {
			event.preventDefault();
			const digitIndex = value.slice(0, selectionStart).replace(/\D/g, '').length;
			updateDigits(input, digits.slice(0, digitIndex) + digits.slice(digitIndex + 1), digitIndex);
			isoDateOverrides.current[name] = null;
		}
	};
	const openPicker = () => {
		const input = inputRef.current;
		if (!input) return;
		if (typeof input.showPicker === 'function') input.showPicker();
		else input.click();
	};

	return <div className="register-field">
		<span className="register-label" id={`${name}-label`}>{label}</span>
		<span className="register-input-wrap registration-date-control">
			<input
				type="text"
				inputMode="numeric"
				autoComplete="off"
				maxLength={10}
				placeholder="DD/MM/YYYY"
				className="registration-input registration-date-text"
				aria-labelledby={`${name}-label`}
				aria-describedby={error ? `${name}-error` : undefined}
				aria-invalid={!!error}
				{...registered}
				onChange={handleManualChange}
				onKeyDown={handleManualKeyDown}
				ref={element => {
					registeredRef(element);
					inputRef.current = element;
				}}
			/>
			<button type="button" className="registration-date-picker-button" onClick={openPicker} aria-label={`Choose ${label.toLowerCase()}`}>
				<CalendarDays aria-hidden="true" size={17} />
			</button>
			<input
				type="date"
				lang="en-GB"
				className="registration-date-native"
				aria-label={label}
				aria-hidden="true"
				tabIndex={-1}
				ref={element => {
					inputRef.current = element;
				}}
				onChange={event => {
					const isoDate = event.target.value;
					isoDateOverrides.current[name] = isoDate || null;
					setValue(name, formatIsoDateForDisplay(isoDate), { shouldDirty: true, shouldValidate: true });
				}}
			/>
		</span>
		{error && <span id={`${name}-error`} role="alert" className="register-error">{error}</span>}
	</div>;
}

export default function Register() {
	const { addCustomer } = useApp();
	const navigate = useNavigate();
	const shouldReduceMotion = useReducedMotion();
	const [submitError, setSubmitError] = useState('');
	const isoDateOverrides = useRef({});
	const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
		resolver: zodResolver(schema),
		defaultValues: { name: '', phone: '', email: '', birthday: '', anniversary: '' },
	});

	const onSubmit = async values => {
		setSubmitError('');
		try {
			await addCustomer({
				...values,
				birthday: isoDateOverrides.current.birthday || toIsoDate(values.birthday),
				anniversary: isoDateOverrides.current.anniversary || toIsoDate(values.anniversary),
				notes: '',
				status: 'New',
			});
			navigate('/registration-success');
		} catch (error) {
			if (error.code === '42501' || /row-level security policy/i.test(error.message || '')) {
				setSubmitError("We couldn't save your registration because the database needs its latest update. Please ask the site administrator to apply the Supabase migration, then try again.");
				return;
			}
			setSubmitError(`We couldn't save your registration. ${error.message}`);
		}
	};
	const onInvalid = () => setSubmitError('');

	return <main className="registration-page">
		<img src={coffeeCupArt} className="registration-bg-svg registration-bg-top-left" alt="" aria-hidden="true" />
		<img src={coffeeArt} className="registration-bg-svg registration-bg-top-right" alt="" aria-hidden="true" />
		<img src={coffeeArt} className="registration-bg-svg registration-bg-bottom-left" alt="" aria-hidden="true" />
		<img src={coffeeCupArt} className="registration-bg-svg registration-bg-bottom-right" alt="" aria-hidden="true" />
		<motion.form initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: shouldReduceMotion ? 0 : 0.45 }} onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate aria-labelledby="register-title" className="registration-card">
			<header className="registration-header">
				<img src={logo} alt="Alchemist Cafe" className="registration-logo" />
				<p className="registration-eyebrow">Welcome</p>
				<h1 id="register-title">Join our community</h1>
			</header>
			<div className="registration-fields">
				<Field icon={User} label="Full name" error={errors.name?.message}><input className="registration-input" required autoComplete="name" placeholder="Your full name" aria-invalid={!!errors.name} {...register('name')} /></Field>
				<Field icon={Phone} label="Mobile number" error={errors.phone?.message}><input className="registration-input" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 XXXXX XXXXX" aria-invalid={!!errors.phone} {...register('phone')} /></Field>
				<div className="registration-date-grid">
					<DateField label="Date of birth" name="birthday" error={errors.birthday?.message} register={register} setValue={setValue} isoDateOverrides={isoDateOverrides} />
					<DateField label="Anniversary" name="anniversary" error={errors.anniversary?.message} register={register} setValue={setValue} isoDateOverrides={isoDateOverrides} />
				</div>
				<p className="registration-date-note">Share your date of birth and anniversary to avail discounts and gift vouchers.</p>
				<Field icon={Mail} label="Email address" error={errors.email?.message}><input className="registration-input" type="email" autoComplete="email" placeholder="name@example.com" aria-invalid={!!errors.email} {...register('email')} /></Field>
			</div>
			{submitError && <p role="alert" className="register-error">{submitError}</p>}
			<div className="registration-actions">
				<button type="submit" disabled={isSubmitting} className="registration-submit">{isSubmitting ? <Loader2 className="animate-spin" size={17} aria-hidden="true" /> : <Coffee size={16} aria-hidden="true" />}{isSubmitting ? 'Joining...' : 'Join Alchemist'}</button>
			</div>
		</motion.form>
	</main>;
}