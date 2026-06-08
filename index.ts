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
Make your gift suggestions thoughtful and practical.
Your response must be under 100 words.
Skip intros and conclusions.
Only output gift suggestions.`;

const messages: Anthropic.MessageParam[] = [];

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
    const response = await anthropicAi.messages.create({
      model: process.env.AI_MODEL!,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    // Extract the assistant's response text
    const assistantText = response.content[0].type === 'text'
      ? response.content[0].text
      : '';
    
    // Store full content array in history for multi-turn context
    messages.push({ role: 'assistant', content: response.content });
    
    // Render it in #output-content
    if (outputContent) {
      const rawHTML = await marked(assistantText);
      outputContent.innerHTML = DOMPurify.sanitize(rawHTML);
    };
  } finally {
    setLoading(false);
  }
}

start();