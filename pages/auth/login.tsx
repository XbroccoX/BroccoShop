import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next'
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { getSession, signIn, getProviders } from 'next-auth/react';
import { useForm } from 'react-hook-form';

import { Box, Button, Grid, Link, TextField, Typography, Divider } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

// import { AuthContext } from '../../context';
import { AuthLayout } from '../../components/layouts'
import { validations } from '../../utils';
// import { oasisApi } from '../../api';

type FormData = {
    email: string,
    password: string,
};

const LoginPage = () => {
    // const { loginUser } = useContext(AuthContext);
    const router = useRouter()

    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
    const [showError, setShowError] = useState(false);

    const [providers, setProviders] = useState<any>({})

    useEffect(() => {
        getProviders().then(prov => {
            console.log(prov);
            setProviders(prov)
        })
    }, [])



    const onLoginUser = async ({ email, password }: FormData) => {
        setShowError(false);

        //     const isValidLogin = await loginUser(email, password);

        //     if (!isValidLogin) {
        //         setShowError(true);
        //         setTimeout(() => setShowError(false), 3000);
        //     }

        //     //TODO:navegar a la pantalla del usuario
        //     const destination = router.query.p?.toString() || '/';
        //     router.replace(destination);

        /* ----------NEXT AUTH------------------- */
        await signIn('credentials', { email, password });
    }



    return (
        <AuthLayout title={'Ingresar'}>
            <form onSubmit={handleSubmit(onLoginUser)} noValidate>
                <Box sx={{ width: 350, padding: '10px 20px' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant='h1' component="h1">Iniciar Sesión</Typography>
                            <Box sx={{ display: showError ? 'flex' : 'none' }}>
                                <Typography color='error'>No reconocemos ese usuario / password </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                type='email'
                                label="Correo"
                                variant="filled"
                                fullWidth
                                {...register('email', {
                                    required: "Ingresa bien el email o el coco te comera en la noche",
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
                                {...register('password', {
                                    required: 'Este campo es requerido para el login',
                                    minLength: {
                                        value: 6,
                                        message: 'La longitud de la contraseña es menor a 6'
                                    }
                                })}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                type='submit'
                                color="secondary"
                                className='circular-btn'
                                size='large'
                                fullWidth
                            >
                                Ingresar
                            </Button>
                        </Grid>

                        <Grid item xs={12} display='flex' justifyContent='end'>
                            <NextLink href={`/auth/register?p=${router.query.p?.toString() || '/'}`} passHref>
                                <Link underline='always'>
                                    ¿No tienes cuenta?
                                </Link>
                            </NextLink>
                        </Grid>

                        <Grid item xs={12} display='flex' flexDirection='column' justifyContent='end'>
                            <Divider sx={{ width: '100%', mb: 2 }} />
                            {
                                Object.values(providers).map((provider: any) => {
                                    if (provider.id === 'credentials') return (<div key={provider.id}></div>)

                                    return (
                                        <Button key={provider.id}
                                            variant='outlined'
                                            fullWidth
                                            color='primary'
                                            sx={{ mb: 1 }}
                                            onClick={() => signIn(provider.id)}
                                        >
                                            {provider.name}
                                        </Button>

                                    )
                                }
                                )
                            }
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

    const session = await getSession({ req })  // your fetch function here
    const { p = '/' } = query;
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

export default LoginPage