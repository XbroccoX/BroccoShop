import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
// import * as jose from 'jose';

export async function middleware(req: NextRequest) {

    const session = await getToken({ req });

    if (!session) {
        const { protocol, host, pathname } = req.nextUrl;
        return NextResponse.redirect(`${protocol}//${host}/auth/login?p=${pathname}`);
    }

    return NextResponse.next();
}

// Only the paths declared in here will run the middleware
export const config = {
    matcher: ['/checkout/:path*']
};


/* if (!session) {
    const redirectedPage = req.page.name
    return NextResponse.redirect(`/auth/login?p=${redirectedPage}`)
}

return NextResponse.next(); */


    // const { token = '' } = req.cookies;

    // try {
    //     await jwt.isValidToken(token);
    //     return NextResponse.next();

    // } catch (error) {
    //     const redirectedPage = req.page.name
    //     return NextResponse.redirect(`/auth/login?p=${redirectedPage}`)
    // }
