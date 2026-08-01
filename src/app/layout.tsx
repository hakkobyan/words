import './globals.css';import type {Metadata,Viewport} from 'next';import AppShell from '@/components/layout/AppShell';
export const metadata:Metadata={title:'words — учите слова легко',description:'Персональный словарь английского и немецкого языка',manifest:'/manifest.json'};export const viewport:Viewport={themeColor:'#704838',width:'device-width',initialScale:1,viewportFit:'cover'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ru" suppressHydrationWarning><body><AppShell>{children}</AppShell></body></html>}
