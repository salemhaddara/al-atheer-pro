import { cookies } from 'next/headers';
import { getLanguageFromCookies, getDirection } from '@/lib/translations';
import { Dashboard } from '@/components/Dashboard';


export default async function HomePage() {
  const cookieStore = await cookies();
  const language = getLanguageFromCookies(cookieStore);
  const direction = getDirection(language);

  return <Dashboard language={language} direction={direction} />;
}

