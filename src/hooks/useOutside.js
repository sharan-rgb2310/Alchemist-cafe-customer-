import {useEffect,useRef,useState} from 'react';
export default function useDropdown(){const [open,setOpen]=useState(false);const ref=useRef(null);
useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};const k=e=>e.key==='Escape'&&setOpen(false);document.addEventListener('mousedown',h);document.addEventListener('keydown',k);return()=>{document.removeEventListener('mousedown',h);document.removeEventListener('keydown',k)}},[]);return {open,setOpen,ref}}
