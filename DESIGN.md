# Design Document

**Mysti** is built with React.js and Electron. I chose Electron specifically because I was thinking of an app that could easily be transferred over to other platforms besides Mac OS, and I chose React because it worked well with Electron and I wanted to change elements dynamically.

Mysti originated from a small script that I created for myself to organize screenshots that I took during Zoom lectures. This script was written with Node.js, and used a library called `chokidar` which allowed me to detect whenever a file was created or changed in a given directory.

### The filter system

The main feature, or perhaps even the Minimal Viable Project (MVP) of Mysti is the filtering system, where users could create filters. Each filter is a Javascript object, with keys `filter` and `dir`, where `filter` is the regex pattern that matches a filename and `dir` is the relative directory where that file should go.

This is implemented in `src/server` as the `applyFilters` function. This function is only called when `chokidar` detects a change in the directory, and when there is a change (line 120 and line 126 of `main.js` in `src/server`) the path of the file is passed to the function. `applyFilters` splits this path into two parts: the path and the filename. The function goes through each of the filters one by one until it finds the filter that matches with the given filename (linear search). If the filename matches the regex pattern, the path is appended by the `dir` value of the filter as well as the name of the file and using the `fs` library from Node the function renames the file with this new path, which effectively moves it to this new directory.

### UI/UX

Mysti is set up so that the main app can have multiple directories, and for each directory, there can be multiple filters. As such, Mysti has three React.js components to reflect this structure.

1. The main, driver component
2. The `DirectoryItems` component
3. The `FilterItems` component

The driver component has several states, but the main ones are `page` and `dirs`. Changing the value of `page` will change the content that the user will see: -1 will show a loading screen, 0 will show the filters page, 1 will show logs, and 2 will show the abouts page. In the `render` function there are conditionals to check the value of `page` and depending on this value the function will return different HTML.

The `dirs` state is an array of all of the directories that the user wants Mysti to watch out for, and for each of these directories is an array of all the filters, or a Javascript object with `dir` and `filter` as mentioned above.

Each directory item is rendered as a card with the name of the directory in bold at the top left corner. Each filter item in the directory item is rendered as a `div` inside the card.  Both the `DirectoryItems` and `FilterItems` has an edit mode and a view mode, and the user can toggle this mode by clicking on the small edit icon (looks like a box with a pencil) next to the name of the directory or next to the filter overview. Clicking on this button will just change the value of the `edit` state, which will allow the `render` function to render the element differently. 

### Saving filters

The value of the  `dirs` state in the main component is what Mysti saves in the local cache so that when the user quits Mysti and opens it up again, their filters are not lost.

Saving filters, however, has been a difficult problem. In the earlier versions of Mysti, when the user makes a change to a specific directory (like changing the path of the directory), this only updates the values of the state within that specific `DirectoryItem` component but does not update the values of the directory item in the main component. Likewise, when a filter is updated, only the values within the `FilterItem` gets updated, and the `DirectoryItem` that contains this filter does not update, and neither does the `dirs` state in the main component.

I eventually solved this problem by passing in functions from the parent component to the child component as props: for instance, the main component would pass down `updateDir` as a prop to each `DirectoryItem`, and when the directory item changes values it can call this passed down function with the new values, which would update both the values in the `DirectoryItem` component and the values in the main component. I also applied this method to `FilterItem`.

Everytime the `dirs` state in the main component is updated, the renderer process would send a "signal" called `FILTERES_UPDATED`  to the server process through the `ipcRenderer` object along with the new, updated array of directories along with their filters. The server would then use the `electron-store` library to store it as a cache on the user's device.

### Loading filters

Everytime Mysti opens, Mysti will retrieve the array of directories that was saved and set the `dirs` state in the main component to this array. This data essentially "trickles" down the hierarchical tree. The `render` function creates `DirectoryItem` components from this array and pass the matching directory object to each of these components as props. The `componentWillReceiveProps` method in `DirectoryItem` will update the values of the states within this component, and in the `render` function of `DirectoryItem` it will also create new `FilterItem` components and pass down the filter data, and the `componentWillReceiveProps` method in `FilterItem` will also update the states with the passed down filter data.

### Logs

Logs were just recently implemented as it is likely that a user may miss the notifications or forget about certain filters and would have a hard time looking for where the files went. Everytime a file is moved, the server sends a signal `MOVED_SUCCESS`, and the client side, upon receiving this signal, will send out a notification and also push the data containing the file name and the new directory to a global array called `logs`. In the `render` function of the main component Mysti creates a card for each log item, setting the card title to the name of the file and the body of the card as a link to the directory of where the file has been moved.

### Flaws in design and future plans

Admittedly, there are some flaws in design that could be improved. Some of these include:

* React's `setState`, especially when used for updating filters or directories, does not let me change a specific element within an array of a state, so I have to copy the entire array, modify it, and set the state to this value. I have to use the `setState` function or React won't rerender the components or know that I updated the values. This is obviously not efficient and would slow down the program and would take up memory.
* The buttons are a little bit all over the place. Some are just icons, and some are buttons with texts, and it is a little inconsistent (the edit icons were also a new addition). The UI/UX will be cleaned up in the future.
* The logs can be filled up pretty quickly, and currently, as the logs page has just been implemented, there is no option for the user to save the logs or delete them.
* There is no way for the user to search for a certain file in the logs. That would be incredibly helpful if they were trying to find a file that they don't know where it went. 



