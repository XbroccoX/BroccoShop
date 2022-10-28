import { useContext, useEffect } from 'react';
import NextLink from 'next/link';

import { Link, Box, Button, Card, CardContent, Divider, Grid, Typography } from '@mui/material';
import Cookies from 'js-cookie';

import { ShopLayout } from '../../components/layouts/ShopLayout';
import { CartList, OrderSummary } from '../../components/cart';
import { CartContext } from '../../context';
import { countries } from '../../utils/countries';
import { useRouter } from 'next/router';

const SummaryPage = () => {
    const router = useRouter()
    const { cart, numberOfItems, shippingAddress } = useContext(CartContext);

    useEffect(() => {
        if (!Cookies.get('firstName')) {
            router.push('/checkout/address')
        }
    }, [router])


    if (!shippingAddress) {
        return (<></>)
    }


    return (
        <ShopLayout title='Resumen de orden' pageDescription={'Resumen de la orden'}>
            <Typography variant='h1' component='h1'>Resumen de la orden</Typography>

            <Grid container>
                <Grid item xs={12} sm={7}>
                    <CartList products={cart} editable={false} />
                </Grid>
                <Grid item xs={12} sm={5}>
                    <Card className='summary-card'>
                        <CardContent>
                            <Typography variant='h2'>Resumen {numberOfItems} {numberOfItems > 1 ? 'Productos' : 'Producto'}</Typography>
                            <Divider sx={{ my: 1 }} />

                            <Box display='flex' justifyContent='space-between'>
                                <Typography variant='subtitle1'>Dirección de entrega</Typography>
                                <NextLink href='/checkout/address' passHref>
                                    <Link underline='always'>
                                        Editar
                                    </Link>
                                </NextLink>
                            </Box>

                            {
                                shippingAddress && (
                                    <>
                                        <Typography>{shippingAddress?.firstName} {shippingAddress?.lastName}</Typography>
                                        <Typography>{shippingAddress?.address}</Typography>
                                        <Typography sx={{ 'display': shippingAddress?.address2 ? 'flex' : 'none' }}> {shippingAddress?.address2} </Typography>
                                        <Typography>{shippingAddress?.city}, {countries.find(c => c.code === shippingAddress.country)?.name}</Typography>
                                        <Typography>{shippingAddress?.phone}</Typography>

                                        <Divider sx={{ my: 1 }} />
                                        <OrderSummary />

                                        <Box sx={{ mt: 3 }}>
                                            <Button color="secondary" className='circular-btn' fullWidth>
                                                Confirmar Orden
                                            </Button>
                                        </Box>
                                    </>
                                )

                            }

                        </CardContent>
                    </Card>
                </Grid>
            </Grid>


        </ShopLayout>
    )
}

export default SummaryPage;