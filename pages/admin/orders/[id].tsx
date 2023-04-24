import { useState } from "react";
import { NextPage, GetServerSideProps } from "next"
import { getSession } from 'next-auth/react';
import { Box, Card, CardContent, CircularProgress, Divider, Grid, Typography } from "@mui/material"
import { dbOrders } from "../../../database";
import { ShopLayout } from "../../../components/layouts"
import { IOrder } from '../../../interfaces/order';
import { CreditScoreOutlined, CreditCardOffOutlined } from "@mui/icons-material";
import { CartList, OrderSummary } from "../../../components/cart";

interface Props {
    order: IOrder
}

const OrderPageVisualization: NextPage<Props> = ({ order }) => {

    const { shippingAddress } = order;
    const [isPaying, setIsPaying] = useState(false);

    return (
        <ShopLayout title={`Resumen de la orden: `} pageDescription={"Se encuentra el detalle de la orden del usuario"}>
            <Typography variant='h1' component='h1'>Orden: {order._id}</Typography>
            {
                order.isPaid
                    ? (
                        <Box sx={{ my: 2 }}>
                            <Typography color='success'>Orden ya fue pagada </Typography>
                        </Box>
                    )
                    : (
                        <Box sx={{ my: 2 }}>
                            <Typography color='success'>Orden pendiente de pago </Typography>
                        </Box>

                    )
            }


            <Grid container className='fadeIn'>
                <Grid item xs={12} sm={7}>
                    <CartList products={order.orderItems} />
                </Grid>
                <Grid item xs={12} sm={5}>
                    <Card className='summary-card'>
                        <CardContent>
                            <Typography variant='h2'>Resumen ({order.numberOfItems} {order.numberOfItems > 1 ? 'productos' : 'producto'})</Typography>
                            <Divider sx={{ my: 1 }} />

                            <Box display='flex' justifyContent='space-between'>
                                <Typography variant='subtitle1'>Dirección de entrega</Typography>
                            </Box>


                            <Typography>{shippingAddress.firstName} {shippingAddress.lastName}</Typography>
                            <Typography>{shippingAddress.address} {shippingAddress.address2 ? `, ${shippingAddress.address2}` : ''}</Typography>
                            <Typography>{shippingAddress.city} , {shippingAddress.zip}</Typography>
                            <Typography>{shippingAddress.country} </Typography>
                            <Typography>{shippingAddress.phone}</Typography>

                            <Divider sx={{ my: 1 }} />

                            <OrderSummary orderValues={{
                                numberOfItems: order.numberOfItems,
                                subTotal: order.subTotal,
                                tax: order.tax,
                                total: order.total
                            }} />

                            <Box sx={{ mt: 3 }} display='flex' flexDirection='column'>
                                <Box flexDirection='column' sx={{ display: 'flex', flex: 1 }}>
                                    {
                                        order.isPaid
                                            ? (
                                                <Box sx={{ my: 2 }}>
                                                    <Typography color='success'>Orden ya fue pagada </Typography>
                                                </Box>
                                            )
                                            : (
                                                <Box sx={{ my: 2 }}>
                                                    <Typography color='success'>Orden pendiente de pago </Typography>
                                                </Box>

                                            )
                                    }
                                </Box>
                            </Box>

                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

        </ShopLayout>
    )
}

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
    const { id = '' } = query;
    const session: any = await getSession({ req });

    if (!session) {
        return {
            redirect: {
                destination: `auth/login?=p/admin/orders/${id}`,
                permanent: false
            }
        }
    }

    const order = await dbOrders.getOrderById(id.toString());

    if (!order) {
        return {
            redirect: {
                destination: `/admin/orders`,
                permanent: false
            }
        }
    }
    if (order.user !== session.user._id) {
        return {
            redirect: {
                destination: `/admin/orders`,
                permanent: false
            }
        }
    }

    return {
        props: {
            order
        }
    }
}


export default OrderPageVisualization