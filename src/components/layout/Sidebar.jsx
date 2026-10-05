import { useNavigate, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutGrid, Users, Cake, Heart, Settings, ChevronDown, User, LogOut } from 'lucide-react';
import logo from '../../assets/logo.png';
import rooftop from '../../assets/Rooftop Sunset Lounge Retreat.png';
import useDropdown from '../../hooks/useOutside';
import { useApp } from '../../context/AppContext';

const navItems = [
	['/admin', 'Dashboard', LayoutGrid],
	['/admin/customers', 'Customers', Users],
	['/admin/birthdays', 'Birthdays', Cake],
	['/admin/anniversaries', 'Anniversaries', Heart],
	['/admin/settings', 'Settings', Settings],
];

export default function Sidebar({ onNavigate }) {
	const { settings, adminUser } = useApp();
	const navigate = useNavigate();
	const menu = useDropdown();
	const logout = () => {
		document.dispatchEvent(new CustomEvent('alc-logout'));
	};

	return <div className="ac-sidebar-inner" style={{ '--ac-sidebar-image': `url("${rooftop}")` }}>
		<NavLink to="/admin" onClick={onNavigate} className="ac-sidebar-brand" aria-label="Alchemist – The Lake View Café">
			<img src={logo} alt="Alchemist – The Lake View Café" />
		</NavLink>
		<nav className="ac-sidebar-nav" aria-label="Main navigation">
			{navItems.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/admin'} onClick={onNavigate} className="ac-nav-link">
				<Icon size={26} strokeWidth={1.8} aria-hidden="true" />
				<span>{label}</span>
			</NavLink>)}
		</nav>
		<div className="ac-sidebar-tagline" aria-label="Good Food, Great People, Memorable Moments">
			<p>Good Food<br />Great People<br />Memorable Moments</p>
			<svg viewBox="0 0 120 12" aria-hidden="true">
				<path d="M5 5c28-4 69-4 108 0M18 10c25-3 57-3 83-1" />
			</svg>
		</div>
		<div className="ac-sidebar-footer" ref={menu.ref}>
			<AnimatePresence>{menu.open && <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="ac-sidebar-menu">
				<button onClick={() => { navigate('/admin/settings?tab=profile'); menu.setOpen(false); onNavigate?.(); }}><User size={17} />Profile</button>
				<button className="ac-sidebar-logout" onClick={() => { menu.setOpen(false); logout(); }}><LogOut size={17} />Logout</button>
			</motion.div>}</AnimatePresence>
			<button type="button" className="ac-sidebar-profile" aria-label="Admin profile menu" aria-haspopup="menu" aria-expanded={menu.open} onClick={() => menu.setOpen(!menu.open)}>
				<span className="ac-sidebar-avatar">A</span>
				<span className="ac-sidebar-profile-copy"><strong>{settings.name}</strong><small>{settings.email || adminUser?.email}</small></span>
				<ChevronDown size={19} aria-hidden="true" />
			</button>
		</div>
	</div>;
}
