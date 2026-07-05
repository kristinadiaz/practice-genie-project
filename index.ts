import Anthropic from '@anthropic-ai/sdk'
import { checkEnvironment, autoResizeTextarea, setLoading } from './util'
import { marked } from 'marked';
import DOMPurify from 'dompurify';

checkEnvironment();

const anthropicAi = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  dangerouslyAllowBrowser: true
});

// Get UI Elements
const giftForm = document.getElementById('gift-form') as HTMLFormElement;
const userInput = document.getElementById('user-input') as HTMLTextAreaElement;
const outputContent = document.getElementById('output-content');

// System prompt lives here - not in the messages array
const systemPrompt = `You are the Gift Genie!
The user will describe the gift's recipient, and may also mention
situational details like location, budget, timing, or shipping
constraints (e.g. "lives abroad", "needs it by Friday", "no online shopping",
"small apartment").

You have access to a web search tool. Use it when a suggestion would
benefit from current, real-world information - things like specific
product availability, current pricing, store locations, or seasonal
trends. Don't search for well-known, timeless gift ideas that don't
need verification.

If any such constraint is mentioned, let it shape both which gifts
you suggest and how you tell the user to get them.

Format your response in Markdown using this exact structure:

## [Gift Name]
A one-sentence explanation of why this gift works for the recipient.
How to get it: a short note on where/how to obtain it given any stated
constraints. If you searched the web for this, name the actual store,
product, or price you found instead of a generic suggestion.

(Repeat for each gift suggestion.)

## Questions for you
- A short follow-up question that would help you refine future suggestions.
- (2-3 questions max)

Rules:
- Suggest 3-5 gifts.
- Each explanation must be one sentence, focused on the recipient's stated interests or needs.
- Skip intros and conclusions - go straight into the first heading.
- Your entire response must be under 150 words.
`;

const messages: Anthropic.MessageParam[] = [
  {
    role: 'user',
    content: 'My sister loves baking and has a small kitchen with limited counter space.',
  },
  {
    role: 'assistant',
    content: `## Compact Stand Mixer
A space-saving stand mixer built for tight kitchens, perfect for her baking hobby.
How to get it: Look for compact models at Target or Bed Bath & Beyond, or order online with 2-day shipping.

## Silicone Baking Mat Set
Reusable mats reduce clutter and store flat, ideal for a small counter.
How to get it: Available at most kitchen supply stores or on Amazon for quick delivery.

## Gift Card to a Baking Class
Lets her learn new techniques without needing more kitchen equipment.
How to get it: Check local cooking studios or sites like ClassBento for a digital gift card she can redeem anytime.

## Questions for you
1. What's your budget range for this gift?
2. Does she have any dietary preferences that might affect baking tools she'd use?`,
  },
  {
    role: 'user',
    content: 'My coworker is retiring next month and the whole team is chipping in, but we need it shipped to the office by Friday.',
  },
  {
    role: 'assistant',
    content: `## Personalized Retirement Plaque
A custom engraved plaque celebrating their career, perfect for a group gift.
How to get it: Order from sites like Shutterfly or Etsy with rush shipping to guarantee Friday delivery.

## Group Photo Book
A collection of team memories and messages that documents years of shared work.
How to get it: Use an online photo book service with expedited printing; most offer 2-3 day rush options.

## Gift Card Bundle
A flexible option letting them choose their own retirement treat.
How to get it: Purchase digital gift cards instantly online so there's no shipping delay to worry about.

## Questions for you
1. What's the total budget the team is pooling together?
2. Do you know if they have travel plans for retirement that a gift could support?`,
  },
];

const start = () => {
  userInput.addEventListener('input', () => autoResizeTextarea(userInput));
  giftForm.addEventListener('submit', handleGiftRequest);
}

const handleGiftRequest = async (e: SubmitEvent) => {
  e.preventDefault();

  const userPrompt = userInput.value.trim();
  if(!userPrompt) return;

  // Add user message to messages array
  messages.push({ role: 'user', content: userPrompt });

  setLoading(true);

  try {
    // Send the request with system prompt + full conversation history
    const stream = await anthropicAi.messages.create({
      model: process.env.AI_MODEL!,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 5,
        },
      ],
      stream: true,
    });

    // Reveal the output container so progressive updates are visible
    // (no showStream() helper here, so do it directly)
    const outputContainer = document.getElementById('output-container');
    outputContainer?.classList.remove('hidden');
    outputContainer?.classList.add('visible');

    let accumulatedText = '';
    
    for await (const event of stream) {
      if(event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        accumulatedText += event.delta.text;

        const rawHTML = await marked(accumulatedText);

        if(outputContent) {
          outputContent.innerHTML = DOMPurify.sanitize(rawHTML);
        }
      }
    }

    messages.push({ role: 'assistant', content: accumulatedText });
  } finally {
    setLoading(false);
  }
}

start();