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
const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const sizeSelectors = document.querySelectorAll('.size-selector');

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
    body: JSON.stringify({
      prompt: prompt,
      model: 'zimage',
      seed: randomSeed,
      width: 1024,
      height: 1024,
      enhance: false,
      refine: false,
      nologo: true
    })
  });
  if (!response.ok) throw new Error('Error al generar imagen en el servidor');
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

uploadButton.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    uploadImageFile(e.target.files[0]);
  }
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
    const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
      method: 'POST',
      body: formData
    });

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
    for (let r = r1; r <= r2; r++) {
      hexGrid.push({q, r});
    }
  }

  const totalPieces = hexGrid.length;
  rotations = Array.from({ length: totalPieces }, () => Math.floor(Math.random() * 6) * 60);

  // --- CÁLCULO FLUIDO DEL TAMAÑO (Para evitar scroll horizontal) ---
  // Calculamos que el tamaño máximo sea 400px, pero que se reduzca si la pantalla es más pequeña
  const availableWidth = window.innerWidth - 40; // Restamos margen de seguridad
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
  const gridPos = hexGrid[index];
  const q = gridPos.q;
  const r = gridPos.r;

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

function checkWin() {
  if (rotations.every(rotation => rotation % 360 === 0)) {
    setTimeout(() => {
      message.textContent = '¡Felicidades! Puzzle completado.';
      messageContainer.style.display = 'flex';
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
    if (!imageUrl) {
      imageUrl = await fetchImageFromBackend(currentPrompt, currentSeed);
    }

    const img = new Image();
    img.onload = () => {
      imgNaturalWidth = img.naturalWidth || 1024;
      imgNaturalHeight = img.naturalHeight || 1024;
      createPuzzlePieces();
    };
    img.onerror = () => {
      console.warn("La imagen no cargó dimensiones correctamente. Se asumirá formato cuadrado.");
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

async function downloadPuzzle() {
  const cssStyles = document.querySelector('style').innerHTML;
  
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
  } catch (error) {
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
    
    let hexGrid = [];
    let rotations = [];
    let scale = 1;
    let R = 0;
    let imgNaturalWidth = 1024;
    let imgNaturalHeight = 1024;

    function init() {
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
    }

    function createPuzzlePieces() {
      puzzleContainer.innerHTML = '';
      hexGrid = [];
      
      for (let q = -rings; q <= rings; q++) {
        let r1 = Math.max(-rings, -q - rings);
        let r2 = Math.min(rings, -q + rings);
        for (let r = r1; r <= r2; r++) {
          hexGrid.push({q, r});
        }
      }

      const totalPieces = hexGrid.length;
      rotations = Array.from({length: totalPieces}, () => Math.floor(Math.random() * 6) * 60);

      const availableWidth = window.innerWidth - 40;
      const maxSize = Math.min(availableWidth, 400);

      const K = rings;
      const Rx = maxSize / (2 * Math.sqrt(3) * K + 2);
      const Ry = maxSize / (3 * K + 2);
      R = Math.min(Rx, Ry);

      const CX = maxSize / 2;
      const CY = maxSize / 2;
      
      const scaleFactor = maxSize / Math.min(imgNaturalWidth, imgNaturalHeight);
      const bgWidth = imgNaturalWidth * scaleFactor;
      const bgHeight = imgNaturalHeight * scaleFactor;
      const bgOffsetX = (bgWidth - maxSize) / 2;
      const bgOffsetY = (bgHeight - maxSize) / 2;

      puzzleContainer.style.width = maxSize + 'px';
      puzzleContainer.style.height = maxSize + 'px';

      for (let i = 0; i < totalPieces; i++) {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        piece.style.backgroundImage = 'url("' + imageUrl + '")';
        piece.style.backgroundSize = bgWidth + 'px ' + bgHeight + 'px';
        piece.style.width = (2 * R) + 'px';
        piece.style.height = (2 * R) + 'px';
        updatePiecePosition(piece, i, CX, CY, bgOffsetX, bgOffsetY);
        piece.addEventListener('click', () => rotatePiece(piece, i));
        puzzleContainer.appendChild(piece);
      }
    }

    function updatePiecePosition(piece, index, CX, CY, bgOffsetX, bgOffsetY) {
      const gridPos = hexGrid[index];
      const q = gridPos.q;
      const r = gridPos.r;

      const centerX = CX + Math.sqrt(3) * R * (q + r / 2);
      const centerY = CY + 1.5 * R * r;

      const left = centerX - R;
      const top = centerY - R;

      piece.style.left = left + 'px';
      piece.style.top = top + 'px';
      piece.style.backgroundPosition = -(left + bgOffsetX) + 'px ' + -(top + bgOffsetY) + 'px';
      piece.style.setProperty('--rot', rotations[index] + 'deg');
    }

    function rotatePiece(piece, index) {
      rotations[index] += 60;
      piece.style.setProperty('--rot', rotations[index] + 'deg');
      checkWin();
    }

    function checkWin() {
      if (rotations.every(rotation => rotation % 360 === 0)) {
        setTimeout(() => {
          message.textContent = '¡Felicidades! Puzzle completado.';
          messageContainer.style.display = 'flex';
        }, 300);
      }
    }

    resetButton.addEventListener('click', createPuzzlePieces);
    playAgainButton.addEventListener('click', () => {
      messageContainer.style.display = 'none';
      createPuzzlePieces();
    });

    puzzleContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      scale = Math.max(0.5, Math.min(2, scale + delta));
      puzzleContainer.style.transform = 'scale(' + scale + ')';
    });

    window.addEventListener('resize', createPuzzlePieces);

    init(); 
  `;

  const cleanHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Puzzle Hexagonal</title>
  <style>
    ${cssStyles}
    .input-container, .selector-container, #downloadButton, #uploadButton, #loadUrlButton, #fileInput { display: none !important; }
    body { background-color: #f0f0f0; }
  </style>
</head>
<body>
  <h1>Puzzle Hexagonal</h1>
  <div class="main-content">
    <div class="puzzle-container" id="puzzleContainer"></div>
  </div>
  <div id="messageContainer">
    <p id="message"></p>
    <button id="playAgainButton">Jugar de nuevo</button>
  </div>
  <div class="button-container">
    <button id="resetButton">Reiniciar Puzzle</button>
  </div>
  <footer>
    Diseñado por Juan Guillermo Rivera Berrío con tecnología Gemini 3.1 Pro
  </footer>
  <script>${scriptContent}<\/script>
</body>
</html>`;

  const blob = new Blob([cleanHtml], { type: 'text/html' });
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

generateButton.addEventListener('click', async () => {
  const prompt = promptInput.value.trim();
  
  if (!prompt) {
    alert('Por favor, ingresa un tema para la imagen');
    return;
  }

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

resetButton.addEventListener('click', () => {
    messageContainer.style.display = 'none';
    createPuzzlePieces();
});

playAgainButton.addEventListener('click', () => {
  messageContainer.style.display = 'none';
  createPuzzlePieces();
});

downloadButton.addEventListener('click', async () => {
  const originalText = downloadButton.textContent;
  downloadButton.textContent = 'Procesando...';
  downloadButton.disabled = true;

  try {
    await downloadPuzzle();
  } finally {
    downloadButton.textContent = originalText;
    downloadButton.disabled = false;
  }
});

puzzleContainer.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  scale = Math.max(0.5, Math.min(2, scale + delta));
  puzzleContainer.style.transform = `scale(${scale})`;
});

window.addEventListener('resize', () => {
  if(imageUrl && puzzleContainer.innerHTML !== '<div id="loadingMessage">Generando imagen IA...</div>' && puzzleContainer.innerHTML !== '<div id="loadingMessage">Subiendo imagen...</div>') {
     createPuzzlePieces();
  }
});

initPuzzle();
