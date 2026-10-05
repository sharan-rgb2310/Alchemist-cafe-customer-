import React,{lazy,Suspense} from 'react';import {Routes,Route,Navigate,Link,Outlet,useLocation} from 'react-router-dom';
import {EmptyState} from './components/ui';
import Register from './pages/Register';import RegistrationSuccess from './pages/RegistrationSuccess';import {useApp} from './context/AppContext';
const Layout=lazy(()=>import('./components/layout/Layout'));
const AdminLogin=lazy(()=>import('./pages/AdminLogin'));
const Dashboard=lazy(()=>import('./pages/Dashboard'));
const Customers=lazy(()=>import('./pages/Customers'));
const CustomerProfile=lazy(()=>import('./pages/CustomerProfile'));
const Events=lazy(()=>import('./pages/Events'));
const SettingsPage=lazy(()=>import('./pages/Settings'));
const NotFound=()=><EmptyState title="Page not found" text="That page doesn't exist." action={<Link className="btn-primary" to="/admin">Back to Dashboard</Link>}/>;
function AdminGate(){const location=useLocation();const {adminUser,authLoading}=useApp();if(authLoading)return <EmptyState title="Checking administrator access" text="Connecting to Supabase Auth…"/>;return adminUser?<Outlet/>:<Navigate to="/admin/login" replace state={{from:location}}/>}
const LazyPage=({children})=><Suspense fallback={null}>{children}</Suspense>;
export default function App(){return <Routes><Route path="/" element={<Navigate to="/register" replace/>}/><Route path="/register" element={<Register/>}/><Route path="/registration-success" element={<RegistrationSuccess/>}/><Route path="/admin/login" element={<LazyPage><AdminLogin/></LazyPage>}/>
<Route element={<AdminGate/>}><Route element={<LazyPage><Layout/></LazyPage>}>{['/admin','/dashboard'].map(p=><Route key={p} path={p} element={<LazyPage><Dashboard/></LazyPage>}/>)}
{['/admin/customers','/customers'].map(p=><Route key={p} path={p} element={<LazyPage><Customers/></LazyPage>}/>)}
{['/admin/customers/:id','/customers/:id'].map(p=><Route key={p} path={p} element={<LazyPage><CustomerProfile/></LazyPage>}/>)}
{['/admin/birthdays','/birthdays'].map(p=><Route key={p} path={p} element={<LazyPage><Events type="birthday"/></LazyPage>}/>)}
{['/admin/anniversaries','/anniversaries'].map(p=><Route key={p} path={p} element={<LazyPage><Events type="anniversary"/></LazyPage>}/>)}
{['/admin/settings','/settings'].map(p=><Route key={p} path={p} element={<LazyPage><SettingsPage/></LazyPage>}/>)}
<Route path="*" element={<NotFound/>}/></Route></Route></Routes>}
