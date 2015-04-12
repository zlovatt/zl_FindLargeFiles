/**********************************************************************************************
    zl_FindLargeFiles
    Copyright (c) 2013 Zack Lovatt. All rights reserved.
    zack@zacklovatt.com

    Name: zl_FindLargeFiles
    Version: 0.1
 
    Description:
        This script sets the label colour for all selected items as specified.
        If a folder is in the selection, the script will recursively search through
        and find all items within that folder.
        
        Useful for when importing existing projects/AEPs, to set the label colour
        in one fell swoop for all imported objects.
        
        Originally requested by Ronald Molina (ronalith.com)

        This script is provided "as is," without warranty of any kind, expressed
        or implied. In no event shall the author be held liable for any damages 
        arising in any way from the use of this script.
        
**********************************************************************************************/

    var zl_FLF__scriptName = "zl_FindLargeFiles";
    
	/****************************** 
        zl_FindLargeFiles()
	
        Description:
        This function contains the main logic for this script.
	 
        Parameters:
        thisObj - "this" object.
        sizeInput - array of size input
        useRes - use resolution (vs file size)
        isMB - use mb (vs gb)
	 
        Returns:
        Nothing.
	******************************/
    function zl_FindLargeFiles(thisObj, sizeInput, useRes, isMB){
        var projItems = app.project.items;
        
        if (useRes)
            var moveArray = zl_FindLargeFiles_buildResArray(projItems, sizeInput);
        else
            var moveArray = zl_FindLargeFiles_buildFSizeArray(projItems, sizeInput, isMB);
            
        zl_FindLargeFiles_moveItems(moveArray);
        
    } // end function FindLargeFiles


    /****************************** 
        zl_FindLargeFiles_buildResArray()
          
        Description:
        Builds array of items to move based on resolution.
        Looks at footage, solids, placeholders.
         
        Parameters:
        projItems - collection of all project items
        sizeInput - array of size input
        
        Returns:
        Array of items to move
     ******************************/
    function zl_FindLargeFiles_buildResArray(projItems, sizeInput){

        var moveArray = [];
        var k = 0;

        for (var i = 1; i <= projItems.length; i++){
            var thisItem = projItems[i];
    
            if (thisItem instanceof FootageItem)
                if (thisItem.width >= sizeInput[0])
                    if (thisItem.height >= sizeInput[1]){
                        moveArray[k] = thisItem;
                        k++
                    }
        }
    
        return moveArray;
    } // end function buildResArray

    /****************************** 
        zl_FindLargeFiles_buildFSizeArray()
          
        Description:
        Builds array of items to move based on file size.
        Only looks at footage items.
         
        Parameters:
        projItems - collection of all project items
        sizeInput - array of size input (length 1 for fs)
        isMB - use mb (vs gb)
        
        Returns:
        Array of items to move
     ******************************/
    function zl_FindLargeFiles_buildFSizeArray(projItems, sizeInput, isMB){

        if (isMB)
            var sizeMult = 1048576; // byte to MB 
        else
            var sizeMult = 1073741824; // byte to GB

        var moveArray = [];
        var k = 0;

        for (var i = 1; i <= projItems.length; i++){
            var thisItem = projItems[i];
    
            if (thisItem instanceof FootageItem)
                if (!((thisItem.mainSource instanceof SolidSource) || (thisItem.mainSource instanceof PlaceholderSource))){ // is footage
                    var fileSize = thisItem.file.length / sizeMult;
                    if (fileSize > sizeInput){
                        moveArray[k] = thisItem;
                        k++
                    }
                }
        }
    
        return moveArray;
    } // end function buildFSizeArray
    
    
    /****************************** 
        zl_FindLargeFiles_moveItems()
          
        Description:
        Creates folder & moves target items in
         
        Parameters:
        moveArray - array of items to move
        
        Returns:
        Nothing.
     ******************************/
    function zl_FindLargeFiles_moveItems(moveArray){
        
        if (!(moveArray.length == 0)){
            var newFolder = app.project.items.addFolder("! Large Items")

            for (var i = 0; i < moveArray.length; i++){
                moveArray[i].parentFolder = newFolder;
            }
        } else {
            alert("Nothing to move!", zl_FLF__scriptName);
        }
    } // end function moveItems


    /****************************** 
        zl_FindLargeFiles_createPalette()
          
        Description:
        Creates ScriptUI Palette Panel
        Generated using Boethos (crgreen.com/boethos)
        
        Parameters:
        thisObj - this comp object
        
        Returns:
        Nothing
     ******************************/
    function zl_FindLargeFiles_createPalette(thisObj) { 
        var win = (thisObj instanceof Panel) ? thisObj : new Window('palette', 'Find Large Files',undefined); 
      
        var tPanel = win.add ("tabbedpanel");
        
        function checkStr (str) {
            try {
                var array = str.split(" ");
                var num = String (Number (array[0]));
                if (isNaN(num))
                    throw new Error("Not a number");
                return num;
            } catch (_) {
                return NaN;
            }
        } // end checkStr
        
        { // File Size Tab
            tPanel.fSizeTab = tPanel.add('tab', undefined, 'File Size');
            
            { // sizeRow
                tPanel.fSizeTab.sizeRow = tPanel.fSizeTab.add('group');
                    tPanel.fSizeTab.sizeLabel = tPanel.fSizeTab.sizeRow.add('statictext', undefined, 'File Size:'); 
                    tPanel.fSizeTab.sizeInput = tPanel.fSizeTab.sizeRow.add('edittext', undefined, '100'); 
                    tPanel.fSizeTab.sizeInput.characters = 4;
            }
        
            { // dimRow
                tPanel.fSizeTab.dimRow = tPanel.fSizeTab.add('group');
                    tPanel.fSizeTab.dimRow.mbSwitch = tPanel.fSizeTab.dimRow.add('radiobutton', undefined, 'MB'); 
                    tPanel.fSizeTab.dimRow.gbSwitch = tPanel.fSizeTab.dimRow.add('radiobutton', undefined, 'GB');
                    tPanel.fSizeTab.dimRow.mbSwitch.value = true;
            }

        }
    
        { // Resolution Tab
            tPanel.resTab = tPanel.add('tab', undefined, 'Resolution');
            tPanel.resTab.alignChildren = ["fill", "right"];
            tPanel.resTab.orientation = "row";
            
            { // textcolumn
                tPanel.resTab.textColumn = tPanel.resTab.add('group');
                tPanel.resTab.textColumn.orientation = "column";
                tPanel.resTab.textColumn.alignChildren = "right";
                
                    tPanel.resTab.textColumn.widthLabel = tPanel.resTab.textColumn.add('statictext', undefined, 'Width:'); 
                    tPanel.resTab.textColumn.heightLabel = tPanel.resTab.textColumn.add('statictext', undefined, 'Height:'); 
            }
        
            { // inputColum
                tPanel.resTab.inputColumn = tPanel.resTab.add('group');
                tPanel.resTab.inputColumn.orientation = "column";
                tPanel.resTab.inputColumn.alignChildren = "left";
                
                    tPanel.resTab.inputColumn.widthInput = tPanel.resTab.inputColumn.add('edittext', undefined, '1920'); 
                    tPanel.resTab.inputColumn.widthInput.characters = 4;
                    tPanel.resTab.inputColumn.heightInput = tPanel.resTab.inputColumn.add('edittext', undefined, '1080'); 
                    tPanel.resTab.inputColumn.heightInput.characters = 4;
            }
        }
    
        { // Buttons
            win.colourButton = win.add('button', undefined, 'Find Large Files'); 
            win.colourButton.alignment = 'fill';

            win.colourButton.onClick = function () {
                var useRes = false;
                var isMB = true;
            
                if (tPanel.selection.text == tPanel.children[0].text){ // If file size
                    var sizeInput = checkStr(tPanel.fSizeTab.sizeInput.text);
                    if (tPanel.fSizeTab.dimRow.gbSwitch.value)
                        isMB = false;
                } else {
                    var widthVal = checkStr(tPanel.resTab.inputColumn.widthInput.text);
                    var heightVal = checkStr(tPanel.resTab.inputColumn.heightInput.text);
                
                    var sizeInput = [widthVal, heightVal];
                    useRes = true;
                }
                
                if (app.project) {
                    if (!(app.project.numItems == 0)){
                        app.beginUndoGroup(zl_FLF__scriptName);
                        zl_FindLargeFiles(thisObj, sizeInput, useRes, isMB);
                        app.endUndoGroup();
                    } else {
                        alert("Project is empty!", zl_FLF__scriptName);
                    }
                } else {
                    alert("Open a project!", zl_FLF__scriptName);
                }
            }
        } // end Buttons

        if (win instanceof Window) {
            win.show();
        } else {
            win.layout.layout(true);
        }
    } // end function createPalette


    /****************************** 
        zl_FindLargeFiles_main()
          
        Description:
        Main function
            
        Parameters:
        thisObj - this comp object
        
        Returns:
        Nothing
     ******************************/
    function zl_FindLargeFiles_main(thisObj) {
        zl_FindLargeFiles_createPalette(thisObj);
    } // end function main


    // RUN!
    zl_FindLargeFiles_main(this);