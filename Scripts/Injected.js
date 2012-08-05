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
nubilusAds = ['mbEnd', 'taw', 'tadsb'];

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
function get(key){
    return JSON.parse(localStorage.getItem(key));
}

function set(key, value){
    localStorage.setItem(key, JSON.stringify(value));
}

/*********************************************

Generic functions

*********************************************/

/*
    Get the hostname from a string
    source: http://beardscratchers.com/journal/using-javascript-to-get-the-hostname-of-a-url
*/
String.prototype.getHostname = function () {
    var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
    return this.match(re)[1].toString();
}

/*
    De-googlize and normalize the URL
*/
function normalizeURL(url) {
    url = url.toString();
    // google click tracker BS
    if (url.getHostname() == 'www.google.com') {  // get the real URL from google click-track
        url = unescape(url.match(/[?&]url=([^&$]*)/i)[1]);
        domain = url.getHostname();
    } else {  // normal URL, so no change
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
    parentList.classList.add("nubilus-result-blocked");
    parentList.classList.remove("nubilus-result-unblocked");
*/
function blockAds() {
    nubilusAds.forEach(function(item) { 
        try {
            document.getElementById(item).classList.add("nubilus-hide");
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
    nubilusAds.forEach(function(item) {
        try {
            document.getElementById(item).classList.remove("nubilus-hide");
        } catch (err) {
            //console.log("******************************");
            //console.log("    Error in unblockAds");
            //console.log(err);
        }
    });
}





/*
Hides the search results in our block list
*/
function blockSearchResults() {
    // ignore the google blank page
    if (document.URL == "http://www.google.com/blank.html"){
        //alert('blank');
        return;
    }
    try {
        //alert('not blank');
        searchResults = document.getElementById('ires').firstElementChild;
        siteResults = searchResults.getElementsByTagName('cite');
        //alert(siteResults.length)
        //for (var i = 0; i < siteResults.length; i++) {
        //    siteResults[i].style.display = "none";
        //}
        for (var i = 0; i < siteResults.length; i++) {
            resultHandle = siteResults[i];
            result = siteResults[i].innerText.match(/([^/ ]+)/i)[1];
            // open our blocklist up
            var blockList = JSON.parse(localStorage.getItem('blocked'));
            //var blockList = get('blocked');
            // see if the domain exists
            if (blockList.indexOf(result) > -1) {
                blockContent(resultHandle);
            }
        }
        console.log('adding block messages')
        addBlockMessages();
    } catch (err) {
        console.log("******************************");
        console.log(" Error in blockSearchResults");
        console.log(err);
    }
}

/*
Adds a block message to each search result item
*/
function addBlockMessages() {
    var searchResults = document.getElementById('ires').firstElementChild;
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
        if (siteResults[i].getElementsByClassName('nubilus-block-me').length > 0) {
            blockMessage = siteResults[i].getElementsByClassName('nubilus-block-me')[0]
        } else {
            blockMessage = document.createElement('a');
            result.appendChild(blockMessage);
        }

        // already been blocked, so create our unblock message
        if (parentList.classList.contains("nubilus-result-blocked")) {
            blockMessage.textContent = "- Show " + blockURL;
            blockMessage.removeEventListener("click", blockContent, true);
            blockMessage.addEventListener("click", unblockContent, true);
        }
        // not blocked, create our block message
        else {
            blockMessage.textContent = "- Hide " + blockURL;
            blockMessage.removeEventListener("click", unblockContent, true);
            blockMessage.addEventListener("click", blockContent, true);
        }
        blockMessage.classList.add("nubilus-block-me");
        blockMessage.setAttribute("data-source", blockURL);
    }
    checkBlockedContent();
}

// adds our blocked domain to local storage and passes the
//   appropriate domain off to the blocker.
function blockContent(element) {
    // hacky. i could split this up into 2 functions but i'd prefer to figure out
    //   how to trigger a mouse event from block search
    // this is triggered only by manual blocking
    if (element.constructor === MouseEvent) {
        // when our element is not an element, make it an element
        const element = element.target;
        // add to local storage
        addToBlockList(element.getAttribute("data-source"));
    }
    // remove the blockContent listener, because the content is already blocked
    var parentList = element.parentElement.parentElement.parentElement.parentElement;
    // for some reason, blocking picks up a DIV
    if (parentList.tagName == "DIV") {
        parentList = parentList.parentElement;
    }
    parentList.classList.add("nubilus-result-blocked");
    parentList.classList.remove("nubilus-result-unblocked");
    parentList.style.display = "none"; // manual display, since that's how we active the temporary show
    addBlockMessages();
}

// unblocks already blocked content
function unblockContent(event) {
    const element = event.target;
    // remove from local storage
    removeFromBlockList(element.getAttribute("data-source"));
    // block the result
    var parentList = element.parentElement.parentElement.parentElement.parentElement.parentElement;
    parentList.classList.remove("nubilus-result-blocked");
    parentList.classList.add("nubilus-result-unblocked");
    addBlockMessages();
}


// does a simple check to see if we need a trigger to allow unblocking
function checkBlockedContent() {
    // attempt to remove any existing info box if no results are blocked
    if (document.getElementsByClassName('nubilus-result-blocked').length == 0) {
        try {
            parent = document.getElementById('ires');
            child = document.getElementById('nubilus-block-box');
            parent.removeChild(child);
        } catch (err) {
            // fails silently in the corner
        }
    } else {
        if (document.getElementById('nubilus-block-box')) {
            // nothing to see here. yet. maybe       
        } else { // create a block box with data
            blockBox = document.createElement('a');
            blockBox.setAttribute("id", "nubilus-block-box");
            document.getElementById('ires').appendChild(blockBox)
            //document.getElementById('nubilus-block-box')
        }
        searchResults = document.getElementById('nubilus-block-box');
        blockBox.classList.add("nubilus-block-box");
        blockBox.textContent = "Your personal blocklist hid some results. Click this text to view or edit your blocked results.";
        blockBox.addEventListener("click", displayBlockedResults, true);
    }
}

function displayBlockedResults() {
    var blockedResults = document.getElementsByClassName('nubilus-result-blocked');
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
displayAds();
blockSearchResults();