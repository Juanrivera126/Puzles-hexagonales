const puzzleContainer = document.getElementById('puzzleContainer');
const resetButton = document.getElementById('resetButton');
const messageContainer = document.getElementById('messageContainer');
const message = document.getElementById('message');
const playAgainButton = document.getElementById('playAgainButton');
const loadingMessage = document.getElementById('loadingMessage');
const promptInput = document.getElementById('promptInput');
const generateButton = document.getElementById('generateButton');
const loadUrlButton = document.getElementById('loadUrlButton');
const downloadButton = document.getElementById('downloadButton');
const saveButton = document.getElementById('saveButton');
const galleryButton = document.getElementById('galleryButton');
const savedCount = document.getElementById('savedCount');
const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const sizeSelectors = document.querySelectorAll('.size-selector');

let savedPuzzles = [];
let imageUrl = '';
let hexGrid = [];
let rotations = [];
let scale = 1;
let rings = 1;
let R = 0;
let isUploading = false;
let imgNaturalWidth = 1024;
let imgNaturalHeight = 1024;
let currentPrompt = 'Un paisaje estilo Miró/negative/no borroso, no deformado,Baroque';
let currentSeed = 296;

sizeSelectors.forEach(selector => {
  selector.addEventListener('click', () => {
    sizeSelectors.forEach(s => s.classList.remove('active'));
    selector.classList.add('active');
    rings = parseInt(selector.dataset.rings);
    initPuzzle();
  });
});

async function fetchImageFromBackend(prompt, seed = null) {
  const randomSeed = seed || Math.floor(Math.random() * 1000);
  const response = await fetch('https://node.proyectodescartes.org/api/ia/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model: 'zimage', seed: randomSeed, width: 1024, height: 1024, enhance: false, refine: false, nologo: true })
  });
  if (!response.ok) throw new Error('Error al generar imagen en el servidor');
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

uploadButton.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) uploadImageFile(e.target.files[0]);
  e.target.value = '';
});

async function uploadImageFile(file) {
  if (isUploading) return;
  isUploading = true;
  const originalText = uploadButton.textContent;
  uploadButton.textContent = 'Subiendo...';
  uploadButton.disabled = true;
  messageContainer.style.display = 'none';
  loadingMessage.style.display = 'block';
  loadingMessage.textContent = 'Subiendo imagen...';
  puzzleContainer.innerHTML = '<div id="loadingMessage">Subiendo imagen...</div>';
  const formData = new FormData();
  formData.append('fileToUpload', file);
  formData.append('reqtype', 'fileupload');
  formData.append('time', '1h');
  try {
    const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', { method: 'POST', body: formData });
    if (response.ok) {
      imageUrl = (await response.text()).trim();
      promptInput.value = '';
      initPuzzle();
    } else {
      throw new Error('Falló el servidor de alojamiento');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al subir. Intenta de nuevo.');
    loadingMessage.textContent = 'Error al subir la imagen.';
  } finally {
    isUploading = false;
    uploadButton.textContent = originalText;
    uploadButton.disabled = false;
  }
}

loadUrlButton.addEventListener('click', () => {
  const url = promptInput.value.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    alert('Por favor, ingresa una URL válida (debe empezar con http:// o https://)');
    return;
  }
  imageUrl = url;
  initPuzzle();
});

