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
    const acceptedExtensions = ['.jpg', '.png', '.svg'];
    const images = files.filter(file => acceptedExtensions.includes(path.extname(file)));

    console.log('Number of files in the folder:', files.length);
    console.log('Files in the folder:', files);

    let i = 0;
    document.getElementById('image-display').src = directoryPath + files[i];
    dimensions();

    const nextImage = document.getElementById('iconRight');
    nextImage.addEventListener('click', () => {
      i++;
      dimensions();
      if (i >= 0 && i < files.length) {
        document.getElementById('image-display').src = directoryPath + '\\' + files[i];
      } else if (i < 0) {
        i = 0;
        ipcRenderer.send('outOfRange');
      } else {
        i = files.length - 1;
        ipcRenderer.send('outOfRange');
      }
    });

    const previousImage = document.getElementById('iconLeft');
    previousImage.addEventListener('click', () => {
      i--;
      dimensions();
      if (i >= 0 && i < files.length) {
        document.getElementById('image-display').src = directoryPath + '\\' + files[i];
      } else {
        ipcRenderer.send('outOfRange');
      }
    });

    async function dimensions() {
      const filePath = directoryPath + files[i];
      const metadata = await sharp(filePath).metadata();
      const fileSize = (await fs.stat(filePath)).size;
      const fileSizeInKB = (fileSize / 1024).toFixed(2); // Convert bytes to kilobytes
  
      const width = metadata.width;
      const height = metadata.height;
      const name = files[i];
  
      ipcRenderer.send('imageInfo', width, height, name, fileSizeInKB);
      document.getElementById("nameImg").innerHTML = `Name: ${name}`;
      document.getElementById("heightPx").innerHTML = `Height: ${height} px`;
      document.getElementById("widthPx").innerHTML = `Width: ${width} px`;
      document.getElementById("kbs").innerHTML = `Size: ${fileSizeInKB} KB`;
  
      let ImgPlace = document.getElementById('image-display');
  
      const desiredWidth = 1332;
      const desiredHeight = 682.69;
  
      // Calculate the original image ratio
      const originalRatio = width / height;
  
      // Calculate the new dimensions respecting the limit
      let newWidth, newHeight;
      if (originalRatio > desiredWidth / desiredHeight) {
          newWidth = desiredWidth;
          newHeight = desiredWidth / originalRatio;
      } else {
          newHeight = desiredHeight;
          newWidth = desiredHeight * originalRatio;
      }
  
      // Set the new dimensions of the image
      ImgPlace.style.width = newWidth + 'px';
      ImgPlace.style.height = newHeight + 'px';
  }
  
  } catch (error) {
    console.error('Error reading the directory:', error);
  }
});
