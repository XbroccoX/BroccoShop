import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

import { CssBaseline, ThemeProvider } from '@mui/material';
import { SWRConfig } from 'swr';

import { lightTheme } from '../themes';
import { UiProvider, CartProvider } from '../context';
import { AuthProvider } from '../context/auth/AuthProvider';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '' }}>

        <SWRConfig
          value={{
            fetcher: (resource, init) => fetch(resource, init).then(res => res.json())
          }}
        >
          <AuthProvider isLoggedIn={false}>
            <CartProvider isLoaded={false} cart={[]} numberOfItems={0} subTotal={0} tax={0} total={0}>
              <UiProvider isMenuOpen={false}>
                <ThemeProvider theme={lightTheme}>
                  <CssBaseline />
                  <Component {...pageProps} />
                </ThemeProvider>
              </UiProvider>
            </CartProvider>
          </AuthProvider>
        </SWRConfig >
      </PayPalScriptProvider>
    </SessionProvider>
  )
}

export default MyApp
