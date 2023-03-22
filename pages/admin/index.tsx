import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Grid, CardContent, Typography, Card, Box, CircularProgress } from '@mui/material';
import { DashboardOutlined, CreditCardOffOutlined, PersonOffOutlined, VerifiedOutlined, AttachMoneyOutlined, CreditCardOutlined, GroupOutlined, CategoryOutlined, CancelPresentationOutlined, ProductionQuantityLimitsOutlined, AccessTimeOutlined } from '@mui/icons-material';

import { AdminLayout } from '../../components/layouts'
import { SummaryTile } from '../../components/admin/SummaryTile';
import { DashboardSummaryResponse } from '../../interfaces/dashboard';

const DashboardPage = () => {

    const { data, error, isValidating } = useSWR('api/admin/dashboard', {
        refreshInterval: 30 * 1000 //30 seg
    });

    const [refreshIn, setRefreshIn] = useState(30);

    useEffect(() => {
        const interval = setInterval(() => {
            setRefreshIn(refreshIn => refreshIn > 0 ? refreshIn - 1 : 30);
        }, 1000)

        return () => clearInterval(interval)
    }, [])



    if (isValidating) {
        return (
            <Box sx={{ display: 'flex' }}>
                <CircularProgress />
            </Box>
        )
    }
    if (error) {
        console.log(error)
        return <Typography>Error al cargar la informacion</Typography>
    }

    const {
        numberOfOrders,
        paidOrders,
        notPaidOrders,
        numberOfClients,
        numberOfProducts,
        productsWithNoInventory,
        lowInventory,
    } = data

    return (
        <AdminLayout
            title={'Dashboard'}
            subTitle={'Estadisticas generales'}
            icon={<DashboardOutlined />}
        >
            <Grid container spacing={2}>

                <SummaryTile title={numberOfOrders} subTitle={'Ordenes Totales'} icon={<CreditCardOutlined color='secondary' sx={{ fontSize: 40 }} />} />
                <SummaryTile title={paidOrders} subTitle={'Usuarios'} icon={<AttachMoneyOutlined color='success' sx={{ fontSize: 40 }} />} />
                <SummaryTile title={notPaidOrders} subTitle={'Administrativos'} icon={<CreditCardOffOutlined color='error' sx={{ fontSize: 40 }} />} />
                <SummaryTile title={numberOfClients} subTitle={'Clientes'} icon={<GroupOutlined color='primary' sx={{ fontSize: 40 }} />} />
                <SummaryTile title={numberOfProducts} subTitle={'Productos'} icon={<CategoryOutlined color='warning' sx={{ fontSize: 40 }} />} />
                <SummaryTile title={productsWithNoInventory} subTitle={'Sin existencias'} icon={<CancelPresentationOutlined color='error' sx={{ fontSize: 40 }} />} />
                <SummaryTile title={lowInventory} subTitle={'Bajo Inventario'} icon={<ProductionQuantityLimitsOutlined color='warning' sx={{ fontSize: 40 }} />} />
                <SummaryTile title={`${refreshIn} seg`} subTitle={'Actualizacion en:'} icon={<AccessTimeOutlined color='secondary' sx={{ fontSize: 40 }} />} />

            </Grid>
        </AdminLayout>
    )
}

export default DashboardPage