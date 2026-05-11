export function checkEnvironment() {
  if(!process.env.AI_MODEL) {
    throw new Error('Missing AI_MODEL. The AI request needs a model name.');
  }

  if(!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY. Your API key is not being picked up.')
  }

  console.log('AI model:', process.env.AI_MODEL);
};