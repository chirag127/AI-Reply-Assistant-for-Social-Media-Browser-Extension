const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Sizes for the icons
const sizes = [16, 48, 128];

async function convertSvgToPng() {
  try {
    // Read the SVG file
    const svgPath = path.join(__dirname, 'extension', 'assets', 'icon.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Create a data URL from the SVG content
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    
    // Load the SVG image
    const image = await loadImage(svgDataUrl);
    
    // Generate PNG files for each size
    for (const size of sizes) {
      // Create a canvas with the desired size
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Draw the SVG image on the canvas
      ctx.drawImage(image, 0, 0, size, size);
      
      // Convert canvas to PNG buffer
      const pngBuffer = canvas.toBuffer('image/png');
      
      // Save the PNG file
      const pngPath = path.join(__dirname, 'extension', 'assets', `icon${size}.png`);
      fs.writeFileSync(pngPath, pngBuffer);
      
      console.log(`Created icon${size}.png`);
    }
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
  }
}

// Run the conversion
convertSvgToPng();
