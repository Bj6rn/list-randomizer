const { contextBridge, ipcRenderer } = require('electron');

const API = {
    //sends Lists-Data to renderer everytime when something changed
    onListsData: (callback) => ipcRenderer.on("lists-data", (event, args) => {
        callback(args);
    }),
    //reads the list from database
    readListsData: (args) => ipcRenderer.send("read-lists", args),
    //adds new list to database
    addList: (obj) => ipcRenderer.send("add-list", obj),
    //removes list from database
    deleteList: (id) => ipcRenderer.send("delete-list", id),

    //sends Data of active List to renderer everytime when something changed
    refreshActiveList: (callback) => ipcRenderer.on("refresh-active-list", (event, args) => {
        callback(args);
    }),
    //adds item to a specific list in the database
    addItem: (listId, obj) => ipcRenderer.send("add-item", listId, obj),
    //removes items from a specific list in the database
    deleteItem: (listId, itemId) => ipcRenderer.send("delete-item", listId, itemId)
    
}

contextBridge.exposeInMainWorld("api", API);