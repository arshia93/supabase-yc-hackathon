const { createClient } = require('@supabase/supabase-js')

const localSupabaseUrl = 'http://localhost:54321'
const localSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(process.env.SUPABASE_URL || localSupabaseUrl, process.env.SUPABASE_ANON_KEY || localSupabaseAnonKey)

async function main() {
    const { data, error } = await supabase.functions.invoke('parse-url', {
        body: { url: 'https://www.google.com' },
    });

    console.log(data)
    console.log(error)
}

main().catch(console.error);