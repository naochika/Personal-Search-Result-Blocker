/*

Our Injected.js page:

- Can NOT interact with the Safari settings directly
- CAN interact with the web page directly
- CAN interact with Safari settings via messages
- CAN interact with the Global.html page via messages
- Does all the heavy JS lifting

To do:

- Move heavy lifting to Global.html page
- Add feature for dimming rather than blocking
- Add a remote sync feature
- More complex ad-block features

Credits:

- Code beautified via http://jsbeautifier.org/
- hostname function via http://beardscratchers.com/journal/using-javascript-to-get-the-hostname-of-a-url

*/

/*
variables
*/
jaydorseyAds = ['mbEnd', 'taw', 'tadsb'];

/*********************************************

localStorage functions

*********************************************/

/*
    Add a blocked domain to local storage
*/

function addToBlockList(domain) {
    /*
        remote add
    */
    // grab current URL
    //var currentPage = window.location.href;
    // open page to remote URL


    //console.log('block domain in injected');
    //safari.self.tab.dispatchMessage("block-domain", domain);


    //remoteStorage = window.open('http://127.0.0.1:4567/add/'+domain);

    //remoteStorage.close();
    // redirect back to current URL
    //window.open(currentPage);
    /*
        local add
    */
    var blockList = JSON.parse(localStorage.getItem('blocked'))
    if (blockList.indexOf(domain) == -1) { // domain does not exist in blocklist
        blockList.push(domain);
    }
    localStorage.setItem('blocked', JSON.stringify(blockList))
}

/*
    Remove a blocked domain from local storage
*/
// remove an item from local storage

function removeFromBlockList(domain) {
    var blockList = JSON.parse(localStorage.getItem('blocked'));
    if (blockList.indexOf(domain) > -1) {
        blockList.splice(blockList.indexOf(domain), 1);
    }
    localStorage.setItem('blocked', JSON.stringify(blockList));
}

/*
    reset all of our localStorage settings, or set logical defaults
*/

function resetLocalStorage() {
    console.log("******************************");
    console.log("   Resetting localStorage");
    console.log("******************************");
    localStorage.setItem('blocked', JSON.stringify([]));
    localStorage.setItem('reset', JSON.stringify(false));
}

/*

*/

function get(key) {
    return JSON.parse(localStorage.getItem(key));
}

function set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

/*********************************************

Generic functions

*********************************************/

/*
    Get the hostname from a string
    source: http://beardscratchers.com/journal/using-javascript-to-get-the-hostname-of-a-url
*/
String.prototype.getHostname = function() {
    var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
    return this.match(re)[1].toString();
}

/*
    De-googlize and normalize the URL
*/

function normalizeURL(url) {
    url = url.toString();
    // google click tracker BS
    if (url.getHostname() == 'www.google.com') { // get the real URL from google click-track
        url = unescape(url.match(/[?&]url=([^&$]*)/i)[1]);
        domain = url.getHostname();
    } else { // normal URL, so no change
        domain = url.getHostname();
    }
    return [url, domain];
}





/*********************************************

    Ad-blocking functions. This is *really* generic ad-blocking.

*********************************************/

/*
    Do we block ads or not?
*/

function displayAds() {
    switch (get('displayAds')) {
        case true:
            unblockAds();
            break;
        default:
            blockAds();
            break;
    }
}

/*
    Block the 2 ad elements on the page
    parentList.classList.add("jaydorsey-result-blocked");
    parentList.classList.remove("jaydorsey-result-unblocked");
*/

function blockAds() {
    jaydorseyAds.forEach(function(item) {
        try {
            document.getElementById(item).classList.add("jaydorsey-hide");
        } catch (err) {
            console.log("******************************");
            console.log("     Error in blockAds");
            console.log(err);
        }
    });
}

/*
    Unblock the 2 ad elements on the page
*/

function unblockAds() {
    jaydorseyAds.forEach(function(item) {
        try {
            document.getElementById(item).classList.remove("jaydorsey-hide");
        } catch (err) {
            //console.log("******************************");
            //console.log("    Error in unblockAds");
            //console.log(err);
        }
    });
}





/*
Does all the pre-work for blocking search results
*/

