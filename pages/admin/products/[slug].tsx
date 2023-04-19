import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router';
import { useForm, useFormContext } from 'react-hook-form';

import { DriveFileRenameOutline, SaveOutlined, TaskAltOutlined, UploadOutlined } from '@mui/icons-material';
import { Box, Button, capitalize, Card, CardActions, CardMedia, Checkbox, Chip, Divider, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, Radio, RadioGroup, TextField, InputLabel, Input } from '@mui/material';

import { AdminLayout } from '../../../components/layouts'
import { IProduct, ISize } from '../../../interfaces';
import { dbProducts } from '../../../database';
import { oasisApi } from '../../../api';
import { Product } from '../../../models';


const validTypes = ['shirts', 'pants', 'hoodies', 'hats']
const validGender = ['men', 'women', 'kid', 'unisex']
const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']


interface FormData {
    _id?: string; //es opcional ya que si no tengo un Id, quiere decir que es un nuevo producto
    description: string;
    images: string[];
    inStock: number;
    price: number;
    sizes: string[];
    slug: string;
    tags: string[];
    title: string;
    type: string;
    gender: 'men' | 'women' | 'kid' | 'unisex'
}

interface Props {
    product: IProduct;
}

const ProductAdminPage: FC<Props> = ({ product }) => {

    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [newTagValue, setNewTagValue] = useState('')
    const [isSaving, setIsSaving] = useState(false);
    const [isSave, setIsSave] = useState(false);

    const { register, handleSubmit, formState: { errors }, getValues, setValue, watch } = useForm({ //getValues: obtiene los valores de FORMDATA, setValue: Cambia el valor dentro del form
        defaultValues: product // para cargar valores por defecto que son iguales al producto
    })

    useEffect(() => {
        const subscription = watch((value, { name, type }) => {//wath> sirve para mirar en tiempo real los cambios del useForm
            console.log({ value, name, type })
            if (name === 'title') {
                const newSlug = value.title?.trim()
                    .replaceAll(' ', '_')
                    .replaceAll("'", '')
                    .toLocaleLowerCase() || ''

                setValue('slug', newSlug)
            }
        });

        return subscription.unsubscribe // para destruir el observabel del watch
    }, [watch, setValue])


    const onChangeSize = (size: ISize) => {
        const currentSizes = getValues('sizes');
        console.log(currentSizes);
        if (currentSizes.includes(size)) {
            return setValue('sizes', currentSizes.filter(s => s !== size), { shouldValidate: true })
        }
        setValue('sizes', [...currentSizes, size], { shouldValidate: true })
    }

    const onNewTag = () => {
        const newTag = newTagValue.trim().toLocaleLowerCase();
        setNewTagValue(' ');
        const currentTags = getValues('tags');
        if (currentTags.includes(newTag)) {
            return;
        }
        currentTags.push(newTag);
    }

    const onDeleteTag = (tag: string) => {
        const updatedTags = getValues('tags');
        if (updatedTags.includes(tag)) {
            return setValue('tags', updatedTags.filter(s => s !== tag), { shouldValidate: true })
        }
    }

    const onFilesSelected = async ({ target }: ChangeEvent<HTMLInputElement>) => {

        if (!target.files || target.files.length === 0) {
            return;
        }
        try {
            for (const file of target.files) {
                const formData = new FormData();
                formData.append('file', file);
                const { data } = await oasisApi.post<{ message: string }>('/admin/upload', formData);
                setValue('images', [...getValues('images'), data.message], { shouldValidate: true })
            }
        } catch (error) {
            console.log({ error })
        }
    }

    const onDeleteImage = (image: string) => {
        setValue(
            'images',
            getValues('images').filter(img => img !== image),
            { shouldValidate: true }
        )
    }

    const onSubmit = async (form: FormData) => {
        console.log(form)
        if (form.images.length < 2) return alert('Minimo 2 imagenes')
        setIsSaving(true);
        try {
            const { data } = await oasisApi({
                url: '/admin/products',
                method: form._id ? 'PUT' : 'POST', //si tenemos un _id, entonces actualizar, si no crear
                data: form
            });

            console.log({ data });

            if (!form._id) {
                // Entra cuando es un nuevo producto, ya que los nuevos productos no tienen un ID asignado, que se le elimina desde el back
                router.replace('/admin/products')
                setIsSave(true);

            } else {
                setIsSaving(false);
                setIsSave(true);
            }
        } catch (error) {
            console.log(error);
            setIsSaving(false);
            setIsSave(false);

        }


    }

    return (
        <AdminLayout
            title={'Producto'}
            subTitle={`Editando: ${product.title}`}
            icon={<DriveFileRenameOutline />}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box display='flex' justifyContent='end' sx={{ mb: 1 }}>
                    <Button
                        color="secondary"
                        startIcon={<SaveOutlined />}
                        sx={{ width: '150px' }}
                        type="submit"
                        disabled={isSaving}
                    >
                        Guardar
                    </Button>
                    {
                        isSave && (
                            <TaskAltOutlined color='success' fontSize='large' />
                        )
                    }
                </Box>

                <Grid container spacing={2}>
                    {/* Data */}
                    <Grid item xs={12} sm={6}>

                        <TextField
                            label="Título"
                            variant="filled"
                            fullWidth
                            sx={{ mb: 1 }}
                            {...register('title', {
                                required: 'Este campo es requerido',
                                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                            })}
                            error={!!errors.title}
                            helperText={errors.title?.message}
                        />

                        <TextField
                            label="Descripción"
                            variant="filled"
                            fullWidth
                            multiline
                            sx={{ mb: 1 }}
                            {...register('description', {
                                required: 'Este campo es requerido',
                                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                            }
                            )}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                        />

                        <TextField
                            label="Inventario"
                            type='number'
                            variant="filled"
                            fullWidth
                            sx={{ mb: 1 }}
                            {...register('inStock', {
                                required: 'Este campo es requerido',
                                minLength: { value: 0, message: 'Mínimo de valor 0' }
                            })}
                            error={!!errors.inStock}
                            helperText={errors.inStock?.message}
                        />

                        <TextField
                            label="Precio"
                            type='number'
                            variant="filled"
                            fullWidth
                            sx={{ mb: 1 }}
                            {...register('price', {
                                required: 'Este campo es requerido',
                                minLength: { value: 0, message: 'Mínimo de valor a 0' }
                            })}
                            error={!!errors.price}
                            helperText={errors.price?.message}
                        />

                        <Divider sx={{ my: 1 }} />

                        <FormControl sx={{ mb: 1 }}>
                            <FormLabel>Tipo</FormLabel>
                            <RadioGroup
                                row
                                value={getValues('type')}
                                onChange={({ target }: any) => setValue('type', target.value, { shouldValidate: true })}
                            >
                                {
                                    validTypes.map(option => (
                                        <FormControlLabel
                                            key={option}
                                            value={option}
                                            control={<Radio color='secondary' />}
                                            label={capitalize(option)}
                                        />
                                    ))
                                }
                            </RadioGroup>
                        </FormControl>

                        <FormControl sx={{ mb: 1 }}>
                            <FormLabel>Género</FormLabel>
                            <RadioGroup
                                row
                                value={getValues('gender')}
                                onChange={({ target }: any) => setValue('gender', target.value, { shouldValidate: true })}
                            >
                                {
                                    validGender.map(option => (
                                        <FormControlLabel
                                            key={option}
                                            value={option}
                                            control={<Radio color='secondary' />}
                                            label={capitalize(option)}
                                        />
                                    ))
                                }
                            </RadioGroup>
                        </FormControl>

                        <FormGroup>
                            <FormLabel>Tallas</FormLabel>
                            {
                                validSizes.map((size) => (
                                    <FormControlLabel
                                        key={size}
                                        control={<Checkbox checked={getValues('sizes').includes(size)} />}
                                        label={size}
                                        onChange={() => onChangeSize(size)}
                                    />
                                ))
                            }
                        </FormGroup>

                    </Grid>

                    {/* Tags e imagenes */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Slug - URL"
                            variant="filled"
                            fullWidth
                            sx={{ mb: 1 }}
                            {...register('slug', {
                                required: 'Este campo es requerido',
                                validate: (val) => val.trim().includes(' ') ? 'No se puede tener espacios en blanco' : undefined
                            })}
                            error={!!errors.slug}
                            helperText={errors.slug?.message}
                        />

                        <TextField
                            label="Etiquetas"
                            variant="filled"
                            fullWidth
                            sx={{ mb: 1 }}
                            helperText="Presiona [spacebar] para agregar"
                            value={newTagValue}
                            onChange={(e) => setNewTagValue(e.target.value)}
                            onKeyUp={({ code }) => code === 'Space' ? onNewTag() : undefined}
                        />

                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            listStyle: 'none',
                            p: 0,
                            m: 0,
                        }}
                            component="ul">
                            {
                                getValues('tags').map((tag) => {

                                    return (
                                        <Chip
                                            key={tag}
                                            label={tag}
                                            onDelete={() => onDeleteTag(tag)}
                                            color="primary"
                                            size='small'
                                            sx={{ ml: 1, mt: 1 }}
                                        />
                                    );
                                })}
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box display='flex' flexDirection="column">
                            <FormLabel sx={{ mb: 1 }}>Imágenes</FormLabel>
                            <Button
                                color="secondary"
                                fullWidth
                                startIcon={<UploadOutlined />}
                                sx={{ mb: 3 }}
                                onClick={() => fileInputRef.current?.click()}// esto lo que hace es simular un click, pero lo hacemos con useRef, ya que este no renderiza cuando inicia la pagina, solo cuando se ejecuta el hook
                            >
                                Cargar imagen
                            </Button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept='image/png, image/jpg, image/jpeg, image/gif'
                                style={{ display: 'none' }}
                                onChange={onFilesSelected}
                            />
                            <Chip
                                label="Es necesario al 2 imagenes"
                                color='error'
                                variant='outlined'
                                sx={{ display: getValues('images').length < 2 ? 'flex' : 'none' }}
                            />

                            <Grid container spacing={2}>
                                {
                                    getValues('images').map(img => (
                                        <Grid item xs={4} sm={3} key={img}>
                                            <Card>
                                                <CardMedia
                                                    component='img'
                                                    className='fadeIn'
                                                    image={img}
                                                    alt={img}
                                                />
                                                <CardActions>
                                                    <Button fullWidth color="error"
                                                        onClick={() => onDeleteImage(img)}
                                                    >
                                                        Borrar
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))
                                }
                            </Grid>

                        </Box>

                    </Grid>

                </Grid>
            </form>
        </AdminLayout >
    )
}

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time


export const getServerSideProps: GetServerSideProps = async ({ query }) => {

    const { slug = '' } = query;

    let product: IProduct | null;

    if (slug === 'new') {
        //crear producto
        const tempProduct = JSON.parse(JSON.stringify(new Product()))// ya que al crearme un nuevo objeto ya crea sus valores por defecto
        delete tempProduct._id;
        tempProduct.images = ['1657914-00-A_0_2000.jpg', '1657931-00-A_0_2000.jpg'];
        console.log(tempProduct)
        product = tempProduct;

    } else {
        product = await dbProducts.getProductBySlug(slug.toString());
    }


    if (!product) {
        return {
            redirect: {
                destination: '/admin/products',
                permanent: false,
            }
        }
    }


    return {
        props: {
            product
        }
    }
}


export default ProductAdminPage