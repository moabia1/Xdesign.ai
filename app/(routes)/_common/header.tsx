"use client"

import Logo from "@/components/logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SignedIn, SignIn, UserButton, useUser } from "@clerk/nextjs"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"


const Header = () => {

  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  const {user} = useUser()

  return (
    <div className="sticky top-0 right-0 left-0 z-30">
      <header className="h-16 border-b bg-background py-4">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
          <Logo />

          <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
            <Link href="/" className="text-foreground-muted text-sm">
              Home
            </Link>
            <Link href="/" className="text-foreground-muted text-sm">
              Pricing
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-end gap-3">
            <Button
              className="relative rounded-full h-8 w-8"
              variant={"outline"}
              size={"icon"}
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              <SunIcon
                className={cn(
                  "absolute h-5 w-5 transition",
                  isDark ? "scale-100" : "scale-0",
                )}
              />
              <MoonIcon
                className={cn(
                  "absolute h-5 w-5 transition",
                  isDark ? "scale-0" : "scale-100",
                )}
              />
            </Button>
            {user ? <SignedIn>
              <UserButton />
            </SignedIn> : <Button><Link href="/sign-up">Sign In</Link></Button>}
            
          </div>
        </div>
      </header>
    </div>
  );
}

export default Header