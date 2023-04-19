import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../database'
import { IProduct } from '../../../interfaces'
import { Product } from '../../../models'
import { isValidObjectId } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config(process.env.CLOUDINARY_URL || '');// esto es que solo nosotros podamos subir imagenes, y cualquier persona




type Data =
    | { message: string }
    | IProduct[]
    | IProduct

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'GET':
            return getProduct(req, res);
        case 'PUT':
            return updateProduct(req, res);
        case 'POST':
            return createProduct(req, res);
        default:
            res.status(400).json({ message: 'Bad Request | 400' })
    }

}

const getProduct = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    await db.connect();
    const products = await Product.find()
        .sort({ title: 'asc' })
        .lean();
    await db.disconnect();
    //Tendremos que actualizar las imagenes
    const updatedProducts = products.map(product => {
        //procesamiento de las imagenes cuando las subamos al server y cuando sea de cloudinary
        product.images = product.images.map(img => {
            return img.includes('http') ? img : `${process.env.HOST_NAME}products/${img}`
        })

        return product;
    })
    res.status(200).json(updatedProducts)


}
const updateProduct = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { _id = '', images = [] } = req.body as IProduct;
    if (!isValidObjectId(_id)) {
        return res.status(400).json({ message: 'El id del producto no es valido' });
    }

    if (images.length < 2) {
        return res.status(400).json({ message: 'Es necesario al menos 2 imagenes' });
    }

    //TODO: prosiblemente tendremos un localhost:3000/products/asadasd.jpg


    try {
        await db.connect();
        const product = await Product.findById(_id);
        if (!product) {
            await db.disconnect();
            return res.status(400).json({ message: "No existe un producto con ese ID" });
        }
        //Eliminar fotos o imagenes en Cloudinary
        product.images.forEach(async (image) => {
            if (!images.includes(image)) {
                //Borrar de cloudinary
                //tengo esto como image https://res.cloudinary.com/broccoshop/image/upload/v1681938873/lukkocg1wtghhggibmkz.webp"
                console.log(images)
                const [fileId, extension] = image.substring(image.lastIndexOf('/') + 1).split('.') //as[i me queda[lukkocg1wtghhggibmkz,webp];
                console.log({ image, fileId, extension })
                // conexion para borrar
                await cloudinary.uploader.destroy(fileId);
            }
        })


        await product.update(req.body);

        await db.disconnect();
        return res.status(200).json(product);

    } catch (error) {
        console.log(error)
        await db.disconnect();
        return res.status(400).json({ message: 'Revisar la consola del servidor' })
    }

}

const createProduct = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const { images } = req.body as IProduct;

    if (images.length < 2) {
        return res.status(400).json({ message: 'El producto necesita al menos dos imagenes' })
    }

    //TODO: prosiblemente tendremos un localhost:3000/products/asadasd.jpg



    try {
        await db.connect()

        const productInDB = await Product.findOne({ slug: req.body.slug })

        if (productInDB) {
            await db.disconnect()
            return res.status(400).json({ message: 'Ya existe un producto con ese slug' })
        }

        const product = new Product(req.body)
        await product.save()

        await db.disconnect()

        res.status(200).json(product)

    } catch (error) {
        console.log(error)
        await db.disconnect()
        return res.status(400).json({ message: 'Revisar los logs del servidor' })
    }



}



