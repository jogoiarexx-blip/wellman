export const keys: Record<string, boolean> = {};

export function setupInput(onAction: (action: string) => void) {
  window.addEventListener('keydown', (e) => {
    const wasDown = !!keys[e.code];
    keys[e.code] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    if (wasDown) return;
    if (e.code === 'KeyC') onAction('switch');
    if (e.code === 'KeyE') onAction('exit');
    if (e.code === 'KeyF') onAction('enter');
  });
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });
  window.addEventListener('blur', () => {
    for (const code of Object.keys(keys)) keys[code] = false;
  });
}
