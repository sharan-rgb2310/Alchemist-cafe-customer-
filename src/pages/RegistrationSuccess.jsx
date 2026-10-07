import { Link } from 'react-router-dom';
 import { motion, useReducedMotion } from 'framer-motion';
import logo from '../assets/logo.png';

export default function RegistrationSuccess() {
	const shouldReduceMotion = useReducedMotion();
	const reveal = delay => shouldReduceMotion ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } } : {
		initial: { opacity: 0, y: 8 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.45, delay, ease: 'easeOut' },
	};

	return <main className="success-page">
		<motion.section
			initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: shouldReduceMotion ? 0 : 0.62, ease: 'easeOut' }}
			className="success-card"
			aria-labelledby="success-title"
		>
			<motion.img src={logo} alt="Alchemist Cafe" className="success-logo" {...reveal(0.12)} />
			<motion.div className="success-check" {...(shouldReduceMotion ? { initial: false } : { initial: { scale: 0.78, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.45, delay: 0.34, ease: 'easeOut' } })}>
				<svg viewBox="0 0 64 64" className="success-check-svg" aria-hidden="true">
					<circle className="success-check-ring" cx="32" cy="32" r="28" />
					<path className="success-check-path" d="m19 32 9 9 18-20" />
				</svg>
			</motion.div>
			<motion.h1 id="success-title" className="success-title" {...reveal(0.82)}>Registration Successful!</motion.h1>
			<motion.p className="success-description" {...reveal(1.02)}>Welcome to our cafe community. Stay tuned for new menus, special offers &amp; exclusive gift vouchers.<br /><br />We can’t wait to serve you! ❤️</motion.p>
			<motion.div className="success-action" {...reveal(1.2)}>
				<Link to="/" className="success-home-link">BACK TO HOME <span aria-hidden="true">→</span></Link>
			</motion.div>
		</motion.section>
	</main>;
}