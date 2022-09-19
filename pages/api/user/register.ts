import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../database';
import { User } from '../../../models';
import async from '../seed';
import bcrypt from 'bcryptjs';
import { RotateLeft } from '@mui/icons-material';
import { jwt, validations } from '../../../utils';

type Data =
    | { message: string; }
    | {
        token: string,
        user: {
            email: string,
            role: string,
            name: string,
        }
    }

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'POST':
            return registerUser(req, res);

        default:
            return res.status(400).json({ message: 'Bad request | 400' })
    }

}

const registerUser = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const { email = '', password = '', name = '' } = req.body// que si no llega van a hacer vacios

    if (password.length < 6) {
        return res.status(400).json({ message: 'La contraseña debe ser mayor a 6 caracteres - PASSWORD' });
    }

    if (name.length < 3) {
        return res.status(400).json({ message: 'El nombre debe ser mayor de 3 caracteres - NAME' });
    }

    if (!validations.isValidEmail(email)) {
        return res.status(400).json({ message: 'El correo no es valido para nosotros - EMAIL' });
    }

    await db.connect();
    const user = await User.findOne({ email });

    if (user) {
        return res.status(400).json({ message: 'El usuario ya ha sido creado - No puede usar ese email' })
    }

    const newUser = new User({
        email: email.toLocaleLowerCase(),
        password: bcrypt.hashSync(password),
        role: 'client',
        name,
    })

    try {
        await newUser.save({ validateBeforeSave: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Revisar logs del servidor' })
    }

    const { _id, role } = newUser;

    const token = jwt.signToken(_id, email);

    return res.status(200).json({
        token, //jwt
        user: { email, role, name }
    })

}

