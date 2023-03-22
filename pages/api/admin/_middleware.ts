import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {

    const session: any = await getToken({ req });

    if (!session) {
        return new Response(JSON.stringify({ message: 'No autorizado para ver info' }), {
            status: 401,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    const validRoles = ['admin', 'super-user', 'SEO'];

    if (!validRoles.includes(session.user.role)) {
        return new Response(JSON.stringify({ message: 'No autorizado para ver info' }), {
            status: 401,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    return NextResponse.next();
}
