import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';


export async function middleware(req: NextRequest) {

    const session: any = await getToken({ req });

    if (!session) {
        const requestedPage = req.page.name;
        return NextResponse.redirect(`auth/login?p=${requestedPage}`);
    }

    const validRoles = ['admin', 'super-user', 'SEO'];

    if (!validRoles.includes(session.user.role)) {
        return NextResponse.redirect('/');
    }

    return NextResponse.next();
}
