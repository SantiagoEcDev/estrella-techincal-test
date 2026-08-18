import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/utils/amplifyServerUtils";

const protectedRoutes = ["/dashboard"];

const authRoutes = ["/"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;


  const isAuthRoute = authRoutes.includes(pathname);

  if (!protectedRoutes.includes(pathname) && !isAuthRoute) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  const authenticated = await runWithAmplifyServerContext({
    nextServerContext: {
      request,
      response,
    },
    operation: async (contextSpec) => {
      const { tokens } = await fetchAuthSession(contextSpec);

      return !!tokens?.accessToken;
    },
  });
  console.log({
    pathname,
    authenticated,
  });

  if (protectedRoutes.includes(pathname) && !authenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAuthRoute && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
