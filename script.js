const canvas = document.querySelector("#jogo");
const ctx = canvas.getContext("2d");
const botaoJogar = document.querySelector("#botao-jogar");
const botaoApagar = document.querySelector("#botao-apagar");
const placarEl = document.querySelector("#placar");
const recordeEl = document.querySelector("#recorde");
const listaEl = document.querySelector("#ultimas");

// ---------- tamanho do mundo ----------
const LARGURA = 800;
const ALTURA = 260;
const CHAO = 215;

// deixa o desenho nítido em telas de alta resolução
const dpr = Math.min(window.devicePixelRatio || 1, 2);
canvas.width = LARGURA * dpr;
canvas.height = ALTURA * dpr;
ctx.scale(dpr, dpr);

const GRAVIDADE = 2400; // quanto mais alto, mais rápido ela cai
const FORCA_PULO = -780; // quanto mais negativo, mais alto ela pula
const VEL_INICIAL = 340; // velocidade do começo
const VEL_MAXIMA = 650; // velocidade máxima
const AUMENTO_POR_PREDIO = 10; // quanto acelera a cada prédio pulado

//  a boneca ----------
const boneca = { x: 80, y: CHAO - 76, w: 44, h: 76, vy: 0, noChao: false };

//  estado do jogo ----------
let estado = "pronto"; // "pronto", "jogando" ou "fim"
let predios = [];
let pulados = 0;
let velocidade = VEL_INICIAL;
let distancia = 0;
let faltaParaNovo = 0;
let tempoFim = 0;
let novoRecorde = false;

//  resultados guardados no navegador ----------
const CHAVE = "jogo-predios";
let salvo = lerSalvo();

function lerSalvo() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE));
    if (dados && typeof dados.recorde === "number" && Array.isArray(dados.ultimas)) {
      return dados;
    }
  } catch (erro) {
    // sem problema: começa do zero
  }
  return { recorde: 0, ultimas: [] };
}

function guardar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(salvo));
  } catch (erro) {
    // se o navegador não deixar guardar, o jogo continua funcionando
  }
}

function mostrarResultados() {
  recordeEl.textContent = salvo.recorde;
  listaEl.innerHTML = "";

  if (salvo.ultimas.length === 0) {
    const vazio = document.createElement("li");
    vazio.className = "vazio";
    vazio.textContent = "Ainda não há partidas.";
    listaEl.appendChild(vazio);
    return;
  }

  salvo.ultimas.forEach(function (n) {
    const item = document.createElement("li");
    item.textContent = n;
    listaEl.appendChild(item);
  });
}

// ---------- começar e terminar ----------
function comecar() {
  predios = [];
  pulados = 0;
  velocidade = VEL_INICIAL;
  distancia = 0;
  faltaParaNovo = 0;
  novoRecorde = false;
  boneca.y = CHAO - boneca.h;
  boneca.vy = 0;
  boneca.noChao = false;
  placarEl.textContent = 0;
  botaoJogar.textContent = "Jogar de novo";
  estado = "jogando";
}

function terminar() {
  estado = "fim";
  tempoFim = performance.now();

  novoRecorde = pulados > salvo.recorde;
  if (novoRecorde) salvo.recorde = pulados;

  // guarda o resultado desta partida (as 5 últimas ficam salvas)
  salvo.ultimas.unshift(pulados);
  salvo.ultimas = salvo.ultimas.slice(0, 5);

  guardar();
  mostrarResultados();
}

function pular() {
  if (estado === "jogando" && boneca.noChao) {
    boneca.vy = FORCA_PULO;
    boneca.noChao = false;
  }
}

// uma única ação para espaço, toque ou clique
function acao() {
  if (estado === "pronto") {
    comecar();
  } else if (estado === "fim") {
    // espera meio segundo para não reiniciar sem querer
    if (performance.now() - tempoFim > 500) comecar();
  } else {
    pular();
  }
}

