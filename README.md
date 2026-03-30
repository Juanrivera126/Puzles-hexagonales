# 🧩 Puzzle Hexagonal Simétrico

Una aplicación web interactiva que permite crear, jugar y descargar rompecabezas giratorios basados en cuadrículas hexagonales perfectas. Las imágenes del rompecabezas pueden ser generadas mediante las API de [Pollinations AI](https://pollinations.ai/), subidas desde el equipo local o cargadas desde una URL.

[Demo](https://juanrivera126.github.io/Puzles-hexagonales/Ejemplos/Puzles_Collage.html)

## ✨ Características Principales

- **Geometría Hexagonal Simétrica:** Genera puzles basados en "anillos" logrando composiciones perfectas de 7, 19, 37 o 61 piezas hexagonales.
- **Múltiples Fuentes de Imágenes:**
  - 🤖 **Generación IA:** Crea imágenes escribiendo un prompt.
  - 🌐 **Desde URL:** Pega cualquier enlace público de una imagen.
  - 📁 **Subida Local:** Carga imágenes directamente desde tu PC o teléfono.
- **Smart Center Crop:** Si la imagen cargada no es cuadrada (ej: formato retrato o paisaje), el algoritmo realiza un recorte virtual centrado automático evitando cualquier tipo de deformación.
- **Rotación de 60º:** Haz clic sobre las piezas para girarlas sobre su propio eje.
- **Juego Offline (Exportación):** Un botón permite **Descargar** el puzzle actual como un archivo HTML independiente, permitiendo enviarlo o jugarlo sin necesidad de conexión a internet.
- **Totalmente Responsive:** Funciona a la perfección tanto en pantallas de escritorio como en dispositivos móviles.

## 🚀 Cómo usar

1. **Elige una imagen:** Ingresa un texto para generar mediante IA, pega una URL o usa el botón "Subir Archivo".
2. **Selecciona la dificultad:** En el panel lateral derecho, elige el número de piezas (7, 19, 37 o 61).
3. **Juega:** Haz clic sobre cada pieza del hexágono para girarla 60 grados. El objetivo es alinear correctamente toda la imagen.
4. **Descarga:** Si te gusta el rompecabezas generado, haz clic en **"Descargar Puzzle"**. Obtendrás un archivo `.html` que puedes guardar o compartir.

## 🛠️ Tecnologías utilizadas

- **HTML5** y **CSS3** (CSS Variables, Clip-path, Flexbox).
- **JavaScript Vanilla** (Sin frameworks).
- **Catbox / Litterbox API** para el almacenamiento temporal de imágenes subidas.
- Proyecto asistido e impulsado por **Inteligencia Artificial (Gemini 3.1 Pro)**.

## 👨‍💻 Créditos

Diseñado por **Juan Guillermo Rivera Berrío** con tecnología **Gemini 3.1 Pro**.
