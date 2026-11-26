export function saluto(nome) {
  if (typeof nome !== 'string' || nome.trim() === '') {
    return 'Ciao!';
  }
  return `Ciao, ${nome}!`;
}
