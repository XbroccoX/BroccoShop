import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable';

import { v2 as cloudinary } from 'cloudinary'
cloudinary.config(process.env.CLOUDINARY_URL || '');// esto es que solo nosotros podamos subir imagenes, y cualquier persona


type formData = {
    message: string
}

export const config = {
    api: {
        bodyParser: false,
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse<formData>) {
    switch (req.method) {
        case 'POST':
            return uploadFile(req, res)

        default:
            return res.status(400).json({ message: 'Bad Request | 400' })
    }
}

const saveFile = async (file: formidable.File): Promise<string> => {
    // const data = fs.readFileSync(file.filepath);
    // fs.writeFileSync(`./public/${file.originalFilename}`, data);
    // fs.unlinkSync(file.filepath);//elimina
    // return;
    const { secure_url } = await cloudinary.uploader.upload(file.filepath);
    console.log(secure_url)
    return secure_url
}

const parseFiles = async (req: NextApiRequest): Promise<string> => {
    return new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {

            if (err) {
                return reject(err);
            }

            const filePath = await saveFile(files.file as formidable.File)
            resolve(filePath);

        })
    })
}

const uploadFile = async (req: NextApiRequest, res: NextApiResponse<formData>) => {
    const imageUrl = await parseFiles(req)

    return res.status(200).json({ message: imageUrl })
}
