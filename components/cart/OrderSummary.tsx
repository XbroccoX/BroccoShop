import { Grid, Typography } from "@mui/material"
import { useContext } from 'react';
import { CartContext } from '../../context/cart';
import { currency } from "../../utils";

interface Props {
    orderValues?: {
        numberOfItems: number,
        subTotal: number,
        tax: number,
        total: number
    }
}

export const OrderSummary = ({ orderValues }) => {


    const { numberOfItems, subTotal, tax, total } = useContext(CartContext)

    const summaryValues = orderValues ? orderValues : { numberOfItems, subTotal, tax, total };

    return (
        <Grid container>

            <Grid item xs={6}>
                <Typography>No. Productos</Typography>
            </Grid>
            <Grid item xs={6} display='flex' justifyContent='end'>
                <Typography>{summaryValues.numberOfItems} items</Typography>
            </Grid>

            <Grid item xs={6}>
                <Typography>SubTotal</Typography>
            </Grid>
            <Grid item xs={6} display='flex' justifyContent='end'>
                <Typography>{currency.format(summaryValues.subTotal)}</Typography>
            </Grid>

            <Grid item xs={6}>
                <Typography>Impuestos ({Number(process.env.NEXT_PUBLIC_TAX_RATE) * 100}%)</Typography>
            </Grid>
            <Grid item xs={6} display='flex' justifyContent='end'>
                <Typography>{currency.format(summaryValues.tax)}</Typography>
            </Grid>

            <Grid item xs={6} sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Total:</Typography>
            </Grid>
            <Grid item xs={6} sx={{ mt: 2 }} display='flex' justifyContent='end'>
                <Typography variant="subtitle1">{currency.format(summaryValues.total)}</Typography>
            </Grid>

        </Grid>
    )
}
