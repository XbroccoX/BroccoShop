import useSWR from 'swr';
import { ConfirmationNumberOutlined } from '@mui/icons-material'
import { Chip, Grid, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { AdminLayout, AuthLayout } from '../../../components/layouts'
import { IOrder, IUser } from '../../../interfaces';





const columns: GridColDef[] = [
    { field: 'id', headerName: 'Order ID', width: 250 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'name', headerName: 'Nombre Completo', width: 300 },
    { field: 'total', headerName: 'Monto total', width: 250 },
    {
        field: 'isPaid',
        width: 150,
        align: 'center',
        headerName: 'Estado de pago',
        renderCell: ({ row }: GridValueGetterParams) => {
            return row.isPaid
                ? (
                    <Chip variant='outlined' label='Pagada' color='success' />
                )
                : (
                    <Chip variant='outlined' label='Pendiente' color='error' />
                )
        }
    },
    { field: 'noProducts', headerName: 'No.Productos', align: 'center', width: 130 },
    {
        field: 'check',
        headerName: 'Ver orden',
        renderCell: ({ row }: GridValueGetterParams) => {
            return (
                <a href={`/admin/orders/${row.id}`} target='_blank'>
                    Ver orden
                </a>
            )
        }
    },
    { field: 'createdAt', headerName: 'Creada el', width: 200 }
]

const OrdersPage = () => {

    const { data, error, isValidating } = useSWR<IOrder[]>('/api/admin/orders')
    if (isValidating) {
        return (<></>)
    }

    const rows = data!.map(order => ({
        id: order._id,
        email: (order.user as IUser).email,
        name: (order.user as IUser).name,
        total: order.total,
        isPaid: order.isPaid,
        noProducts: order.numberOfItems,
        createdAt: order.createdAt
    }))

    if (error) {
        return (
            <Typography>Hay un error</Typography>
        )
    }



    return (
        <AdminLayout title={'Ordenes'} subTitle={'Mantenimiento de Ordenes'} icon={<ConfirmationNumberOutlined />}>
            <Grid container className='fadeIn'>
                <Grid item xs={12} sx={{ height: 650, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10]}
                    />

                </Grid>
            </Grid>
        </AdminLayout>
    )
}

export default OrdersPage