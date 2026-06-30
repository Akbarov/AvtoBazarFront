import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth/AuthContext'
import { ThemeProvider } from '@/lib/theme/ThemeContext'
import { ToastProvider } from '@/components/common/toast'
import { ConfirmProvider } from '@/components/common/confirm'
import { AppRoutes } from '@/routes/AppRoutes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <ConfirmProvider>
            <AuthProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </AuthProvider>
          </ConfirmProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
