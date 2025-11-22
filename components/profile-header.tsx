import { User } from '@supabase/supabase-js'

interface ProfileHeaderProps {
    user: User
    submissionCount: number
}

export function ProfileHeader({ user, submissionCount }: ProfileHeaderProps) {
    const initials = user.email?.[0].toUpperCase() || '?'
    const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    })

    return (
        <div className="bg-card border rounded-xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                {initials}
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
                <h1 className="text-2xl font-bold">{user.email}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <span>Member since {memberSince}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg min-w-[120px]">
                <span className="text-3xl font-bold text-primary">{submissionCount}</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Submissions</span>
            </div>
        </div>
    )
}
