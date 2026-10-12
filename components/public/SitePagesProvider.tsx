'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { defaultPages, normalizePages, type SitePages } from '@/lib/content/site-pages';
const Context=createContext<SitePages>(defaultPages());
export function useSitePages(){return useContext(Context);}

function SitePagesInner({initial,children}:{initial:SitePages;children:React.ReactNode}) {
  const [preview,setPreview]=useState<SitePages|null>(null);
  useEffect(()=>{const receive=(event:MessageEvent)=>{if(window.parent===window||event.source!==window.parent||event.origin!==location.origin||event.data?.type!=='merchantbridge:design-preview')return;if(event.data.pages)setPreview(normalizePages(event.data.pages));};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[]);
  return <Context.Provider value={preview??initial}>{children}</Context.Provider>;
}

export default function SitePagesProvider({initial,children}:{initial:SitePages;children:React.ReactNode}) {
  // Keyed on the server payload: new pages remount the inner provider, which resets
  // state without a setState-in-effect sync. Preview overrides still win via `preview`.
  return <SitePagesInner key={JSON.stringify(initial)} initial={initial}>{children}</SitePagesInner>;
}
