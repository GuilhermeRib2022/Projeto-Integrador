import { readFileSync } from 'fs';
const palavrasProibidas = JSON.parse(readFileSync(new URL('./palavrasproibidas.json', import.meta.url)));

export default function contemPalavraOfensiva(texto) {
  const textoNormalizado = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return palavrasProibidas.some(palavra => {
    const palavraNormalizada = palavra.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return textoNormalizado.includes(palavraNormalizada);
  });
}
