interface LoginLayoutProps {
    children: React.ReactNode;
}

export default function LoginLayout({ children }: LoginLayoutProps) {
    // No need for providers here - root layout's ClientProviders handles everything
    // and now skips AppLayout for login pages
    return <>{children}</>;
}

