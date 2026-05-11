import { checkEnvironment } from './util'
import Anthropic from '@anthropic-ai/sdk'

const anthropicAi = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  dangerouslyAllowBrowser: true
})

const msg = await anthropicAi.messages.create({
  model: process.env.AI_MODEL!,
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content:
        'What is the best mothers days gift for someone who is out of town? Respond using 100 words or less.'
    }
  ]
})

checkEnvironment()

if (msg.content[0].type === 'text') {
  console.log(msg.content[0].text)
}