function preloadBlockResults() {
    // ignore the google blank page
    if (document.URL == "http://www.google.com/blank.html") {
        //alert('blank');
        return;
    }
    try {
        // get the OL containing the LI search result items
        searchResultsContainer = document.getElementById('ires').firstElementChild;
        searchResults = searchResultsContainer.getElementsByTagName('cite');

        for (var i = 0; i < searchResults.length; i++) {
            resultHandle = searchResults[i];
            url = resultHandle.innerText.match(/([^/ ]+)/i)[1];
            // assigns our default styling
            // check this laterunblockContent(resultHandle, url, false);

            initializeHandle(resultHandle);

            // add a placeholder for our unblock text
            //document.getElementById('ires').appendChild(blockBox)

            // open our blocklist up
            var blockList = JSON.parse(localStorage.getItem('blocked'));

            // see if the domain exists in our block list
            if (blockList.indexOf(url) > -1) {
                // if so, block it
                blockContent(resultHandle, url);
            }
            else {
                unblockContent(resultHandle, url);
            }
        }
        console.log('adding block messages')
        //blockFromList();
    } catch (err) {
        console.log("******************************");
        console.log(" Error in blockSearchResults");
        console.log(err);
    }
}

//creates an empty span so we can block/unblock
function initializeHandle(handle){
    var parentListItem = identifyListItem(handle);
    var h3 = parentListItem.getElementsByTagName('h3')[0];

    var jspan = document.createElement('span');
    //jspan.classList.add("jaydorsey-block-me");
    jspan.classList.add("jaydorsey-handle");
    //jspan.innerHTML = ("&#x1f6ab;");  // 2705 for add back
    //jspan.addEventListener("click", blockContent, true);
    h3.appendChild(jspan);
}
/*
Takes the pre-loaded list and makes sure the results are hidden
This is DEPRECATED
*/

function blockFromList() {
    var searchResults = document.getElementById('ires').firstElementChild;
    // this is each individual site result
    var siteResults = searchResults.getElementsByTagName('cite');

    for (var i = 0; i < siteResults.length; i++) {
        result = siteResults[i];
        /*
      this should be the parent element a few nodes up

      this element will hold the custom css class we use to determine whether an
      element was blocked or not.
      */
        parentList = result.parentElement.parentElement.parentElement.parentElement;
        blockURL = result.innerText.match(/([^/ ]+)/i)[1]; // URL to block

        // check if we've already created a "Block [site]" message, if so overwrite
        if (result.getElementsByClassName('jaydorsey-block-me').length > 0) {
            var blockMessage = siteResults[i].getElementsByClassName('jaydorsey-block-image')[0]
        } else {
            var blockMessage = document.createElement('img');
            blockMessage.classList.add('jaydorsey-block-image')
            result.appendChild(blockMessage);
        }

        // already been blocked, so create our unblock message
        if (parentList.classList.contains("jaydorsey-result-blocked")) {
            blockMessage.classList.add("jaydorsey-unblock-image");
            blockMessage.alt = "Show " + blockURL;
            blockMessage.removeEventListener("click", blockContent, true);
            blockMessage.addEventListener("click", unblockContent, true);
        }
        // not blocked, create our block message
        else {
            blockMessage.alt = "Block " + blockURL;
            //blockMessage.classList.add("jaydorsey-block-image");
            blockMessage.removeEventListener("click", unblockContent, true);
            blockMessage.addEventListener("click", blockContent, true);
        }
        blockMessage.setAttribute("data-source", blockURL);
    }
    checkBlockedContent();
}


var identifyListItem = function(el) {
    if (el.nodeName != "LI"){//} && el.className != "g"){
        return identifyListItem.call(this, el.parentElement);
    }
    else{
        return el;
    }
}




