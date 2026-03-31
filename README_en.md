# 🧩 Symmetrical Hexagonal Puzzle

An interactive web application that allows users to create, play, and download rotating puzzles based on perfect hexagonal grids. Puzzle images can be generated using the [Pollinations AI](https://pollinations.ai/), uploaded from a local device, or loaded from a URL.

## ✨ Key Features
- **Symmetrical Hexagonal Geometry:** Generates puzzles based on "rings," achieving perfect layouts of 7, 19, 37, or 61 hexagonal pieces.
- **Multiple Image Sources:**
	- **🤖 AI Generation:** Create images by writing a prompt.
	- **🌐 From URL:** Paste any public image link.
	- **📁 Local Upload:** Upload images directly from your PC or mobile device.
- **Smart Center Crop:** If the image is not square (e.g., portrait or landscape), the algorithm performs an automatic centered crop to prevent distortion.
- **60º Rotation:** Click on puzzle pieces to rotate them around their own axis.
- **Offline Play (Export):** A button allows you to download the current puzzle as a standalone HTML file, making it easy to share or play without an internet connection.
- **Fully Responsive:** Works seamlessly on both desktop and mobile devices.

## 🚀 How to Use
1. **Choose an image:** Enter a prompt for AI generation, paste an image URL, or use the "Upload File" button.
2. **Select difficulty:** In the right-side panel, choose the number of pieces (7, 19, 37, or 61).
3. **Play:** Click on each hexagonal piece to rotate it 60 degrees. The goal is to correctly align the full image.
4. **Download:** If you like the generated puzzle, click "Download Puzzle". You will get an .html file that you can save or share.

## 🛠️ Technologies Used
- ** HTML5 and CSS3 ** (CSS Variables, Clip-path, Flexbox) 
- ** Vanilla JavaScript** (No frameworks)
- ** Catbox / Litterbox API** for temporary image storage
- Project assisted and powered by **Artificial Intelligence (Gemini 3.1 Pro)**
- Images can be generated using the **[Pollinations AI](https://pollinations.ai/)**

## 👨 💻 Credits

Designed by Juan Guillermo Rivera Berrío using Gemini 3.1 Pro.