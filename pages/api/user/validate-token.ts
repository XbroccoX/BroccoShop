import type { NextApiRequest, NextApiResponse } from 'next'
import { User } from '../../../models';
import { jwt } from '../../../utils';
import { db } from '../../../database';

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
        case 'GET':
            return checkJWT(req, res);

        default:
            return res.status(400).json({ message: 'Bad request | 400' })
    }

}

const checkJWT = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    const { token = '' } = req.cookies;

    let userId = '';

    try {

        userId = await jwt.isValidToken(token);

    } catch (error) {
        return res.status(400).json({ message: 'Token de autorizacion no es valido' });
    }

    await db.connect();
    const user = await User.findById(userId).lean();
    await db.disconnect();

    if (!user) {
        return res.status(400).json({ message: 'El id del usuario no es valido' });
    }

    const { _id, email, name, role } = user;

    return res.status(200).json({
        token: jwt.signToken(_id, email),
        user: { email, name, role }
    })


}

