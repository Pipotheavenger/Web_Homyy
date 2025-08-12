import { redirect } from 'next/navigation';

export default function Home() {
  console.log('Redirigiendo a /login desde la página raíz');
  redirect('/login');
  return null;
} 