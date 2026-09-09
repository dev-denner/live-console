(() => {
  const section = [...document.querySelectorAll('section')].find((node) => node.textContent?.includes('Importar / exportar'));
  if (!section || document.getElementById('download-template')) return;
  const button = document.createElement('button');
  button.id = 'download-template';
  button.type = 'button';
  button.textContent = 'Baixar modelo JSON';
  button.addEventListener('click', () => { window.location.assign('/api/importacao/modelo'); });
  section.querySelector('pre')?.before(button);
})();