function createPuzzlePieces() {
  puzzleContainer.innerHTML = '';
  hexGrid = [];
  for (let q = -rings; q <= rings; q++) {
    let r1 = Math.max(-rings, -q - rings);
    let r2 = Math.min(rings, -q + rings);
    for (let r = r1; r <= r2; r++) hexGrid.push({q, r});
  }
  const totalPieces = hexGrid.length;
  rotations = Array.from({ length: totalPieces }, () => Math.floor(Math.random() * 6) * 60);
  const availableWidth = window.innerWidth - 40;
  const maxSize = Math.min(availableWidth, 400);
  const K = rings;
  const Rx = maxSize / (2 * Math.sqrt(3) * K + 2);
  const Ry = maxSize / (3 * K + 2);
  R = Math.min(Rx, Ry);
  puzzleContainer.style.width = `${maxSize}px`;
  puzzleContainer.style.height = `${maxSize}px`;
  const CX = maxSize / 2;
  const CY = maxSize / 2;
  const scaleFactor = maxSize / Math.min(imgNaturalWidth, imgNaturalHeight);
  const bgWidth = imgNaturalWidth * scaleFactor;
  const bgHeight = imgNaturalHeight * scaleFactor;
  const bgOffsetX = (bgWidth - maxSize) / 2;
  const bgOffsetY = (bgHeight - maxSize) / 2;
  for (let i = 0; i < totalPieces; i++) {
    const piece = document.createElement('div');
    piece.className = 'puzzle-piece';
    piece.style.backgroundImage = `url("${imageUrl}")`;
    piece.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
    piece.style.width = `${2 * R}px`;
    piece.style.height = `${2 * R}px`;
    updatePiecePosition(piece, i, CX, CY, bgOffsetX, bgOffsetY);
    piece.addEventListener('click', () => rotatePiece(piece, i));
    puzzleContainer.appendChild(piece);
  }
  loadingMessage.style.display = 'none';
}

function updatePiecePosition(piece, index, CX, CY, bgOffsetX, bgOffsetY) {
  const {q, r} = hexGrid[index];
  const centerX = CX + Math.sqrt(3) * R * (q + r / 2);
  const centerY = CY + 1.5 * R * r;
  const left = centerX - R;
  const top = centerY - R;
  piece.style.left = `${left}px`;
  piece.style.top = `${top}px`;
  piece.style.backgroundPosition = `${-(left + bgOffsetX)}px ${-(top + bgOffsetY)}px`;
  piece.style.setProperty('--rot', `${rotations[index]}deg`);
}

function rotatePiece(piece, index) {
  rotations[index] += 60;
  piece.style.setProperty('--rot', `${rotations[index]}deg`);
  checkWin();
}

function showConfetti() {
  const colors = ['#f44336', '#e91e63', '#9c27b0', '#3f51b5', '#2196f3', '#4caf50', '#ffeb3b', '#ff9800'];
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `position:fixed;width:10px;height:10px;background:${colors[Math.floor(Math.random()*colors.length)]};left:${Math.random()*100}vw;top:-20px;border-radius:50%;pointer-events:none;z-index:1000;animation:confettiFall ${2+Math.random()*2}s linear forwards`;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4000);
  }
}

function showFullImage() {
  puzzleContainer.querySelectorAll('.puzzle-piece').forEach(p => p.style.opacity = '0');
  const img = document.createElement('img');
  img.src = imageUrl;
  img.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;cursor:pointer;animation:fadeIn 0.5s ease forwards;z-index:10';
  img.title = 'Clic para ver imagen completa';
  img.addEventListener('click', () => {
    fetch(imageUrl).then(r => r.blob()).then(blob => {
      const u = URL.createObjectURL(blob);
      window.open(u, '_blank');
    }).catch(() => window.open(imageUrl, '_blank'));
  });
  puzzleContainer.appendChild(img);
}

function checkWin() {
  if (rotations.every(rotation => rotation % 360 === 0)) {
    setTimeout(() => {
      message.textContent = '¡Felicidades! Puzzle completado.';
      messageContainer.style.display = 'flex';
      showFullImage();
      showConfetti();
    }, 300);
  }
}

async function initPuzzle() {
  messageContainer.style.display = 'none';
  loadingMessage.style.display = 'block';
  if (!imageUrl) {
    loadingMessage.textContent = 'Generando imagen IA...';
    puzzleContainer.innerHTML = '<div id="loadingMessage">Generando imagen IA...</div>';
  } else {
    loadingMessage.textContent = 'Cargando imagen...';
  }
  scale = 1;
  puzzleContainer.style.transform = `scale(${scale})`;
  try {
    if (!imageUrl) imageUrl = await fetchImageFromBackend(currentPrompt, currentSeed);
    const img = new Image();
    img.onload = () => {
      imgNaturalWidth = img.naturalWidth || 1024;
      imgNaturalHeight = img.naturalHeight || 1024;
      createPuzzlePieces();
    };
    img.onerror = () => {
      imgNaturalWidth = 1024;
      imgNaturalHeight = 1024;
      createPuzzlePieces();
    };
    img.src = imageUrl;
  } catch (error) {
    console.error('Error al obtener la imagen:', error);
    loadingMessage.textContent = 'Error al generar la imagen.';
  }
}

