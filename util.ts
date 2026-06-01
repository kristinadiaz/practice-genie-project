export function autoResizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
};

export function setLoading(isLoading: boolean) {
  const lampButton = document.getElementById('lamp-button') as HTMLButtonElement;
  const lampText = document.querySelector('.lamp-text');
  const userInput = document.getElementById('user-input') as HTMLTextAreaElement;
  const outputContainer = document.getElementById('output-container');

  lampButton.disabled = isLoading;

  if(isLoading) {
    userInput.style.height = 'auto';
    outputContainer?.classList.add('hidden');
    outputContainer?.classList.remove('visible');

    lampButton.classList.remove('compact');
    lampButton.classList.add('loading');
    if(lampText) lampText.textContent = 'Summoning Gift Ideas...';
  } else {
    outputContainer?.classList.remove('hidden');
    outputContainer?.classList.add('visible');

    lampButton.classList.remove('loading');
    lampButton.classList.add('compact');
    if(lampText) lampText.textContent = 'Rub the Lamp';
  }
}

export function checkEnvironment() {
  if(!process.env.AI_MODEL) {
    throw new Error('Missing AI_MODEL. The AI request needs a model name.');
  }

  if(!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY. Your API key is not being picked up.')
  }

  console.log('AI model:', process.env.AI_MODEL);
};