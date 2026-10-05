import React,{createContext,useContext,useState,useCallback,useMemo,useEffect} from 'react';
import * as svc from '../services/customerService';
import {getAdminUser,subscribeToAuth} from '../services/adminAuth';
const Ctx=createContext(null);export const useApp=()=>useContext(Ctx);
const SK='alchemist.settings.v1';
const defSettings={name:'Admin',email:'',phone:'',notif:{birthday:true,anniversary:true,newCustomer:true,system:false},compact:false};
export function AppProvider({children}){
 const [customers,setCustomers]=useState(()=>svc.getCachedCustomers());
 const [adminUser,setAdminUser]=useState(null);const [authLoading,setAuthLoading]=useState(true);const [customersLoading,setCustomersLoading]=useState(false);
 const [toasts,setToasts]=useState([]);const [confirm,setConfirm]=useState(null);
 const [settings,setSettings]=useState(()=>{try{return {...defSettings,...JSON.parse(localStorage.getItem(SK))}}catch{return defSettings}});
 useEffect(()=>{localStorage.setItem(SK,JSON.stringify(settings));document.documentElement.classList.toggle('compact',!!settings.compact)},[settings]);
 const toast=useCallback((msg,type='success')=>{const id=Date.now()+Math.random();setToasts(t=>[...t,{id,msg,type}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3500)},[]);
 const closeToast=id=>setToasts(t=>t.filter(x=>x.id!==id));
 useEffect(()=>{
  let active=true;
  const unsubscribe=subscribeToAuth(user=>{if(active){setAdminUser(user);setAuthLoading(false)}});
  getAdminUser().then(user=>{if(active){setAdminUser(user);setAuthLoading(false)}}).catch(error=>{if(active){setAuthLoading(false);toast(`Could not verify administrator session: ${error.message}`,'error')}});
  return()=>{active=false;unsubscribe()};
 },[toast]);
 useEffect(()=>{
  if(authLoading)return;
  if(!adminUser){setCustomers([]);setCustomersLoading(false);return}
  let active=true;
  setCustomersLoading(true);
  svc.getCustomers().then(rows=>{if(active)setCustomers(rows)}).catch(error=>{if(active)toast(`Could not load customers from Supabase: ${error.message}`,'error')}).finally(()=>{if(active)setCustomersLoading(false)});
  return()=>{active=false};
 },[adminUser,authLoading,toast]);
 const addCustomer=async d=>{try{const c=await svc.createCustomer(d);if(c.id)setCustomers(rows=>[c,...rows.filter(row=>row.id!==c.id)]);toast('Customer saved to database');return c}catch(error){toast(`Could not save customer: ${error.message}`,'error');throw error}};
 const editCustomer=async(id,d)=>{try{const c=await svc.updateCustomer(id,d);setCustomers(rows=>rows.map(row=>row.id===id?c:row));toast('Customer updated in database');return c}catch(error){toast(`Could not update customer: ${error.message}`,'error');throw error}};
 const removeCustomer=async id=>{try{await svc.deleteCustomer(id);setCustomers(rows=>rows.filter(row=>row.id!==id));toast('Customer deleted from database')}catch(error){toast(`Could not delete customer: ${error.message}`,'error');throw error}};
 const v=useMemo(()=>({customers,customersLoading,adminUser,authLoading,toasts,closeToast,toast,confirm,setConfirm,settings,setSettings,addCustomer,editCustomer,removeCustomer}),[customers,customersLoading,adminUser,authLoading,toasts,confirm,settings]);
 return <Ctx.Provider value={v}>{children}</Ctx.Provider>}
