const { app, BrowserWindow } = require('electron');
const path = require('path');
const osu = require('os-utils');
const cct = require('cpu-clock-ticks');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Only Linux
  freeCommand = function(callback){
    require('child_process').exec('free -m', function(error, stdout, stderr) {
       
       var lines = stdout.split("\n");
       
       
       var str_mem_info = lines[1].replace( /[\s\n\r]+/g,' ');
       
       var mem_info = str_mem_info.split(' ')
      
       total_mem    = parseFloat(mem_info[1])
       used_mem     = parseFloat(mem_info[2])
       free_mem     = parseFloat(mem_info[3])
       shared_mem   = parseFloat(mem_info[4])
       buffers_mem  = parseFloat(mem_info[5])
       cached_mem   = parseFloat(mem_info[6])

       total_used_mem = (used_mem + shared_mem)
       
       callback(total_used_mem, cached_mem);
    });
}

  setInterval(() => {
    osu.cpuUsage(function(v){
      mainWindow.webContents.send('cpu-count', osu.cpuCount());
      mainWindow.webContents.send('cpu-freq', cct())
      mainWindow.webContents.send('cpu',v*100);
      freeCommand(function(um, am){mainWindow.webContents.send('umem',um/1024);mainWindow.webContents.send('amem',am/1024);});
      mainWindow.webContents.send('total-mem',osu.totalmem()/1024);
    });
  },1000);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
