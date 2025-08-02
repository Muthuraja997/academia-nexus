import { Inter } from "next/font/google";
import AppShell from "@/components/layout/AppShell";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Academia Nexus",
  description: "Your AI-Powered Student Success Platform",
};

// Error boundary component
function ErrorBoundary({ children }) {
  if (typeof window !== 'undefined') {
    return children;
  }
  return children;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <DataProvider>
              <AppShell>
                {children}
              </AppShell>
            </DataProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
