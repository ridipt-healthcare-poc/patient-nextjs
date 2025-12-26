'use client'

import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { AuthProvider } from '@/contexts/AuthContext'

const theme = extendTheme({
    config: {
        initialColorMode: 'light',
        useSystemColorMode: false,
    },
    colors: {
        brand: {
            50: '#E0F2FE',
            100: '#BAE6FD',
            200: '#7DD3FC',
            300: '#38BDF8',
            400: '#0EA5E9',
            500: '#0284C7',
            600: '#0369A1',
            700: '#075985',
            800: '#0C4A6E',
            900: '#0F4C75',
        },
    },
})

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ChakraProvider theme={theme}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </ChakraProvider>
    )
}
