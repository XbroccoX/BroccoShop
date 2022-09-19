import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../database';
import { User } from '../../../models';
import async from '../seed';
import bcrypt from 'bcryptjs';
import { RotateLeft } from '@mui/icons-material';
import { jwt } from '../../../utils';

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
            return loginUser(req, res);

        default:
            return res.status(400).json({ message: 'Bad request | 400' })
    }

}

const loginUser = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const { email = '', password = '' } = req.body; // que si no llega van a hacer vacios

    await db.connect();
    const user = await User.findOne({ email });
    await db.disconnect();

    if (!user) {
        return res.status(400).json({ message: 'email o password not valid - EMAIL' });
    }

    if (!bcrypt.compareSync(password, user.password!)) {
        return res.status(400).json({ message: 'email o password not valid - PASSWORD' });
    }

    const { role, name, _id } = user;

    const token = jwt.signToken(_id, email);

    return res.status(200).json({
        token, //jwt
        user: { email, role, name }
    })

}

