import useSWR from "swr";
import { PeopleOutline } from "@mui/icons-material"
import { Grid, MenuItem, Select, Typography } from "@mui/material"
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { AdminLayout } from "../../components/layouts"
import { IUser } from "../../interfaces";
import { oasisApi } from "../../axiosApi";
import { useEffect, useState } from 'react';

const UsersPage = () => {

    const { data, error, isValidating } = useSWR<IUser[]>(`/api/admin/users`);
    const [users, setUsers] = useState<IUser[]>([]);

    useEffect(() => {
        if (data) {
            setUsers(data);
        }

    }, [data])



    const onRoleUpdated = async (userId: string, newRole: string) => {

        const previousUsers = users.map(user => ({ ...user }));
        const updatedUsers = users.map(user => ({
            ...user,
            role: userId === user._id ? newRole : user.role
        }));

        setUsers(updatedUsers);

        try {
            await oasisApi.put('admin/users', {
                userId, role: newRole
            });

        } catch (error) {
            setUsers(previousUsers);
            console.log(error);
            alert('No se pudo actualizar el error del usuario');
        }
    }

    if (isValidating) {
        return <></>
    }
    if (error) {
        return <Typography>Hay un error al cargar la pagina</Typography>
    }

    const columns: GridColDef[] = [
        { field: 'email', headerName: 'Email', width: 250 },
        { field: 'name', headerName: 'Nombre Completo', width: 300 },
        {
            field: 'role',
            headerName: 'Rol',
            width: 250,
            renderCell: ({ row }: GridValueGetterParams) => {
                return (
                    <Select
                        value={row.role}
                        label='Rol'
                        onChange={({ target }) => onRoleUpdated(row.id, target.value)}
                        sx={{ width: '300px' }}
                    >
                        <MenuItem value='admin'>Admin</MenuItem>
                        <MenuItem value='super-user'>Super-user</MenuItem>
                        <MenuItem value='SEO'>SEO</MenuItem>
                        <MenuItem value='client'>Client</MenuItem>
                    </Select>
                )
            }
        },
    ];

    const rows = users.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
    }))





    return (
        <AdminLayout title={"Usuarios"} subTitle={"Mantenimiento de Usuarios"} icon={<PeopleOutline />}>


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

export default UsersPage