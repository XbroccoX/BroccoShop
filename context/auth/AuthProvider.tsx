import { FC, PropsWithChildren, useReducer, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from 'next/router';

import Cookies from 'js-cookie';
import axios from 'axios';

import { oasisApi } from '../../axiosApi';
import { IUser } from '../../interfaces/user';
import { AuthContext, authReducer } from './';


export interface AuthState {
    isLoggedIn: boolean;
    user?: IUser;
}

const Auth_INITIAL_STATE: AuthState = {
    isLoggedIn: false,
    user: undefined,
}

export const AuthProvider: FC<PropsWithChildren<AuthState>> = ({ children }) => {

    const [state, dispatch] = useReducer(authReducer, Auth_INITIAL_STATE);
    const { data: session, status } = useSession();
    console.log({ session, status });

    const router = useRouter()

    useEffect(() => {
        if (status === "authenticated") {
            console.log({ user: session?.user })
            Cookies.set('imageUser', session?.user?.image || '')
            dispatch({ type: 'Auth - Login', payload: session?.user as IUser })
        }
    }, [status, session])


    // useEffect(() => {
    //     checkToken();
    // }, [])

    const checkToken = async () => {
        //llamar al endpoint;
        try {
            const { data } = await oasisApi.get('/user/validate-token');
            const { token, user } = data;
            Cookies.set('token', token);
            dispatch({
                type: 'Auth - Login',
                payload: user
            });
        } catch (error) {
            Cookies.remove('token');
        }
    }



    const loginUser = async (email: string, password: string): Promise<boolean> => {
        try {
            const { data } = await oasisApi.post('/user/login', { email, password });
            const { token, user } = data;
            Cookies.set('token', token);
            dispatch({
                type: 'Auth - Login',
                payload: user
            });
            return true;

        } catch (error) {
            return false;
        }
    }

    const registerUser = async (name: string, email: string, password: string): Promise<{ hasError: boolean; message?: string }> => {
        try {
            const { data } = await oasisApi.post('/user/register', { email, password, name });
            const { token, user } = data;
            Cookies.set('token', token);
            dispatch({
                type: 'Auth - Login',
                payload: user
            })
            return {
                hasError: false
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    hasError: true,
                    message: error.message
                }
            }
            return {
                hasError: true,
                message: 'No se pudo crear el usuario - intente de nuevo'
            }
        }
    }

    const logout = () => {
        Cookies.remove('cart');
        Cookies.remove('firstName');
        Cookies.remove('lastName');
        Cookies.remove('address');
        Cookies.remove('address2');
        Cookies.remove('zip');
        Cookies.remove('city');
        Cookies.remove('country');
        Cookies.remove('phone');

        signOut();
        // Cookies.remove('token');
        // router.reload();
    }


    return (
        <AuthContext.Provider value={{
            ...state,
            //Methods
            loginUser,
            registerUser,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    )
}