import { FC, useContext } from 'react';
import NextLink from 'next/link';
import { Box, Button, CardActionArea, CardMedia, Grid, Link, Typography } from '@mui/material';

import { initialData } from '../../database/products';
import { ItemCounter } from '../ui';
import { ICartProduct } from '../../interfaces';
import { CartContext } from '../../context';

interface Props {
    editable?: boolean;
    products: ICartProduct[]
}

export const CartList: FC<Props> = ({ editable = false, products }) => {

    const { cart, updateCartQuantity, removeCartProduct } = useContext(CartContext);

    const onNewCartQuantityValue = (product: ICartProduct, newQuantityValue: number) => {
        product.quantity = newQuantityValue;
        updateCartQuantity(product)
    }





    return (
        <>
            {
                products.map(product => (
                    <Grid container spacing={2} key={product.slug + product.size} sx={{ mb: 1 }}>
                        <Grid item xs={3}>
                            {/* TODO: llevar a la página del producto */}
                            <NextLink href="/product/slug" passHref>
                                <Link>
                                    <CardActionArea>
                                        <CardMedia
                                            image={`/products/${product.image}`}
                                            component='img'
                                            sx={{ borderRadius: '5px' }}
                                        />
                                    </CardActionArea>
                                </Link>
                            </NextLink>
                        </Grid>
                        <Grid item xs={7}>
                            <Box display='flex' flexDirection='column'>
                                <Typography variant='body1'>{product.title}</Typography>
                                <Typography variant='body1' >Talla: <strong>{product.size}</strong> </Typography>

                                {
                                    editable
                                        ? <ItemCounter
                                            currentValue={product.quantity}
                                            maxValue={10}
                                            updatedQuantity={(value) => onNewCartQuantityValue(product, value)} />
                                        : <Typography variant='h5'> {product.quantity > 1 ? 'Productos' : 'Producto'}</Typography>
                                }

                            </Box>
                        </Grid>
                        <Grid item xs={2} display='flex' alignItems='center' flexDirection='column'>
                            <Typography variant='subtitle1'>{`$${product.price}`}</Typography>

                            {
                                editable && (
                                    <Button variant='text' color='secondary'
                                        onClick={() => removeCartProduct(product)}
                                    >
                                        Remover
                                    </Button>
                                )
                            }
                        </Grid>
                    </Grid>
                ))
            }
        </>
    )
}