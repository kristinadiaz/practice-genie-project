import { describe, it, expect, beforeEach, vi } from 'vitest';
import { autoResizeTextarea, setLoading, checkEnvironment } from './util';

// ─── DOM helpers ────────────────────────────────────────────────────────────

function buildDOM() {
  document.body.innerHTML = `
    <button id="lamp-button">
      <span class="lamp-text">Rub the Lamp</span>
    </button>
    <textarea id="user-input"></textarea>
    <div id="output-container" class="hidden"></div>
  `;
}

// ─── autoResizeTextarea ──────────────────────────────────────────────────────

describe('autoResizeTextarea', () => {
  it('resets height to auto then sets it to scrollHeight', () => {
    const textarea = document.createElement('textarea');
    Object.defineProperty(textarea, 'scrollHeight', { value: 120, configurable: true });

    autoResizeTextarea(textarea);

    expect(textarea.style.height).toBe('120px');
  });

  it('updates height when scrollHeight changes', () => {
    const textarea = document.createElement('textarea');

    Object.defineProperty(textarea, 'scrollHeight', { value: 80, configurable: true });
    autoResizeTextarea(textarea);
    expect(textarea.style.height).toBe('80px');

    Object.defineProperty(textarea, 'scrollHeight', { value: 160, configurable: true });
    autoResizeTextarea(textarea);
    expect(textarea.style.height).toBe('160px');
  });
});

// ─── setLoading ──────────────────────────────────────────────────────────────

describe('setLoading', () => {
  beforeEach(buildDOM);

  describe('when isLoading = true', () => {
    it('disables the lamp button', () => {
      setLoading(true);
      expect((document.getElementById('lamp-button') as HTMLButtonElement).disabled).toBe(true);
    });

    it('hides the output container', () => {
      const container = document.getElementById('output-container')!;
      container.classList.add('visible');
      setLoading(true);
      expect(container.classList.contains('hidden')).toBe(true);
      expect(container.classList.contains('visible')).toBe(false);
    });

    it('adds loading class and removes compact from the button', () => {
      const btn = document.getElementById('lamp-button')!;
      btn.classList.add('compact');
      setLoading(true);
      expect(btn.classList.contains('loading')).toBe(true);
      expect(btn.classList.contains('compact')).toBe(false);
    });

    it('updates lamp text to summoning message', () => {
      setLoading(true);
      expect(document.querySelector('.lamp-text')!.textContent).toBe('Summoning Gift Ideas...');
    });

    it('resets textarea height to auto', () => {
      const input = document.getElementById('user-input') as HTMLTextAreaElement;
      input.style.height = '200px';
      setLoading(true);
      expect(input.style.height).toBe('auto');
    });
  });

  describe('when isLoading = false', () => {
    it('enables the lamp button', () => {
      const btn = document.getElementById('lamp-button') as HTMLButtonElement;
      btn.disabled = true;
      setLoading(false);
      expect(btn.disabled).toBe(false);
    });

    it('shows the output container', () => {
      const container = document.getElementById('output-container')!;
      container.classList.add('hidden');
      setLoading(false);
      expect(container.classList.contains('visible')).toBe(true);
      expect(container.classList.contains('hidden')).toBe(false);
    });

    it('adds compact class and removes loading from the button', () => {
      const btn = document.getElementById('lamp-button')!;
      btn.classList.add('loading');
      setLoading(false);
      expect(btn.classList.contains('compact')).toBe(true);
      expect(btn.classList.contains('loading')).toBe(false);
    });

    it('restores lamp text to default', () => {
      setLoading(false);
      expect(document.querySelector('.lamp-text')!.textContent).toBe('Rub the Lamp');
    });
  });
});

// ─── checkEnvironment ────────────────────────────────────────────────────────

describe('checkEnvironment', () => {
  beforeEach(() => {
    vi.stubGlobal('process', { env: {} });
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('throws when AI_MODEL is missing', () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    expect(() => checkEnvironment()).toThrow('Missing AI_MODEL');
  });

  it('throws when ANTHROPIC_API_KEY is missing', () => {
    process.env.AI_MODEL = 'claude-sonnet-4-6';
    expect(() => checkEnvironment()).toThrow('Missing ANTHROPIC_API_KEY');
  });

  it('throws when both env vars are missing', () => {
    expect(() => checkEnvironment()).toThrow();
  });

  it('logs model name when both env vars are present', () => {
    process.env.AI_MODEL = 'claude-sonnet-4-6';
    process.env.ANTHROPIC_API_KEY = 'test-key';
    expect(() => checkEnvironment()).not.toThrow();
    expect(console.log).toHaveBeenCalledWith('AI model:', 'claude-sonnet-4-6');
  });
});
