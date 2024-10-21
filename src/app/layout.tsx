import './globals.css'
import { AuthProvider } from './context/AuthContext';

export const metadata = {
  title: 'Assets Page',
  description: 'Assets and investments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
