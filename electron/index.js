'use strict';
const electron = require('electron');
const path = require('path');
const { join } = require('path');
const db = require('electron-db');
const { each } = require('svelte/internal');

const {app, BrowserWindow, ipcMain} = electron;
const isDev = !app.isPackaged;

app.whenReady().then(main);

let window;

function main() {
    window = new BrowserWindow({
        width: 700,
        height: 520,
        show: false,
        webPreferences: {
            preload: join(__dirname, "./preload.js"),
        }
    });

    window.loadFile(path.join(__dirname, "../public/index.html"))

    window.removeMenu();

    window.on("ready-to-show", window.show);

    window.on('closed', function(){
        app.quit();
    });

    if (isDev) window.webContents.openDevTools();
}

//creates database in app folder if it not already exist
const dbLocation = path.join(__dirname, '');
const dbName = 'lists';
let dblength;

db.createTable(dbName, dbLocation, (succ, msg) => {
    // succ - boolean, tells if the call is successful
    if (succ) {
        console.log(msg)
    } else {
        console.log('An error has occured. ' + msg)
    }
})

db.count(dbName, dbLocation, (succ, data) => {
    if (succ) {
        dblength = data;
    } else {
        console.log('An error has occured.')
        console.log(data)
    }
});


function sendListsData() {
    db.getAll(dbName, dbLocation, (succ, data) => {
        window.webContents.send("lists-data", data);
    })
}

ipcMain.on("read-lists", (event, args) => {
    sendListsData();   
});

ipcMain.on("add-list", (event, obj) => {
    let data = { id: 0, name: obj.name, items: []};
    db.insertTableContent(dbName, dbLocation, data, (succ, msg) => {
        console.log("Message: " + msg);
    });
    sendListsData();
});

ipcMain.on("delete-list", (event, id) => {
    db.deleteRow(dbName, dbLocation, {"id": id}, (succ, msg) => {
        console.log(msg);
    });
    sendListsData();
});

function refreshActiveList(listId) {
    db.getRows(dbName, dbLocation, {"id": listId}, (succ, data) => {
        if (succ) {
            window.webContents.send("refresh-active-list", data[0]);
        }
    });
    sendListsData();
}

ipcMain.on("add-item", (event, listId, obj) => {
    let items;
    //getting the current item array from db
    db.getRows(dbName, dbLocation, {"id": listId}, (succ, data) => {
        if (succ) {
            items = data[0].items;
        }
    });
    //getting the Id for the new item
    let newId = items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
    //pushing the new item to the array
    items.push( {id: newId, name: obj.name} );
    //overwriting the current array with the new array in the db
    let where = { id: listId };
    let set = { items: items };
    db.updateRow(dbName, dbLocation, where, set, (succ, msg) => {
        console.log("Message: " + msg);
    });
    refreshActiveList(listId);
});

ipcMain.on("delete-item", (event, listId, itemId) => {
    let items;
    //getting the current item array from db
    db.getRows(dbName, dbLocation, {"id": listId}, (succ, data) => {
        if (succ) {
            items = data[0].items;
        }
    });
    //goes through each item and compares the id to the one that should be removed
    items.forEach(element => {
        if (itemId == element.id) {
            //overwrites the items with all items except the one that was found to be removed
            items = items.filter(item => item != element);
            return
        }
    });
    //overwriting the current array with the new array in the db
    let where = { id: listId };
    let set = { items: items };
    db.updateRow(dbName, dbLocation, where, set, (succ, msg) => {
        console.log("Message: " + msg);
    });
    refreshActiveList(listId);
});
