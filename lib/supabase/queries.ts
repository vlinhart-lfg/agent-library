import { SupabaseClient } from '@supabase/supabase-js'

export async function getUserTemplates(supabase: SupabaseClient, userId: string) {
    const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching user templates:', error)
        return []
    }

    return data
}
