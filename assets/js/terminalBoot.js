const STEP_SELECTOR = '[data-terminal-step]';
const ITEM_SELECTOR = '[data-terminal-item]';
const TYPE_SELECTOR = '[data-terminal-type]';

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function hydrateDynamicTerminalText() {
    document.querySelectorAll('[data-terminal-tail-base]').forEach((el) => {
        const base = Number(el.getAttribute('data-terminal-tail-base'));

        if (!Number.isFinite(base)) {
            return;
        }

        el.textContent = `ls -la ./posts/ | tail -${base + 2}`;
    });
}

function reveal(el) {
    el.classList.add('is-terminal-visible');
}

async function typeLine(el) {
    const targets = el.querySelectorAll(TYPE_SELECTOR);

    if (!targets.length) {
        reveal(el);
        await sleep(60);
        return;
    }

    reveal(el);

    for (const target of targets) {
        const text = target.textContent;
        target.dataset.terminalText = text;
        target.textContent = '';
        target.classList.add('is-terminal-typing');

        for (const char of text) {
            target.textContent += char;
            await sleep(char === ' ' ? 16 : 26);
        }

        target.classList.remove('is-terminal-typing');
    }

    await sleep(90);
}

async function revealGroup(el) {
    reveal(el);

    const items = el.querySelectorAll(ITEM_SELECTOR);
    const groupItems = items.length ? items : el.querySelectorAll(':scope > *');

    if (!groupItems.length) {
        await sleep(80);
        return;
    }

    for (const item of groupItems) {
        reveal(item);
        await sleep(110);
    }
}

async function runStep(step) {
    if (step.hasAttribute('data-terminal-line')) {
        await typeLine(step);
        return;
    }

    if (step.hasAttribute('data-terminal-group')) {
        await revealGroup(step);
        return;
    }

    reveal(step);
    await sleep(90);
}

export default async function terminalBoot() {
    const bootRoot = document.querySelector('[data-terminal-boot-root]');

    if (!bootRoot) {
        return;
    }

    hydrateDynamicTerminalText();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const steps = bootRoot.querySelectorAll(STEP_SELECTOR);

    if (!steps.length) {
        return;
    }

    document.documentElement.classList.add('gh-terminal-boot');

    for (const step of steps) {
        await runStep(step);
    }

    document.documentElement.classList.remove('gh-terminal-boot');
    document.documentElement.classList.add('gh-terminal-booted');
}
