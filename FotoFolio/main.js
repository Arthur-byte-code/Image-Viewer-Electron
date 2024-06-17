const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const ipc = ipcMain;
const { electron } = require('process');

// Variable to track if the explorer is currently open
let explorerOpened = false;

// Function to create the main window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'Symbol.png'), // Load the application icon
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load the HTML file of the main window
  mainWindow.loadFile('index.html');
  mainWindow.removeMenu();

  // Open the file explorer when the app is ready
  ipcMain.on('openExplorer', () => {
    if (explorerOpened) {
      return; // If explorer is currently open, do nothing
    }

    explorerOpened = true; // Set the explorer as open
    console.log("Clicked successfully");

    dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory'],
    }).then(result => {
      explorerOpened = false; // Reset the explorerOpened flag
      // Check if the user selected any file or folder
      if (!result.canceled) {
        // Do whatever you need with the selected file or folder path
        // Send the path
        mainWindow.webContents.on('did-finish-load', () => {
          mainWindow.webContents.send('load_folder', result.filePaths);
          console.log(`The path sent to ipcRenderer was ---> ${result.filePaths}`);
        });
        mainWindow.reload();

        ipcMain.on('outOfRange', () => {
          mainWindow.setEnabled(false); // Disable the main window
          dialog.showErrorBox('Error', 'No images in this direction ☹');
          mainWindow.focus();
          mainWindow.setEnabled(true); // Re-enable the main window
        });

        ipcMain.on('imageInfo', (event, width, height, name, photoSize) => {
          console.log(`Width -> (${width}), Height -> (${height}), Image Name -> (${name}), Size -> (${photoSize})`);
        });
      } else {
        console.log('No file or folder selected');
      }
    }).catch(err => {
      explorerOpened = false; // Reset the explorerOpened flag in case of an error
      console.log('Error opening the dialog:', err);
    });
  });
}

// App ready event
app.on('ready', () => {
  createWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, it's common for applications to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, it's common to re-create a window when the dock icon is clicked and there are no other open windows.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
