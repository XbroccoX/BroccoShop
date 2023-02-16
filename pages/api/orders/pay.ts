import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next'
import { IPaypal } from '../../../interfaces';
import { connect } from '../../../database/db';
import { db } from '../../../database';
import { Order } from '../../../models';

type Data = {
    message: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'POST':
            return payOrder(req, res);

        default:
            return res.status(400).json({ message: 'Bad Request - 400' })
    }

}

const getPaypalBearerToken = async (): Promise<string | null> => {
    const PAYPAL_CLIENT = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

    const base64token = Buffer.from(`${PAYPAL_CLIENT}:${PAYPAL_SECRET}`, 'utf-8').toString('base64');
    const body = new URLSearchParams('grant_type=client_credentials')

    try {
        const { data } = await axios.post(process.env.PAYPAL_OAUTH_URL || '', body, {
            headers: {
                'Authorization': `Basic ${base64token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        return data.access_token
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log(error.response?.data);
        } else {
            console.log(error)
        }
        return null
    }
}

const payOrder = async (req: NextApiRequest, res: NextApiResponse<Data>) => {

    //TODO: Validar session del usuario;
    //TODO: Validar MongoId

    const paypalBearerToken = await getPaypalBearerToken();

    if (!paypalBearerToken) {
        return res.status(400).json({ message: 'NO SE PUDO CONFIRMAR EL TOKEN DE PAYPAL' });
    }

    const { transactionId = '', orderId = '' } = req.body;

    const { data } = await axios.get<IPaypal.PayPalOrderStatusResponse>(`${process.env.PAYPAL_ORDERS_URL}/${transactionId}`, {
        headers: {
            'Authorization': `Bearer ${paypalBearerToken}`
        }
    })

    if (data.status !== 'COMPLETED') {
        return res.status(401).json({ message: 'Orden no reconocida' })
    }

    await db.connect();
    const dbOrder = await Order.findById(orderId);

    if (!dbOrder) {
        await db.disconnect();
        return res.status(400).json({ message: 'La orden no existe en nuestra base de datos' });
    }

    if (dbOrder.total !== Number(data.purchase_units[0].amount.value)) {
        await db.disconnect();
        return res.status(400).json({ message: 'El Monto de pago no es igual a el valor total de la orden' });
    }

    dbOrder.transactionId = transactionId;
    dbOrder.isPaid = true;
    await dbOrder.save();
    // TODO: Aqui se puede realizar un codigo para enviar correos a las personas encargadas de hacer el checking del producto. ya que el pago ha sido procesado.
    // TODO: Aqui se puede enviar el comprobante de pago al usuario correspondiente.

    await db.disconnect();

    return res.status(200).json({ message: 'La orden ha sido pagada con EXITO' });


}