function blockContent(element, url) {
    // hacky. i could split this up into 2 functions but i'd prefer to figure out
    //   how to trigger a mouse event from block search
    // this is triggered only by manual blocking
    if (element.constructor === MouseEvent) {
        // when our element is not an element, make it an element
        const element = element.target;
        // add to local storage
        // ONLY if we've clicked though
        addToBlockList(element.getAttribute("data-source"));
    }
    // remove the blockContent listener, because the content is already blocked
    // parentList is the container LI that holds the result information
    parentList = identifyListItem(element);
    parentList.classList.add("jaydorsey-result-blocked");

    var jspan = parentList.getElementsByClassName('jaydorsey-handle')[0];
    jspan.innerHTML = ("&#x2705;");
    jspan.parentElement.style.overflow = "visible"
    jspan.classList.remove("jaydorsey-block-me");
    jspan.classList.add("jaydorsey-unblock-me");

    jspan.removeEventListener("click", blockContent, true);
    jspan.addEventListener("click", unblockContent, true);

    jspan.setAttribute("data-source", url);
/*
    var itemArray = safari.extension.toolbarItems;
    alert(itemArray.length);
    for (var i = 0; i < itemArray.length; ++i) {
        var item = itemArray[i];
        if (item.identifier == "testmeni"){
            item.badge = item.badge + 1;
        }
    }
    */
    //parentList.classList.remove("jaydorsey-result-unblocked");
    //parentList.style.display = "none"; // manual display, since that's how we activate the temporary show
    //addBlockMessages();
}



// unblocks already blocked content

function unblockContent(element, url, storage) {
    if (element.constructor === MouseEvent) {
        // when our element is not an element, make it an element
        const element = element.target;
        // add to local storage
        // ONLY if we've clicked though
        //addToBlockList(element.getAttribute("data-source"));
        //alert(element.getAttribute("data-source"));
        removeFromBlockList(element.getAttribute("data-source"));
    }

    // remove from local storage
    if (storage === true){
// remove
    }

    // block the result
    parentList = identifyListItem(element);
    parentList.classList.remove("jaydorsey-result-blocked");

    var jspan = parentList.getElementsByClassName('jaydorsey-handle')[0];

    jspan.innerHTML = ("&#x1f6ab;");
    jspan.parentElement.style.overflow = "visible"
    jspan.classList.remove("jaydorsey-unblock-me");
    jspan.classList.add("jaydorsey-block-me");

    jspan.removeEventListener("click", unblockContent, true);
    jspan.addEventListener("click", blockContent, true);

    jspan.setAttribute("data-source", url);

    //addBlockMessages();
}


// does a simple check to see if we need a trigger to allow unblocking

function checkBlockedContent() {
    // attempt to remove any existing info box if no results are blocked
    if (document.getElementsByClassName('jaydorsey-result-blocked').length == 0) {
        try {
            parent = document.getElementById('ires');
            child = document.getElementById('jaydorsey-block-box');
            parent.removeChild(child);
        } catch (err) {
            // fails silently in the corner
        }
    } else {
        if (document.getElementById('jaydorsey-block-box')) {
            // nothing to see here. yet. maybe
        } else { // create a block box with data
            blockBox = document.createElement('a');
            blockBox.setAttribute("id", "jaydorsey-block-box");
            document.getElementById('ires').appendChild(blockBox)
            //document.getElementById('jaydorsey-block-box')
        }
        searchResults = document.getElementById('jaydorsey-block-box');
        blockBox.classList.add("jaydorsey-block-box");
        blockBox.textContent = "Your personal blocklist hid some results. Click this text to view or edit your blocked results.";
        blockBox.addEventListener("click", displayBlockedResults, true);
    }
}

function displayBlockedResults() {
    var blockedResults = document.getElementsByClassName('jaydorsey-result-blocked');
    for (var i = 0; i < blockedResults.length; i++) {
        blockedResults[i].style.display = "block";
    }
}

// initializes our settings, also used as reset in case of failure

function checkReset() {
    try {
        if (localStorage.getItem('blocked') == null) {
            resetLocalStorage();
        }
    } catch (err) {
        console.log("******************************");
        console.log("    Resetting localStorage");
        console.log(err);
        resetLocalStorage();
    }
}

function handleMessage(msgEvent) {
    var messageName = msgEvent.name;
    var messageData = msgEvent.message;
    if (messageName === "resetMessageFromGlobal") {
        if (messageData === "true") {
            // reset local Storage;
            resetLocalStorage();
        }
    }
    if (messageName === "toggleAdsFromGlobal") {
        if (messageData === true) {
            set('displayAds', true);
        } else {
            set('displayAds', false)
        }
        displayAds();
    }
}


/*********************************************

Listener for recieving messages.

*********************************************/

safari.self.addEventListener("message", handleMessage, false);


/*********************************************

Call these on each page load.

*********************************************/
checkReset();
//displayAds();
preloadBlockResults();
//blockSearchResults();