// --- CONSTRUIR HTML DEL PUZZLE ---
async function buildPuzzleHtml() {
  const cssStyles = `* { box-sizing: border-box; } body { font-family: Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px 10px; background-color: #f0f0f0; overflow-x: hidden; } .main-content { display: flex; flex-direction: row; flex-wrap: wrap; align-items: center; justify-content: center; gap: 30px; margin-bottom: 20px; width: 100%; max-width: 800px; } .puzzle-container { position: relative; background-color: #333; border-radius: 8px; overflow: hidden; transition: transform 0.3s ease; box-shadow: 0 10px 30px rgba(0,0,0,0.3); max-width: 100%; } .puzzle-piece { position: absolute; background-repeat: no-repeat; cursor: pointer; clip-path: polygon(50% 0%, 93.301% 25%, 93.301% 75%, 50% 100%, 6.699% 75%, 6.699% 25%); transform: scale(var(--scale, 0.98)) rotate(var(--rot, 0deg)); transition: transform 0.3s ease; } .puzzle-piece:hover { --scale: 1.05; z-index: 2; } @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } h1 { margin-top: 10px; margin-bottom: 20px; color: #333; text-align: center; font-size: clamp(24px, 5vw, 36px); } button { padding: 10px 20px; font-size: 16px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.3s ease, transform 0.1s ease; } button:hover { background-color: #45a049; } button:active { transform: scale(0.95); } #messageContainer { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background-color: rgba(255,255,255,0.95); padding: 15px 30px; border-radius: 50px; text-align: center; font-size: 18px; font-weight: bold; color: #333; display: none; flex-direction: row; align-items: center; gap: 20px; z-index: 100; box-shadow: 0 5px 20px rgba(0,0,0,0.3); max-width: 90%; } #messageContainer p { margin: 0; } #playAgainButton { margin: 0; padding: 8px 16px; font-size: 14px; background-color: #2196F3; } #playAgainButton:hover { background-color: #1976D2; } .button-container { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; width: 100%; } footer { margin-top: 40px; padding: 20px; text-align: center; color: #666; font-size: 14px; width: 100%; }`;

  let imageBase64 = imageUrl;
  try {
    const response = await fetch(imageUrl);
    if (response.ok) {
      const blob = await response.blob();
      imageBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    }
  } catch (e) {
    console.warn('Conversión Base64 bloqueada. Se utilizará la URL directa.');
  }

  const scriptContent = `
    const puzzleContainer = document.getElementById('puzzleContainer');
    const messageContainer = document.getElementById('messageContainer');
    const message = document.getElementById('message');
    const playAgainButton = document.getElementById('playAgainButton');
    const resetButton = document.getElementById('resetButton');
    const imageUrl = "${imageBase64}";
    const rings = ${rings};
    let hexGrid = [], rotations = [], scale = 1, R = 0;
    let imgNaturalWidth = 1024, imgNaturalHeight = 1024;
    function init() {
      const img = new Image();
      img.onload = () => { imgNaturalWidth = img.naturalWidth || 1024; imgNaturalHeight = img.naturalHeight || 1024; createPuzzlePieces(); };
      img.onerror = () => { createPuzzlePieces(); };
      img.src = imageUrl;
    }
    function createPuzzlePieces() {
      puzzleContainer.innerHTML = ''; hexGrid = [];
      for (let q = -rings; q <= rings; q++) {
        let r1 = Math.max(-rings, -q-rings), r2 = Math.min(rings, -q+rings);
        for (let r = r1; r <= r2; r++) hexGrid.push({q, r});
      }
      const totalPieces = hexGrid.length;
      rotations = Array.from({length: totalPieces}, () => Math.floor(Math.random()*6)*60);
      const maxSize = Math.min(window.innerWidth - 40, 400);
      const K = rings;
      R = Math.min(maxSize/(2*Math.sqrt(3)*K+2), maxSize/(3*K+2));
      const CX = maxSize/2, CY = maxSize/2;
      const sf = maxSize/Math.min(imgNaturalWidth, imgNaturalHeight);
      const bgW = imgNaturalWidth*sf, bgH = imgNaturalHeight*sf;
      const bgOX = (bgW-maxSize)/2, bgOY = (bgH-maxSize)/2;
      puzzleContainer.style.width = maxSize+'px'; puzzleContainer.style.height = maxSize+'px';
      for (let i = 0; i < totalPieces; i++) {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        piece.style.backgroundImage = 'url("'+imageUrl+'")';
        piece.style.backgroundSize = bgW+'px '+bgH+'px';
        piece.style.width = (2*R)+'px'; piece.style.height = (2*R)+'px';
        const {q, r} = hexGrid[i];
        const cx = CX+Math.sqrt(3)*R*(q+r/2), cy = CY+1.5*R*r;
        piece.style.left = (cx-R)+'px'; piece.style.top = (cy-R)+'px';
        piece.style.backgroundPosition = -(cx-R+bgOX)+'px '+-(cy-R+bgOY)+'px';
        piece.style.setProperty('--rot', rotations[i]+'deg');
        piece.addEventListener('click', () => { rotations[i]+=60; piece.style.setProperty('--rot', rotations[i]+'deg'); checkWin(); });
        puzzleContainer.appendChild(piece);
      }
    }
    function checkWin() {
      if (rotations.every(r => r%360===0)) {
        setTimeout(() => {
          message.textContent = '¡Felicidades! Puzzle completado.';
          messageContainer.style.display = 'flex';
          puzzleContainer.querySelectorAll('.puzzle-piece').forEach(p => p.style.opacity='0');
          const img = document.createElement('img');
          img.src = imageUrl;
          img.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;cursor:pointer;animation:fadeIn 0.5s ease forwards;z-index:10';
          img.title = 'Clic para ver imagen completa';
          img.addEventListener('click', () => {
            fetch(imageUrl).then(r => r.blob()).then(blob => {
              const u = URL.createObjectURL(blob);
              window.open(u, '_blank');
            }).catch(() => window.open(imageUrl, '_blank'));
          });
          puzzleContainer.appendChild(img);
          const colors=['#f44336','#e91e63','#9c27b0','#3f51b5','#2196f3','#4caf50','#ffeb3b','#ff9800'];
          for(let i=0;i<50;i++){const c=document.createElement('div');c.style.cssText='position:fixed;width:10px;height:10px;background:'+colors[Math.floor(Math.random()*colors.length)]+';left:'+(Math.random()*100)+'vw;top:-20px;border-radius:50%;pointer-events:none;z-index:1000;animation:confettiFall '+(2+Math.random()*2)+'s linear forwards';document.body.appendChild(c);setTimeout(()=>c.remove(),4000);}
        }, 300);
      }
    }
    resetButton.addEventListener('click', createPuzzlePieces);
    playAgainButton.addEventListener('click', () => { messageContainer.style.display='none'; createPuzzlePieces(); });
    puzzleContainer.addEventListener('wheel', (e) => { e.preventDefault(); scale=Math.max(0.5,Math.min(2,scale+(e.deltaY>0?-0.1:0.1))); puzzleContainer.style.transform='scale('+scale+')'; });
    window.addEventListener('resize', createPuzzlePieces);
    init();
  `;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Puzzle Hexagonal</title><style>${cssStyles}</style></head><body><h1>Puzzle Hexagonal</h1><div class="main-content"><div class="puzzle-container" id="puzzleContainer"></div></div><div id="messageContainer"><p id="message"></p><button id="playAgainButton">Jugar de nuevo</button></div><div class="button-container"><button id="resetButton">Reiniciar Puzzle</button></div><footer>Diseñado por Juan Guillermo Rivera Berrío con tecnología Gemini 3.1 Pro</footer><script>${scriptContent}<\/script></body></html>`;
}

// --- DESCARGAR PUZZLE ---
async function downloadPuzzle() {
  const htmlContent = await buildPuzzleHtml();
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const pieceCount = rings === 1 ? 7 : rings === 2 ? 19 : rings === 3 ? 37 : 61;
  a.download = `puzzle_hex_${pieceCount}_piezas.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- GUARDAR PUZZLE (guarda el HTML completo del puzzle en el vector) ---
async function savePuzzle() {
  if (!imageUrl) {
    alert('No hay ningún puzzle generado para guardar.');
    return;
  }
  const originalText = saveButton.textContent;
  saveButton.textContent = 'Guardando...';
  saveButton.disabled = true;
  try {
    const htmlContent = await buildPuzzleHtml();
    const pieceCount = rings === 1 ? 7 : rings === 2 ? 19 : rings === 3 ? 37 : 61;
    savedPuzzles.push({ html: htmlContent, pieceCount });
    savedCount.style.display = 'block';
    savedCount.textContent = `Puzzles guardados: ${savedPuzzles.length}`;
    saveButton.textContent = '¡Guardado!';
    setTimeout(() => { saveButton.textContent = originalText; }, 1500);
  } catch (err) {
    alert('Error al guardar el puzzle.');
    saveButton.textContent = originalText;
  } finally {
    saveButton.disabled = false;
  }
}

// --- GENERAR GALERÍA (cada panel es un iframe con el HTML completo del puzzle) ---
function generateGallery() {
  if (savedPuzzles.length === 0) {
    alert('No hay puzzles guardados. Guarda al menos uno primero.');
    return;
  }

  const panelsHtml = savedPuzzles.map((p, i) => {
    const num = i + 1;
    const escaped = p.html.replace(/"/g, '&quot;');
    const fullWidth = (savedPuzzles.length % 2 !== 0 && i === savedPuzzles.length - 1) ? ' full-width' : '';
    return `<div class="comic-panel${fullWidth}"><div class="panel-number">${num}</div><div class="panel-info">${p.pieceCount} piezas</div><button class="zoom-btn" onclick="openZoom(${i})" title="Ampliar">&#x26F6;</button><iframe srcdoc="${escaped}" scrolling="no" frameborder="0"></iframe></div>`;
  }).join('\n');

  // Datos de los puzzles para el modal (escapados para JSON seguro en HTML)
  const puzzleDataJson = JSON.stringify(savedPuzzles.map(p => ({ html: p.html, pieceCount: p.pieceCount })))
    .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Puzles hexagonales</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .gallery-title { font-size: 3rem; font-weight: 900; color: white; text-align: center; margin-bottom: 2rem; text-shadow: 4px 4px 8px rgba(0,0,0,0.3); text-transform: uppercase; letter-spacing: 2px; }
    .gallery-container { max-width: 1400px; width: 100%; background: rgba(255,255,255,0.95); border-radius: 25px; padding: 2rem; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .comic-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .comic-panel { position: relative; aspect-ratio: 1/1; border: 4px solid #333; border-radius: 15px; overflow: hidden; background: #333; box-shadow: 0 8px 25px rgba(0,0,0,0.15); transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .comic-panel:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 15px 40px rgba(0,0,0,0.25); }
    .comic-panel.full-width { grid-column: 1/-1; aspect-ratio: 2/1; }
    .panel-number { position: absolute; top: 12px; left: 12px; background: linear-gradient(45deg, #667eea, #764ba2); color: white; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; z-index: 10; box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
    .panel-info { position: absolute; bottom: 10px; right: 12px; background: rgba(0,0,0,0.55); color: white; font-size: 0.8rem; padding: 3px 8px; border-radius: 10px; z-index: 10; }
    .zoom-btn { position: absolute; top: 10px; right: 10px; z-index: 10; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 6px; width: 32px; height: 32px; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
    .zoom-btn:hover { background: rgba(102,126,234,0.9); }
    .comic-panel iframe { width: 100%; height: 100%; border: none; display: block; }
    .footer { text-align: center; color: rgba(255,255,255,0.9); font-size: 0.9rem; margin-top: 1rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
    /* Modal zoom */
    .zoom-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: none; align-items: center; justify-content: center; z-index: 9999; padding: 1rem; }
    .zoom-overlay.open { display: flex; }
    .zoom-modal { position: relative; width: min(90vw, 90vh); height: min(90vw, 90vh); background: #333; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
    .zoom-modal iframe { width: 100%; height: 100%; border: none; display: block; }
    .zoom-close { position: absolute; top: 10px; right: 10px; z-index: 10; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 36px; height: 36px; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
    .zoom-close:hover { background: #e53935; }
    @media (max-width: 768px) { .comic-grid { grid-template-columns: 1fr; gap: 1rem; } .gallery-title { font-size: 2rem; } body { padding: 1rem; } .gallery-container { padding: 1rem; } .comic-panel.full-width { grid-column: 1; aspect-ratio: 1/1; } }
  </style>
</head>
<body>
  <h1 class="gallery-title">Puzles hexagonales</h1>
  <div class="gallery-container">
    <div class="comic-grid">${panelsHtml}</div>
  </div>
  <p class="footer">Diseñado por Juan Guillermo Rivera Berrío con tecnología Gemini 3.1 Pro</p>

  <!-- Modal zoom -->
  <div class="zoom-overlay" id="zoomOverlay">
    <div class="zoom-modal">
      <button class="zoom-close" id="zoomClose" title="Cerrar">&times;</button>
      <iframe id="zoomFrame" srcdoc="" frameborder="0"></iframe>
    </div>
  </div>

  <script>
    const puzzles = ${puzzleDataJson};
    const overlay = document.getElementById('zoomOverlay');
    const zoomFrame = document.getElementById('zoomFrame');
    function openZoom(index) {
      zoomFrame.srcdoc = puzzles[index].html;
      overlay.classList.add('open');
    }
    document.getElementById('zoomClose').addEventListener('click', closeZoom);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeZoom(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeZoom(); });
    function closeZoom() {
      overlay.classList.remove('open');
      zoomFrame.srcdoc = '';
    }
  <\/script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'galeria_puzles_hexagonales.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

// --- EVENT LISTENERS ---
generateButton.addEventListener('click', async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) { alert('Por favor, ingresa un tema para la imagen'); return; }
  generateButton.disabled = true;
  generateButton.textContent = 'Generando...';
  try {
    currentPrompt = prompt;
    currentSeed = Math.floor(Math.random() * 1000);
    imageUrl = '';
    await initPuzzle();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al generar la imagen: ' + error.message);
  } finally {
    generateButton.disabled = false;
    generateButton.textContent = 'Generar IA';
  }
});

resetButton.addEventListener('click', () => { messageContainer.style.display = 'none'; createPuzzlePieces(); });
playAgainButton.addEventListener('click', () => { messageContainer.style.display = 'none'; createPuzzlePieces(); });

downloadButton.addEventListener('click', async () => {
  const originalText = downloadButton.textContent;
  downloadButton.textContent = 'Procesando...';
  downloadButton.disabled = true;
  try { await downloadPuzzle(); }
  finally { downloadButton.textContent = originalText; downloadButton.disabled = false; }
});

saveButton.addEventListener('click', savePuzzle);
galleryButton.addEventListener('click', generateGallery);

puzzleContainer.addEventListener('wheel', (e) => {
  e.preventDefault();
  scale = Math.max(0.5, Math.min(2, scale + (e.deltaY > 0 ? -0.1 : 0.1)));
  puzzleContainer.style.transform = `scale(${scale})`;
});

window.addEventListener('resize', () => {
  if (imageUrl && puzzleContainer.innerHTML !== '<div id="loadingMessage">Generando imagen IA...</div>' && puzzleContainer.innerHTML !== '<div id="loadingMessage">Subiendo imagen...</div>') {
    createPuzzlePieces();
  }
});

initPuzzle();
