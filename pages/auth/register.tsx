import NextLink from 'next/link';
import { GetServerSideProps } from 'next'
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { getSession, signIn } from 'next-auth/react';

import { Box, Button, Grid, Link, TextField, Typography } from '@mui/material';
import { ErrorOutlined } from '@mui/icons-material';

import { AuthLayout } from '../../components/layouts'
import { validations } from '../../utils';
import { useState, useContext } from 'react';
import { oasisApi } from '../../axiosApi';
import { AuthContext } from '../../context';



type FormData = {
    email: string;
    password: string;
    name: string;
}

const RegisterPage = () => {

    const { registerUser } = useContext(AuthContext);
    const router = useRouter();

    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');


    const onRegisterForm = async ({ email, password, name }: FormData) => {
        setShowError(false);
        const { hasError, message } = await registerUser(name, email, password);

        if (hasError) {
            setShowError(true);
            setErrorMessage(message || '');
            setTimeout(() => setShowError(false), 3000);
            return;
        }
        /* const destination = router.query.p?.toString() || '/'
        router.replace(destination); */

        /* -------NEXT AUTH ------------ */
        await signIn('credentials', { email, password })
    }

    return (
        <AuthLayout title={'Ingresar'}>
            <form onSubmit={handleSubmit(onRegisterForm)} noValidate >
                <Box sx={{ width: 350, padding: '10px 20px' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant='h1' component="h1">Crear cuenta</Typography>
                            <Box sx={{ display: showError ? 'flex' : 'none' }}>
                                <Typography color='error'>Ups salio un error, intentalo nuevamente mas tarde </Typography>
                            </Box>

                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Nombre completo"
                                variant="filled"
                                fullWidth
                                {...register('name', {
                                    required: 'Ingresa el nombre correctamente',
                                    minLength: {
                                        value: 2,
                                        message: 'La longitud de la contraseña es menor a 6'
                                    },
                                    maxLength: 20
                                })}
                                error={!!errors.name}
                                helperText={errors.name?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                type='email'
                                label="Correo"
                                variant="filled"
                                fullWidth
                                {...register('email', {
                                    required: 'Ingresa el email correctamente',
                                    validate: (val) => validations.isEmail(val)
                                })}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Contraseña"
                                type='password'
                                variant="filled"
                                fullWidth
                                {
                                ...register('password', {
                                    required: 'Ingrese correctamente la contraseña',
                                    minLength: {
                                        value: 6,
                                        message: 'La contraseña debe cumplir con más de 6 caracterés'
                                    }
                                })
                                }
                                error={!!errors.password}
                                helperText={errors.password?.message}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button type='submit' color="secondary" className='circular-btn' size='large' fullWidth>
                                Ingresar
                            </Button>
                        </Grid>

                        <Grid item xs={12} display='flex' justifyContent='end'>
                            <NextLink href={`/auth/login?p=${router.query.p?.toString() || '/'}`} passHref>
                                <Link underline='always'>
                                    ¿Ya tienes cuenta?
                                </Link>
                            </NextLink>
                        </Grid>
                    </Grid>
                </Box>
            </form>
        </AuthLayout>
    )
}

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
    const session = await getSession({ req })   // your fetch function here ;
    const { p = '/' } = query

    if (session) {
        return {
            redirect: {
                destination: p.toString(),
                permanent: false
            }
        }
    }

    return {
        props: {}
    }
}

export default RegisterPage