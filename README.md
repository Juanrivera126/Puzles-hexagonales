# Puzzle Hexagonal Simétrico

Aplicación web interactiva que genera puzzles con piezas hexagonales a partir de imágenes generadas por IA, URLs externas o archivos locales. Permite guardar múltiples puzzles y exportarlos como una galería HTML interactiva.

Diseñado por **Juan Guillermo Rivera Berrío** con tecnología Gemini 3.1 Pro.

---

## Características

- **Generación de imágenes con IA** — escribe un prompt y la app genera una imagen automáticamente.
- **Carga de imágenes** — por URL externa o subiendo un archivo desde tu dispositivo.
- **4 tamaños de puzzle** — 7, 19, 37 o 61 piezas hexagonales.
- **Rotación de piezas** — haz clic en cada pieza para rotarla 60°.
- **Detección de victoria** — confeti y revelación de la imagen al completar el puzzle.
- **Ver imagen original** — al completar el puzzle, haz clic sobre la imagen para abrirla en una pestaña nueva.
- **Guardar puzzles** — guarda el puzzle actual (como HTML autocontenido) en un vector en memoria.
- **Descargar puzzle** — descarga el puzzle actual como archivo `.html` independiente y jugable.
- **Galería interactiva** — exporta todos los puzzles guardados a un archivo HTML con grilla de 2 columnas, puzzles jugables y botón de zoom para cada uno.

---

## Uso

### Generar un puzzle

1. Escribe un prompt en el campo de texto y pulsa **Generar IA**, o bien pega una URL de imagen y pulsa **Cargar URL**, o pulsa **Subir Archivo** para usar una imagen local.
2. Selecciona el número de piezas con los botones de la derecha (7, 19, 37 o 61).
3. Haz clic en las piezas para rotarlas hasta armar el puzzle.

### Guardar y exportar

- **Guardar** — guarda el puzzle actual en memoria. El contador debajo de los botones indica cuántos puzzles llevas guardados.
- **Descargar Puzzle** — descarga el puzzle actual como archivo HTML independiente.
- **Generar y descargar galería** — exporta todos los puzzles guardados a un archivo `galeria_puzles_hexagonales.html` con:
  - Grilla de 2 columnas con puzzles interactivos.
  - Número de piezas en cada panel.
  - Botón **Zoom** (esquina superior derecha de cada panel) para ampliar el puzzle en una ventana emergente.

---

## Estructura del proyecto

```
├── index.html       # Interfaz principal
├── style.css        # Estilos
├── script.js        # Lógica de la aplicación
└── Collage/         # App auxiliar: generador de tiras cómicas / galerías
```

---

## Tecnologías

- HTML5, CSS3, JavaScript (vanilla)
- API de generación de imágenes: `https://node.proyectodescartes.org/api/ia/image`
- Alojamiento temporal de imágenes: [litterbox.catbox.moe](https://litterbox.catbox.moe)

---

## Requisitos

No requiere instalación ni dependencias. Abre `index.html` directamente en cualquier navegador moderno.

---

---

# Symmetric Hexagonal Puzzle

An interactive web application that generates hexagonal puzzles from AI-generated images, external URLs, or local files. Supports saving multiple puzzles and exporting them as an interactive HTML gallery.

Designed by **Juan Guillermo Rivera Berrío** using Gemini 3.1 Pro technology.

---

## Features

- **AI image generation** — type a prompt and the app generates an image automatically.
- **Image loading** — via external URL or by uploading a local file.
- **4 puzzle sizes** — 7, 19, 37, or 61 hexagonal pieces.
- **Piece rotation** — click any piece to rotate it 60°.
- **Win detection** — confetti and image reveal when the puzzle is completed.
- **View original image** — once completed, click the image to open it in a new tab.
- **Save puzzles** — saves the current puzzle (as a self-contained HTML file) into an in-memory array.
- **Download puzzle** — downloads the current puzzle as a standalone playable `.html` file.
- **Interactive gallery** — exports all saved puzzles to an HTML file with a 2-column grid, playable puzzles, and a zoom button for each one.

---

## Usage

### Generate a puzzle

1. Type a prompt and click **Generar IA**, or paste an image URL and click **Cargar URL**, or click **Subir Archivo** to upload a local image.
2. Select the number of pieces using the buttons on the right (7, 19, 37, or 61).
3. Click the pieces to rotate them until the puzzle is solved.

### Save and export

- **Guardar** — saves the current puzzle to memory. A counter below the buttons shows how many puzzles have been saved.
- **Descargar Puzzle** — downloads the current puzzle as a standalone HTML file.
- **Generar y descargar galería** — exports all saved puzzles to `galeria_puzles_hexagonales.html` with:
  - A 2-column grid of interactive puzzles.
  - Piece count label on each panel.
  - **Zoom** button (top-right corner of each panel) to expand the puzzle in a centered modal.

---

## Project structure

```
├── index.html       # Main interface
├── style.css        # Styles
├── script.js        # Application logic
└── Collage/         # Auxiliary app: comic strip / gallery generator
```

---

## Technologies

- HTML5, CSS3, vanilla JavaScript
- Image generation API: `https://node.proyectodescartes.org/api/ia/image`
- Temporary image hosting: [litterbox.catbox.moe](https://litterbox.catbox.moe)

---

## Requirements

No installation or dependencies required. Open `index.html` directly in any modern browser.
