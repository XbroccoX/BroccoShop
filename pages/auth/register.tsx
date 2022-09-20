import { useForm } from 'react-hook-form';
import NextLink from 'next/link';

import { Box, Button, Grid, Link, TextField, Typography, Chip } from '@mui/material';
import { ErrorOutlined } from '@mui/icons-material';

import { AuthLayout } from '../../components/layouts'
import { validations } from '../../utils';
import { useState, useContext } from 'react';
import { oasisApi } from '../../api';
import { AuthContext } from '../../context';
import { useRouter } from 'next/router';



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
        }

        router.replace('/');
    }

    return (
        <AuthLayout title={'Ingresar'}>
            <form onSubmit={handleSubmit(onRegisterForm)} noValidate >
                <Box sx={{ width: 350, padding: '10px 20px' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant='h1' component="h1">Crear cuenta</Typography>
                            <Chip
                                label='Ups salio un error, intentalo nuevamente mas tarde'
                                color='error'
                                icon={<ErrorOutlined />}
                                sx={{ display: showError ? 'flex' : 'none' }}
                            />
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
                            <NextLink href="/auth/login" passHref>
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

export default RegisterPage