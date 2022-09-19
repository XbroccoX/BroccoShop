import { FC, PropsWithChildren, useReducer } from 'react';
import { IUser } from '../../interfaces/user';
import { AuthContext, authReducer } from './';


export interface AuthState {
    isLoggedIn: boolean;
    user?: IUser;
}

const Auth_INITIAL_STATE: AuthState = {
    isLoggedIn: false,
    user: undefined
}

export const AuthProvider: FC<PropsWithChildren<AuthState>> = ({ children }) => {

    const [state, dispatch] = useReducer(authReducer, Auth_INITIAL_STATE)

    return (
        <AuthContext.Provider value={{
            ...state
            //Methods
        }}>
            {children}
        </AuthContext.Provider>
    )
}