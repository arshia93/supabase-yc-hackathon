const { createClient } = require('@supabase/supabase-js')


require('dotenv').config()

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

async function main() {
    const { data } = await supabase.functions.invoke('parse-url', {
        body: { url: 'https://reactiverobot.com' },
    });

    console.log(data.trackingMeta)
}

main().catch(console.error);