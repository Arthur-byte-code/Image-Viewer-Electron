const fs = require('fs/promises');
const path = require('path');
const { ipcRenderer } = require('electron');
const sharp = require('sharp');

document.getElementById('btn-readFile').addEventListener('click', () => {
  ipcRenderer.send('openExplorer');
});

ipcRenderer.on('load_folder', async (event, folderPath) => {
  const directoryPath = folderPath + '\\';

  try {
    const files = await fs.readdir(directoryPath);
    const acceptedExtensions = ['.jpg', '.png', '.svg', '.webp', '.gif'];
    const images = files.filter(file => acceptedExtensions.includes(path.extname(file)));



    let currentIndex = 0;

    // Display initial image
    displayImage(images[currentIndex]);

    // Function to display image based on index
    async function displayImage(filename) {
      const filePath = path.join(directoryPath, filename);

      // Read metadata of the image using Sharp
      const metadata = await sharp(filePath).metadata();
      const fileSize = (await fs.stat(filePath)).size;
      const fileSizeInKB = (fileSize / 1024).toFixed(2); // Convert bytes to kilobytes

      const width = metadata.width;
      const height = metadata.height;
      const name = filename;

      ipcRenderer.send('imageInfo', width, height, name, fileSizeInKB);

      document.getElementById("nameImg").innerHTML = `Name: ${name}`;
      document.getElementById("heightPx").innerHTML = `Height: ${height} px`;
      document.getElementById("widthPx").innerHTML = `Width: ${width} px`;
      document.getElementById("kbs").innerHTML = `Size: ${fileSizeInKB} KB`;

      // Set desired dimensions
      const desiredWidth = 800; // Example width
      const desiredHeight = 600; // Example height

      // Calculate new dimensions while maintaining aspect ratio
      const resizedImageBuffer = await sharp(filePath)
        .resize({
          width: desiredWidth,
          height: desiredHeight,
          fit: sharp.fit.inside, // Maintain aspect ratio and fit inside the dimensions
        })
        .toBuffer();

      // Convert the resized image buffer to a data URL for display
      const resizedImageData = Buffer.from(resizedImageBuffer).toString('base64');
      document.getElementById('image-display').src = `data:image/png;base64,${resizedImageData}`;
    }

    // Function to navigate to the next image
    function nextImage() {
      currentIndex++;
      if (currentIndex >= images.length) {
        currentIndex = 0;
      }
      displayImage(images[currentIndex]);
    }

    // Function to navigate to the previous image
    function previousImage() {
      currentIndex--;
      if (currentIndex < 0) {
        currentIndex = images.length - 1;
      }
      displayImage(images[currentIndex]);
    }

    // Event listener for next button click
    document.getElementById('iconRight').addEventListener('click', nextImage);

    // Event listener for previous button click
    document.getElementById('iconLeft').addEventListener('click', previousImage);

    // Event listener for keyboard arrow keys
    document.addEventListener('keydown', event => {
      switch (event.key) {
        case 'ArrowLeft':
          previousImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        default:
          break;
      }
    });

  } catch (error) {
    console.error('Error reading the directory:', error);
  }
});
