import { RegisterForm } from "@/components/register-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground p-12 flex-col justify-between">
        <div>
          <Link href="/" className="text-2xl font-semibold tracking-tight">
            carzz
          </Link>
        </div>

        <div className="space-y-6 max-w-lg">
          <h1 className="text-5xl font-serif leading-tight text-balance">Start your journey with us today</h1>
          <p className="text-lg text-primary-foreground/80 leading-relaxed">
            Join thousands of users who trust our platform to transform their workflow and achieve their goals.
          </p>
        </div>

        <div className="text-sm text-primary-foreground/60">© 2025 carzz. All rights reserved.</div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">Create an account</h2>
            <p className="text-muted-foreground leading-relaxed">Enter your information below to get started</p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
