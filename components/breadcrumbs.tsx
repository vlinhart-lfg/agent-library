import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
    label: string
    href: string
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="flex items-center text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-900 transition-colors">
                Home
            </Link>
            {items.map((item, index) => (
                <div key={item.href} className="flex items-center">
                    <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
                    {index === items.length - 1 ? (
                        <span className="font-medium text-gray-900">{item.label}</span>
                    ) : (
                        <Link href={item.href} className="hover:text-gray-900 transition-colors">
                            {item.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    )
}
