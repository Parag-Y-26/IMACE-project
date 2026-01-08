"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/user-context";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

// Routes that don't require authentication
const publicRoutes = ["/login"];
// Routes that don't require onboarding
const preOnboardingRoutes = ["/login", "/onboarding"];

export function AuthGuard({ children }: AuthGuardProps) {
  const { userState, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = publicRoutes.includes(pathname);
    const isPreOnboardingRoute = preOnboardingRoutes.includes(pathname);

    // Not logged in - redirect to login (unless already on login page)
    if (!userState.auth.isLoggedIn && !isPublicRoute) {
      router.push("/login");
      return;
    }

    // Logged in but not onboarded - redirect to onboarding
    if (
      userState.auth.isLoggedIn &&
      !userState.auth.isOnboarded &&
      !isPreOnboardingRoute
    ) {
      router.push("/onboarding");
      return;
    }

    // Already logged in and onboarded - redirect away from login/onboarding
    if (
      userState.auth.isLoggedIn &&
      userState.auth.isOnboarded &&
      isPreOnboardingRoute
    ) {
      router.push("/");
      return;
    }
  }, [userState, isLoading, pathname, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-cyan-400/20" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" />
          </div>
          <p className="text-gray-400 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if redirecting
  const isPublicRoute = publicRoutes.includes(pathname);
  const isPreOnboardingRoute = preOnboardingRoutes.includes(pathname);

  if (!userState.auth.isLoggedIn && !isPublicRoute) {
    return null;
  }

  if (
    userState.auth.isLoggedIn &&
    !userState.auth.isOnboarded &&
    !isPreOnboardingRoute
  ) {
    return null;
  }

  if (
    userState.auth.isLoggedIn &&
    userState.auth.isOnboarded &&
    isPreOnboardingRoute
  ) {
    return null;
  }

  return <>{children}</>;
}