//  prédios ----------
function aleatorio(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function criarPredio() {
  const w = aleatorio(34, 58);
  const h = aleatorio(44, 86);
  const colunas = Math.floor((w - 6) / 10);
  const linhas = Math.floor((h - 8) / 12);

  // quais janelas estão acesas
  const janelas = [];
  for (let l = 0; l < linhas; l++) {
    const linha = [];
    for (let c = 0; c < colunas; c++) linha.push(Math.random() < 0.45);
    janelas.push(linha);
  }

  predios.push({
    x: LARGURA + 20,
    w: w,
    h: h,
    janelas: janelas,
    antena: Math.random() < 0.3,
    contado: false,
  });

  // distância até o próximo prédio
  faltaParaNovo = w + aleatorio(velocidade * 0.85, velocidade * 1.6);
}

// ---------- colisão ----------
function bateu(p) {
  // a "caixa" da boneca é um pouco menor que o desenho, para ser justo
  const bx = boneca.x + 10;
  const by = boneca.y + 4;
  const bw = 26;
  const bh = boneca.h - 4;

  const px = p.x + 2;
  const py = CHAO - p.h;
  const pw = p.w - 4;

  return bx < px + pw && bx + bw > px && by < py + p.h && by + bh > py;
}

// ---------- atualizar o jogo (roda a cada quadro) ----------
function atualizar(dt) {
  velocidade = Math.min(VEL_MAXIMA, VEL_INICIAL + pulados * AUMENTO_POR_PREDIO);
  distancia += velocidade * dt;

  // gravidade e pulo
  boneca.vy += GRAVIDADE * dt;
  boneca.y += boneca.vy * dt;
  if (boneca.y >= CHAO - boneca.h) {
    boneca.y = CHAO - boneca.h;
    boneca.vy = 0;
    boneca.noChao = true;
  }

  // move os prédios e cria novos
  predios.forEach(function (p) {
    p.x -= velocidade * dt;
  });
  faltaParaNovo -= velocidade * dt;
  if (faltaParaNovo <= 0) criarPredio();
  predios = predios.filter(function (p) {
    return p.x + p.w > -10;
  });

  for (const p of predios) {
    if (bateu(p)) {
      terminar();
      return;
    }
    // passou inteiro por trás da boneca sem esbarrar? ponto!
    if (!p.contado && p.x + p.w - 2 < boneca.x + 10) {
      p.contado = true;
      pulados++;
      placarEl.textContent = pulados;
    }
  }
}

// ---------- desenho ----------
const FUNDO = [[40, 70], [30, 110], [50, 85], [36, 130], [44, 95], [56, 75], [30, 120], [46, 90]];
const FUNDO_TOTAL = FUNDO.reduce(function (soma, b) {
  return soma + b[0] + 6;
}, 0);

function desenharCenario() {
  // céu
  const ceu = ctx.createLinearGradient(0, 0, 0, CHAO);
  ceu.addColorStop(0, "#fde3e7");
  ceu.addColorStop(1, "#fff7f3");
  ctx.fillStyle = ceu;
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  // cidade lá no fundo (anda devagar)
  ctx.fillStyle = "#f6cdd4";
  const deslocamento = (distancia * 0.25) % FUNDO_TOTAL;
  for (let base = -deslocamento; base < LARGURA; base += FUNDO_TOTAL) {
    let x = base;
    FUNDO.forEach(function (b) {
      ctx.fillRect(x, CHAO - b[1], b[0], b[1]);
      x += b[0] + 6;
    });
  }

  // chão
  ctx.fillStyle = "#f2d3d8";
  ctx.fillRect(0, CHAO, LARGURA, ALTURA - CHAO);
  ctx.fillStyle = "#22202a";
  ctx.fillRect(0, CHAO, LARGURA, 3);
  ctx.fillStyle = "#e3b7c0";
  for (let x = -(distancia % 44); x < LARGURA; x += 44) {
    ctx.fillRect(x, CHAO + 22, 20, 3);
  }
}

function desenharPredio(p) {
  const topo = CHAO - p.h;

  ctx.fillStyle = "#2b2833";
  ctx.fillRect(p.x, topo, p.w, p.h);
  ctx.fillStyle = "#22202a";
  ctx.fillRect(p.x - 2, topo - 3, p.w + 4, 3);

  if (p.antena) {
    ctx.fillRect(p.x + p.w / 2 - 1, topo - 13, 2, 10);
  }

  p.janelas.forEach(function (linha, l) {
    linha.forEach(function (acesa, c) {
      ctx.fillStyle = acesa ? "#f1d58a" : "#4a4556";
      ctx.fillRect(p.x + 6 + c * 10, topo + 8 + l * 12, 5, 7);
    });
  });
}

// a boneca: cabelo preto longo, camisa rosa, calça preta e colar dourado
function desenharBoneca() {
  const noAr = !boneca.noChao;
  const fase = distancia * 0.05;
  const balanco = noAr ? 0 : Math.sin(fase);
  const quique = noAr ? 0 : -Math.abs(balanco) * 2;
  const cabeloVento = noAr ? -5 : Math.sin(fase + 1) * 2 - 2;

  const PELE = "#b9805a";
  const CABELO = "#16121a";
  const CAMISA = "#f4c1ca";
  const CALCA = "#22202a";

  ctx.save();
  ctx.translate(boneca.x, boneca.y + quique);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // cabelo de trás (longo, balança com o vento)
  ctx.fillStyle = CABELO;
  ctx.beginPath();
  ctx.moveTo(22, 3);
  ctx.quadraticCurveTo(4, 6, 6, 30);
  ctx.quadraticCurveTo(6 + cabeloVento, 48, 8 + cabeloVento, 64);
  ctx.lineTo(22 + cabeloVento * 0.3, 60);
  ctx.lineTo(24, 30);
  ctx.closePath();
  ctx.fill();

  // braço de trás
  desenharBraco(noAr ? -2.3 : -balanco * 0.9, "#e6a9b4", PELE);

  // pernas (a de trás é um pouco mais clara para dar profundidade)
  desenharPerna(32, fase + Math.PI, noAr, -1, "#3a3644");
  desenharPerna(22, fase, noAr, 1, CALCA);

  // camisa
  ctx.fillStyle = CAMISA;
  ctx.beginPath();
  ctx.roundRect(15, 28, 24, 26, 6);
  ctx.fill();

  // decote em V
  ctx.fillStyle = PELE;
  ctx.beginPath();
  ctx.moveTo(23, 28);
  ctx.lineTo(31, 28);
  ctx.lineTo(27, 38);
  ctx.closePath();
  ctx.fill();

  // cós da calça
  ctx.fillStyle = CALCA;
  ctx.beginPath();
  ctx.roundRect(15, 50, 24, 7, 3);
  ctx.fill();

  // colar dourado com pingente
  ctx.strokeStyle = "#d9b45f";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(23, 29);
  ctx.lineTo(27, 43);
  ctx.lineTo(31, 29);
  ctx.stroke();
  ctx.fillStyle = "#fff4e0";
  ctx.beginPath();
  ctx.arc(27, 44.5, 2.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // braço da frente
  desenharBraco(noAr ? 2.3 : balanco * 0.9, CAMISA, PELE);

  // pescoço e cabeça
  ctx.fillStyle = PELE;
  ctx.fillRect(23, 22, 8, 8);
  ctx.beginPath();
  ctx.arc(27, 15, 12.5, 0, Math.PI * 2);
  ctx.fill();

  // franja de lado
  ctx.fillStyle = CABELO;
  ctx.beginPath();
  ctx.arc(27, 15, 13.3, Math.PI * 0.88, Math.PI * 2);
  ctx.quadraticCurveTo(36, 8, 28, 9);
  ctx.quadraticCurveTo(20, 10, 15.5, 19);
  ctx.closePath();
  ctx.fill();

  // mecha que cai na frente do ombro
  ctx.beginPath();
  ctx.moveTo(13, 17);
  ctx.lineTo(19, 22);
  ctx.quadraticCurveTo(20, 40, 18 + cabeloVento * 0.4, 56);
  ctx.lineTo(12 + cabeloVento * 0.4, 54);
  ctx.quadraticCurveTo(11, 36, 13, 17);
  ctx.closePath();
  ctx.fill();

  // olhos e sorriso
  ctx.fillStyle = "#16121a";
  ctx.beginPath();
  ctx.arc(31, 16, 1.4, 0, Math.PI * 2);
  ctx.arc(37.5, 16, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#7a3b3b";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(34, 19.5, 2.6, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

  ctx.restore();
}

function desenharBraco(angulo, corManga, corPele) {
  const ombroX = 27;
  const ombroY = 34;
  const cotoveloX = ombroX + Math.sin(angulo) * 10;
  const cotoveloY = ombroY + Math.cos(angulo) * 10;
  const maoX = ombroX + Math.sin(angulo) * 18;
  const maoY = ombroY + Math.cos(angulo) * 18;

  ctx.strokeStyle = corManga;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(ombroX, ombroY);
  ctx.lineTo(cotoveloX, cotoveloY);
  ctx.stroke();

  ctx.fillStyle = corPele;
  ctx.beginPath();
  ctx.arc(maoX, maoY, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

function desenharPerna(quadrilX, fase, noAr, lado, cor) {
  const quadrilY = 54;
  let peX;
  let peY;

  if (noAr) {
    // no ar: uma perna para frente e outra para trás, dobradas
    peX = quadrilX + lado * 9;
    peY = 70;
  } else {
    peX = quadrilX + Math.sin(fase) * 10;
    peY = 76 - Math.max(0, Math.cos(fase)) * 6;
  }

  ctx.strokeStyle = cor;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(quadrilX, quadrilY);
  ctx.lineTo(peX, peY - 4);
  ctx.stroke();
}

function plural(n) {
  return n + (n === 1 ? " prédio" : " prédios");
}

// caixa de texto no meio do jogo
function desenharAviso(linhas) {
  const altura = 30 + linhas.length * 26;
  const topo = (CHAO - altura) / 2 + 6;

  ctx.fillStyle = "rgba(255, 250, 248, 0.92)";
  ctx.beginPath();
  ctx.roundRect(190, topo, 420, altura, 14);
  ctx.fill();

  ctx.fillStyle = "#22202a";
  ctx.textAlign = "center";
  linhas.forEach(function (linha, i) {
    ctx.font = i === 0
      ? '700 22px "Bricolage Grotesque", system-ui, sans-serif'
      : '500 15px "Figtree", system-ui, sans-serif';
    ctx.fillText(linha, LARGURA / 2, topo + 32 + i * 26);
  });
}

function desenhar() {
  desenharCenario();
  predios.forEach(desenharPredio);
  desenharBoneca();

  if (estado === "pronto") {
    desenharAviso(["Pronta para correr?", "Toque aqui ou aperte espaço para começar"]);
  } else if (estado === "fim") {
    desenharAviso([
      "Esbarrou! Você pulou " + plural(pulados),
      novoRecorde ? "Novo recorde!" : "Recorde: " + plural(salvo.recorde),
      "Toque ou aperte espaço para jogar de novo",
    ]);
  }
}

// ---------- o "relógio" do jogo: roda uma vez por quadro ----------
let ultimoTempo = 0;

function quadro(agora) {
  const dt = Math.min((agora - ultimoTempo) / 1000, 0.05);
  ultimoTempo = agora;

  if (estado === "jogando") atualizar(dt);
  desenhar();
  requestAnimationFrame(quadro);
}

// ---------- controles ----------
canvas.addEventListener("keydown", function (e) {
  if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
    e.preventDefault(); // evita que a página role para baixo
    if (!e.repeat) acao();
  }
});

canvas.addEventListener("pointerdown", function (e) {
  e.preventDefault();
  canvas.focus({ preventScroll: true });
  acao();
});

botaoJogar.addEventListener("click", function () {
  if (estado !== "jogando") comecar();
  canvas.focus({ preventScroll: true });
});

botaoApagar.addEventListener("click", function () {
  salvo = { recorde: 0, ultimas: [] };
  guardar();
  mostrarResultados();
});

// ---------- tudo pronto: liga o jogo ----------
boneca.y = CHAO - boneca.h;
mostrarResultados();
requestAnimationFrame(quadro);

document.querySelector("#tema").addEventListener("click", () => document.body.classList.toggle("escuro"));