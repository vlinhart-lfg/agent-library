"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SiteHeaderProps {
    variant?: "transparent" | "solid"
    searchQuery?: string
    setSearchQuery?: (query: string) => void
    showSearch?: boolean
}

export function SiteHeader({
    variant = "transparent",
    searchQuery = "",
    setSearchQuery,
    showSearch = true
}: SiteHeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false)
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
        if (variant === "solid") {
            setIsScrolled(true)
            return
        }

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 450)
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [variant])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        window.location.reload()
    }

    const isSolid = variant === "solid" || isScrolled

    return (
        <div className={`sticky top-4 z-50 px-6 pt-4 ${variant === 'solid' ? 'mb-8' : ''}`}>
            <header className={`rounded-xl border shadow-xl transition-all duration-300 ${isSolid
                ? "bg-gray-100 border-gray-300"
                : "bg-[#23282C] border-gray-700/50"
                }`}>
                <div className="px-6 py-3 shadow-none">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-3">
                                <Image
                                    src="/make-logo.svg"
                                    alt="Make.com"
                                    width={40}
                                    height={40}
                                    className="rounded-lg"
                                />
                                <span className={`font-semibold text-lg transition-colors duration-300 ${isSolid ? "text-gray-900" : "text-white"
                                    }`}>
                                    Agent library
                                </span>
                            </Link>

                            {showSearch && isSolid && setSearchQuery && (
                                <div className="relative w-[400px]">
                                    <input
                                        type="text"
                                        placeholder="Search for a template"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-4 pr-10 py-2 bg-gray-200 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                    />
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                                </div>
                            )}

                            <nav className="flex items-center gap-6">
                                {/* Add nav items here if needed */}
                            </nav>
                        </div>
                        <div className="flex items-center gap-6">
                            <button className={`text-sm font-medium transition-colors duration-300 ${isSolid
                                ? "text-gray-900 hover:text-gray-600"
                                : "text-white hover:text-gray-300"
                                }`}>
                                Why submit?
                            </button>

                            {user ? (
                                <>
                                    <Link href="/submit">
                                        <button className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-600/30">
                                            Submit
                                        </button>
                                    </Link>
                                    <div className="flex items-center gap-3">
                                        <Link href="/profile">
                                            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold hover:bg-purple-700 transition-colors cursor-pointer">
                                                {user.email?.[0].toUpperCase()}
                                            </div>
                                        </Link>
                                        <button
                                            onClick={handleSignOut}
                                            className={`text-sm font-medium transition-colors duration-300 ${isSolid ? "text-gray-600 hover:text-gray-900" : "text-gray-300 hover:text-white"}`}
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <Link href="/login?next=/submit">
                                    <button className="bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-600/30">
                                        Submit
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </div>
    )
}
