import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/utils/amplifyServerUtils";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

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

  if (pathname !== "/" && !authenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname === "/" && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
