'use server'

import { generateText, Output } from "ai"
import { z } from 'zod';
import { assertAdminAccess } from "@/server/authz"
import { getAiLanguageModel } from "@/lib/ai/client"

const newsletterSchema = z.object({
  subject: z.string().describe("A catchy title, maximum 4 words"),
  introMessage: z.string().describe("A short and friendly introduction message"),
  features: z.array(z.string()).describe("A list of key technical points"),
})

export type NewsletterContent = z.infer<typeof newsletterSchema>

interface GenerateNewsletterProps {
  youtubeUrl?: string
  description: string
}

export async function generateNewsletterContent({ description }: GenerateNewsletterProps) {
  await assertAdminAccess()
  try {
    const { output } = await generateText({
      model: getAiLanguageModel("editor"),
      output: Output.object({ schema: newsletterSchema }),
      prompt: `Hello, you will write the technical newsletter for Qunt Edge about our latest update: ${description}.

Qunt Edge is a web platform for futures day traders, with an intuitive and customizable interface. Built from personal experience as a futures day trader using scalping strategies, it offers features like multi-account management, prop firm challenge tracking, and customizable dashboards. Our goal is to provide traders with deep analytics on their trading habits to optimize strategies and improve decision-making.

Here are the instructions for the newsletter:

1. The subject should be short, 2 to 4 words, catchy and minimalist, with a modern and direct tone. For example, "Qunt Edge - Update".

2. The introduction should be two short sentences, friendly and professional, introducing the new feature and encouraging readers to watch the video. No greetings needed.

3. For features, up to three points based on ${description}, each point starting with a relevant emoji, followed by an accessible technical description and a concrete benefit for the day trader.

General instructions:

- Be factual and precise.

- Do not extrapolate beyond ${description}.

- Tone: professional but approachable.

- Use direct address ("you").

- Short and direct sentences.

- Terminology specific to futures trading.

Please follow these instructions.`,
      temperature: 0.7,
    })

    return {
      success: true,
      content: output
    }
  } catch (error) {
    console.error("Error generating newsletter content:", error)
    return {
      success: false,
      error: "Failed to generate newsletter content"
    }
  }
}
