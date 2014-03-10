/*

Our Injected.js page:

- Can NOT interact with the Safari settings directly
- CAN interact with the web page directly
- CAN interact with Safari settings via messages
- CAN interact with the Global.html page via messages
- Does all the heavy JS lifting

TODO:

- Move heavy lifting to Global.html page
- Add feature for dimming rather than blocking
- Add a remote sync feature
- More complex ad-block features

Credits:

- hostname function via http://beardscratchers.com/journal/using-javascript-to-get-the-hostname-of-a-url

*/


var jaydorseyAds = ['mbEnd', 'taw', 'tadsb'];
var badgeCount = 0;

alert('loading injected');

/*********************************************
localStorage functions
*********************************************/


// Add a blocked domain to local and remote storage

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

    // local add
    var blockList = JSON.parse(localStorage.getItem('blocked'));
    if (blockList.indexOf(domain) == -1) { // domain does not exist in blocklist
        blockList.push(domain);
    }
    localStorage.setItem('blocked', JSON.stringify(blockList));
}

// Remove a blocked domain from local and remote storage

function removeFromBlockList(domain) {
    var blockList = JSON.parse(localStorage.getItem('blocked'));
    if (blockList.indexOf(domain) > -1) {
        blockList.splice(blockList.indexOf(domain), 1);
    }
    localStorage.setItem('blocked', JSON.stringify(blockList));
}


/*********************************************
data functions
*********************************************/

// reset all of our localStorage settings, or set logical defaults

function resetLocalStorage() {
    //alert('resetting storage');
    console.log("******************************");
    console.log("   Resetting localStorage");
    console.log("******************************");
    localStorage.setItem('blocked', JSON.stringify([]));
    localStorage.setItem('reset', JSON.stringify(false));
}

// getter

function get(key) {
    return JSON.parse(localStorage.getItem(key));
}

// setter

function set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

/*********************************************
generic functions
*********************************************/

// Get the hostname from a string
// Credit: source: http://beardscratchers.com/journal/using-javascript-to-get-the-hostname-of-a-url
String.prototype.getHostname = function() {
    var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
    return this.match(re)[1].toString();
}
// De-googlize and normalize the URL

function normalizeURL(url) {
    url = url.toString();
    // google click tracker info
    if (url.getHostname() == 'www.google.com') { // get the real URL from google click-track
        url = unescape(url.match(/[?&]url=([^&$]*)/i)[1]);
        domain = url.getHostname();
    } else { // normal URL, so no change
        domain = url.getHostname();
    }
    return [url, domain];
}

// identifies the parent LI node
var identifyListItem = function(el) {
    if (el.nodeName != "LI") {
        return identifyListItem.call(this, el.parentElement);
    } else {
        return el;
    }
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
        alert('preloading');
        // ignore pages without the IRES element ID
        if (document.getElementById('ires') === null) {
            return;
        }
        try {
            // get the OL containing the LI search result items
            var searchResultsContainer = document.getElementById('ires').firstElementChild;
            var searchResults = searchResultsContainer.getElementsByTagName('cite'); // maybe change this to LI later
            // and add in inline--no need to set
            badgeCount = 0;
            for (var i = 0; i < searchResults.length; i++) {
                resultHandle = searchResults[i]; // this is the cite tag
                parentListItem = identifyListItem(resultHandle);
                h3 = parentListItem.getElementsByTagName('h3')[0];
                ahref = h3.getElementsByTagName('a')[0];
                test = normalizeURL(ahref.getAttribute('href'));
                url = test[1];

                //url = resultHandle.innerText.match(/([^/ ]+)/i)[1];
                // assigns our default styling
                // check this laterunblockContent(resultHandle, url, false);

                initializeHandle(resultHandle);
                alert('init');

                // add a placeholder for our unblock text
                //document.getElementById('ires').appendChild(blockBox)

                // open our blocklist up
                var blockList = JSON.parse(localStorage.getItem('blocked'));

                // see if the domain exists in our block list
                if (blockList.indexOf(url) > -1) {
                    // if so, block it and assign block styling
                    alert('blocking ' + url);
                    blockContent(resultHandle, url);
                } else {
                    // not actually unblocking, but merely
                    // assigning the unblock styling
                    unblockContent(resultHandle, url);
                }
            }
            //blockFromList();
        } catch (err) {
            //alert(document.getElementById('ires'));
            console.log("******************************");
            console.log(" Error in blockSearchResults");
            console.log(err);
        }
    }

    //creates an empty span in a list result so we can block/unblock
    function initializeHandle(handle) {
        var parentListItem = identifyListItem(handle);
        var h3 = parentListItem.getElementsByTagName('h3')[0];
        var jspan = document.createElement('span');
        jspan.classList.add("jaydorsey-handle");
        //jspan.innerHTML = ("&#x1f6ab;");  // 2705 for add back
        //jspan.addEventListener("click", blockContent, true);
        h3.appendChild(jspan);
    }

    // function here to count blocked elements;
    // send it with both the blockContent, but also the mouseclick of unblock
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
        //safari.self.tab.dispatchMessage("update-badge", "add");
        badgeCount += 1;
        //alert('sending count of ' + badgeCount);
        safari.self.tab.dispatchMessage('update-badge', {
            count: badgeCount
        });
    }

    // unblocks already blocked content
    function unblockContent(element, url, storage) {
        if (element.constructor === MouseEvent) {
            // when our element is not an element, make it an element
            const element = element.target;
            // remove from local storage
            // ONLY if we've clicked
            removeFromBlockList(element.getAttribute("data-source"));
            //safari.self.tab.dispatchMessage("update-badge", "subtract");
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




    // initializes our settings, also used as reset in case of failure

    function checkReset() {
        try {
            if (localStorage.getItem('blocked') == null) {
                resetLocalStorage();
            }
        } catch (err) {
            alert('resetting storage');
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

    //safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("resetMessageFromGlobal", "true");
    //if !(document.getElementById('ires') === null){
    //    safari.self.tab.dispatchMessage("updateBadge", true);
    //}


// event listeners
safari.self.addEventListener("message", handleMessage, false);
/*********************************************

Call these on each page load.

*********************************************/
checkReset();
//displayAds();
preloadBlockResults();
//blockSearchResults();
