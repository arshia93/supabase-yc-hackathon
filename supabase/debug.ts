const { createClient } = require('@supabase/supabase-js')


require('dotenv').config()

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

async function main() {
    const { data, error } = await supabase.functions.invoke('parse-url', {
        body: { url: 'https://www.google.com' },
    });

    console.log(data)
    console.log(error)
}

main().catch(console.error);