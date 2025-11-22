import { cookies } from 'next/headers';
import { ClientProviders } from '@/components/providers/ClientProviders';
import { getLanguageFromCookies, getDirection } from '@/lib/translations';
import '@/index.css';

export const metadata = {
  title: 'Arabic Reputation System',
  description: 'Comprehensive business management system',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const language = getLanguageFromCookies(cookieStore);
  const direction = getDirection(language);

  return (
    <html lang={language} dir={direction} suppressHydrationWarning>
      <body className="antialiased">
        <ClientProviders initialLanguage={language}>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

