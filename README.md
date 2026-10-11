# jackdsgn.github.io

Portfólio de motion design de Jose Jackson (Jackdsgn), publicado no GitHub Pages em https://jackdsgn.github.io/.

Site estático, sem etapa de build: HTML, CSS e JavaScript puros. O GitHub Pages publica a branch `main` direto da raiz.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `index.html` | Página única: home, cases (`#case-<slug>`) e Sobre (`#sobre`) |
| `assets/css/site.css` | Estilos e tokens de cor do design system Jackdsgn |
| `assets/js/projects.js` | Lista de projetos e o conteúdo de cada case |
| `assets/js/site.js` | Animações, rotas, física da Stack, WhatsApp |
| `media/` | Vídeos e imagens otimizados |
| `assets/img/og.jpg` | Imagem que aparece quando o link é compartilhado |

## Adicionar um projeto

1. Gere as versões leves do vídeo (troque `ENTRADA.mp4` e `nome`):

   ```bash
   ffmpeg -ss 0 -t 8 -i ENTRADA.mp4 -an -vf "scale=640:-2,fps=24" -c:v libx264 -pix_fmt yuv420p -crf 30 -preset slow -movflags +faststart media/nome.mp4
   ffmpeg -ss 2 -i ENTRADA.mp4 -frames:v 1 -vf "scale=640:-2" -q:v 5 media/nome.jpg
   ffmpeg -i ENTRADA.mp4 -vf "scale=960:-2" -c:v libx264 -pix_fmt yuv420p -crf 27 -preset slow -c:a aac -b:a 96k -movflags +faststart media/nome-full.mp4
   ```

   Para vídeo vertical (9:16), use `360:-2` na prévia e `540:-2` na versão completa.

2. Copie um bloco em `assets/js/projects.js` e ajuste os campos.
3. Coloque o `slug` em uma das fileiras (`ROWS`) em `assets/js/site.js`.

## Rodar localmente

```bash
python3 -m http.server 8766
```

Depois abra http://localhost:8766.

## Observações

- Os títulos usam **Archivo** expandida (Google Fonts), substituta gratuita da Integral CF. Para usar a Integral, é preciso licença de uso web.
- Visitantes que chegam com `utm_*`, `gclid` ou `fbclid` no link pulam a animação de abertura.
