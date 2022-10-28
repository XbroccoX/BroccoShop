import NextAuth from "next-auth"

import Credentials from "next-auth/providers/credentials"

import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google";

import { dbUsers } from "../../../database";
import jwt from 'jsonwebtoken';




export default NextAuth({
    // Configure one or more authentication providers
    providers: [

        // ...add more providers here
        Credentials({
            name: 'Custom Login',
            credentials: {
                email: { label: 'Correo:', type: 'email', placeholder: 'correo@google.com' },
                password: { label: 'Password:', type: 'password', placeholder: 'password' }
            },
            async authorize(credentials) {
                console.log({ credentials });
                // return { name: 'Santiago', correo: 'santi@gmail.com', role: 'admin' };
                //TODO Validar contra base de datos
                return await dbUsers.checkUserEmailPassword(credentials!.email, credentials!.password);
            }
        }),
        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
        /*         GoogleProvider({
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET
                }) */
    ],

    //Custom Pages
    pages: {
        signIn: '/auth/login',
        newUser: '/auth/register'
    },


    //callbacks;
    jwt: {
        // secret: process.env.JWT_SECRET_SEED
    },

    session: {
        maxAge: 2592000, // 30 dias
        strategy: 'jwt',
        updateAge: 86400
    },

    callbacks: {
        async jwt({ token, account, user }) {
            // console.log({ token, account, user })

            if (account) {
                token.accessToken = account.access_token;
                switch (account.type) {
                    case 'oauth':
                        //TODO: crear usuario o verificar si existe en mi base de datos
                        token.user = await dbUsers.oAuthToDbUser(user?.email || '', user?.name || '')
                    case 'credentials':
                        token.user = user;
                        break;
                }
            }
            return token;
        },


        async session({ session, token, user }) {
            // console.log({ session, token, user })
            session.accessToken = token.accessToken;
            session.user = token.user as any;

            return session;
        }
    }

})