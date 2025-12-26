import { cookies } from 'next/headers';
import { ClientProviders } from '@/components/providers/ClientProviders';
import { getLanguageFromCookies, getDirection } from '@/lib/translations';
import { Tajawal } from 'next/font/google';
import '@/index.css';

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
  display: 'swap',
});

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
    <html lang={language} dir={direction} suppressHydrationWarning className={tajawal.variable}>
      <body className="antialiased font-sans">
        <ClientProviders initialLanguage={language}>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

