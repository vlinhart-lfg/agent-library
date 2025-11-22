'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SiteHeader } from '@/components/site-header'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setMessage({ text: error.message, type: 'error' })
            setLoading(false)
        } else {
            router.push('/')
            router.refresh()
        }
    }

    const handleSignUp = async () => {
        setLoading(true)
        setMessage(null)

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        })

        if (error) {
            setMessage({ text: error.message, type: 'error' })
        } else {
            setMessage({ text: 'Check your email for the confirmation link.', type: 'success' })
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            <SiteHeader />
            <div className="container flex items-center justify-center min-h-[calc(100vh-80px)]">
                <div className="w-full max-w-md space-y-8 p-8 border rounded-xl shadow-sm bg-card">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Welcome back</h2>
                        <p className="text-muted-foreground mt-2">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">Password</label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {message && (
                            <div className={`p-3 rounded text-sm ${message.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" className="flex-1 bg-gradient-to-r from-[#6E2CF4] to-[#FF3D68] text-white hover:opacity-90" disabled={loading}>
                                {loading ? 'Loading...' : 'Sign In'}
                            </Button>
                            <Button type="button" variant="outline" className="flex-1" onClick={handleSignUp} disabled={loading}>
                                Sign Up
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
