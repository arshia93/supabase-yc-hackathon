'use server'

import { z } from 'zod'

const crawlSchema = z.object({
  url: z.string().url().startsWith('http')
})

export async function crawlWebsite(formData: FormData) {
  const validatedFields = crawlSchema.safeParse({
    url: formData.get('url')
  })

  if (!validatedFields.success) {
    return { error: 'Invalid URL. Please enter a valid URL starting with http:// or https://' }
  }

  const { url } = validatedFields.data

  // Simulate crawling process
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Simulate setup process
  const setupSteps = [
    'Analyzing website structure...',
    'Identifying key pages...',
    'Setting up event tracking...',
    'Configuring conversion funnels...',
    'Finalizing analytics integration...'
  ]

  const results = setupSteps.map(step => ({
    step,
    status: Math.random() > 0.2 ? 'success' : 'warning'
  }))

  return { 
    success: true, 
    message: 'Website crawled and analytics setup complete', 
    results,
    analyticsCode: `
<!-- Product Analytics Code -->
<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-XXXXXXX');
</script>
<!-- End Product Analytics Code -->
    `
  }
}

