import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "warranty_tracker_session";

function getAuthSecret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "warranty-tracker-dev-secret");
}

async function isAuthenticated(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  try {
    await jwtVerify(token, getAuthSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = await isAuthenticated(request);
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (!authenticated && !isAuthPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (authenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/items/:path*",
    "/profile",
    "/pro/:path*",
    "/login",
    "/register"
  ]
};
