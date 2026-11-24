# Minha Página

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Online-f4c1ca?style=for-the-badge&logo=github)](https://abeatrizpelegrini.github.io/minha-pagina/)

Página pessoal de apresentação de **Anne Beatriz Pelegrini Nunes**, desenvolvida com HTML, CSS e JavaScript.

O projeto apresenta minha trajetória na área de tecnologia, meus interesses, formas de contato e um pequeno jogo de corrida criado com Canvas.

## Demonstração

Acesse a versão publicada em: **https://abeatrizpelegrini.github.io/minha-pagina/**

## Funcionalidades

- Apresentação pessoal e profissional
- Linha do tempo da trajetória acadêmica e profissional
- Links para LinkedIn e GitHub
- Tema claro e escuro
- Fundo com efeito parallax e elementos animados
- Animação de texto no nome da página
- Jogo de plataforma em Canvas
- Controles por teclado, toque e clique
- Recorde e últimas partidas armazenados no `localStorage`
- Layout responsivo para dispositivos móveis
- Ajustes para usuários que preferem movimento reduzido

## Jogo

No jogo, a personagem precisa pular os prédios que aparecem pelo caminho.

### Controles

- **Espaço** ou **Seta para cima**: iniciar e pular
- **W**: iniciar e pular
- **Toque na tela**: iniciar e pular
- Botão **Jogar**: iniciar uma nova partida
- Botão **Apagar resultados**: limpar o recorde e o histórico

A velocidade aumenta conforme o número de prédios pulados. A cada 30 obstáculos superados, o tema da página é alternado automaticamente.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Canvas API
- Google Fonts
- GitHub Pages

## Estrutura do projeto

```text
minha-pagina/
├── index.html    # Estrutura e conteúdo da página
├── estilo.css    # Layout, temas e responsividade
├── script.js     # Interações, animações e lógica do jogo
└── foto.jpg      # Foto usada na apresentação
```

## Executar localmente

Não é necessário instalar dependências. Clone o repositório e abra o arquivo `index.html` no navegador:

```bash
git clone https://github.com/ABeatrizPelegrini/minha-pagina.git
cd minha-pagina
```

Em seguida, abra `index.html` diretamente ou use uma extensão de servidor local no editor de código.

Com Python instalado, também é possível iniciar um servidor local:

```bash
python -m http.server 8000
```

Acesse `http://localhost:8000` no navegador.

## Personalização

Algumas informações podem ser alteradas diretamente no `index.html`, incluindo:

- Apresentação e resumo
- Cidade e área de estudo
- Links do LinkedIn e GitHub
- Texto sobre a carreira
- A linha do tempo
- Foto de perfil

As cores, fontes e estilos ficam no `estilo.css`. Os comportamentos e a lógica do jogo estão no `script.js`.

## Autora

**Anne Beatriz Pelegrini Nunes**

- [LinkedIn](https://www.linkedin.com/in/anne-beatriz-pelegrini-30ab16351/)
- [GitHub](https://github.com/ABeatrizPelegrini)

## Licença

Este projeto não possui uma licença definida. Entre em contato com a autora antes de reutilizar ou distribuir o conteúdo.
