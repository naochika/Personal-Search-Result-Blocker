blockedContent = [];

// first we block all of the existing results
function blockSearchResults(){
  var searchResults = document.getElementById('ires').firstElementChild;
  var siteResults = searchResults.getElementsByTagName('cite');
  for (var i=0; i<siteResults.length; i++){
    resultHandle = siteResults[i];
    result = siteResults[i].innerText.match(/([^/]+)/i)[1];
    for (var j=0; j<localStorage.length; j++){
      domain = localStorage.key(j);
      if (domain == result){
        blockContent(resultHandle);
      }
    }
  }
}

///var theEvent = document.createEvent('MouseEvents');
//      theEvent.initEvent('click', true, true);
//      theTarget.dispatchEvent(theEvent);

// next, we add a block option to each remaining result
function addBlockMessages(){
  var searchResults = document.getElementById('ires').firstElementChild;
  var siteResults = searchResults.getElementsByTagName('cite');
  for (var i=0; i<siteResults.length; i++){
    result = siteResults[i];
    // this should be the parent element a few nodes up which contains our blocking data
    parentList = result.parentElement.parentElement.parentElement.parentElement;
    blockURL = result.innerText.match(/([^/]+)/i)[1];  // URL to block
    

    
      
    if (siteResults[i].getElementsByClassName('nubilus-block-me')){
      blockMessage = document.createElement('a');
      result.appendChild(blockMessage);
    }
    else{
      blockMessage = siteResults[i].getElementsByClassName('nubilus-block-me')[0]
    }

    // already been blocked, so create our unblock message
    if (parentList.classList.contains("nubilus-result-blocked")){
      blockMessage.textContent = "- Unblock " + blockURL; //normalizeURL(result.innerText) + "?"
      blockMessage.removeEventListener("click", blockContent, true);
      blockMessage.addEventListener("click", unblockContent, true);
    }
    // not blocked, create our block message
    else {
      blockMessage.textContent = "- Block " + blockURL; //normalizeURL(result.innerText) + "?"
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
function blockContent(element){
  // hacky. i could split this up into 2 functions but i'd prefer to figure out
  //   how to trigger a mouse event from block search
  // this is triggered only by manual blocking
  if (element.constructor === MouseEvent){
    // when our element is not an element, make it an element
    const element = element.target;
    // add to local storage
    addToLocalStorage(element.getAttribute("data-source"));
  }
  // remove the blockContent listener, because the content is already blocked
  element.parentElement.parentElement.parentElement.parentElement.classList.add("nubilus-result-blocked");
  element.parentElement.parentElement.parentElement.parentElement.classList.remove("nubilus-result-unblocked");

  //element.removeEventListener("click", blockContent, true);
  
  // block the result
  //blockResult(element.parentElement.parentElement.parentElement.parentElement)
  blockedContent.push(element);  // not sure what we're doing with this data yet, but add it

  // refresh the page to make sure we've added our disclaimer at the bottom
  if (element.constructor === MouseEvent){
    addBlockMessages();
  }

}



// unblocks already blocked content
function unblockContent(event){
  const element = event.target;
  // remove the listener
  //element.removeEventListener("click", unblockContent, true);
  // remove from local storage
  removeFromLocalStorage(element.getAttribute("data-source"));
  // block the result
  //unblockResult(element.parentElement.parentElement.parentElement.parentElement.parentElement)

  element.parentElement.parentElement.parentElement.parentElement.parentElement.classList.remove("nubilus-result-blocked");
  element.parentElement.parentElement.parentElement.parentElement.parentElement.classList.add("nubilus-result-unblocked");

  addBlockMessages();
}

function __deprecatedaddUnblockMessages(event){
  return;
  var blockedElements = document.getElementsByClassName('nubilus-result-blocked');
  for (var i=0; i<blockedElements.length; i++){
    //blockedElements[i].classList.add("nubilus-result-unblocked");
    //console.log(blockedElements[i].innerHTML);
    replace = blockedElements[i].getElementsByClassName("nubilus-block-me")[0];  // should only be one of these

    // create a new anchor element for our unblock link
    replace.textContent = "- Unblock " + replace.getAttribute('data-source');
    //anchor.classList.add("nubilus-block-me");
    //replace.setAttribute("data-source", replace.getAttribute('data-source');

    // remove the old event
    replace.removeEventListener("click", blockContent, true);
    // add a new event
    replace.addEventListener("click", unblockContent, true);

    //replace.innerHTML = "<a href=''>Unblock "+replace.getAttribute('data-source')+"</a>";
    //replace.addEventListener("click", unblockContent, true);
    //console.log("Unblocking " + blockedElements.innerHTML);
  }
  //document.getElementById("nubilus_block_box").style.display = "none";
}





// add a blocked domain to local storage
function addToLocalStorage(domain){
  var exists = false;
  for (var i = 0; i < localStorage.length; i++){
    if (domain == localStorage.key(i)){
      exists = true;
    }
  }
  // only add to local storage if the domain does not exist
  if (!exists){
    localStorage.setItem(domain);
  }
}

// remove an item from local storage
function removeFromLocalStorage(domain){
  for (var i = 0; i < localStorage.length; i++){
    if (domain == localStorage.key(i)){
      localStorage.removeItem(localStorage.key(i))
    }
  }
}



// from here: http://beardscratchers.com/journal/using-javascript-to-get-the-hostname-of-a-url
String.prototype.getHostname = function() {
  var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
  return this.match(re)[1].toString();
}

// function to normalize the url, grab the hostname, and get 
// rid of the google click tracker BS for clicked elements
function normalizeURL(url){
  url = url.toString();
  // google click tracker BS
  if (url.getHostname() == 'www.google.com'){
    // get the real URL
    url = unescape(url.match(/[?&]url=([^&$]*)/i)[1]);
    domain = url.getHostname();
  }
  else{
    // normal URL, so no change
    domain = url.getHostname();
  }

  return [url, domain];
}

function __blockResult(element){
  element.classList.add("nubilus-result-blocked");
  element.classList.remove("nubilus-result-unblocked");
}

function __unblockResult(element){
  element.classList.remove("nubilus-result-blocked");
  element.classList.add("nubilus-result-unblocked");
}


// does a simple check to see if we need a trigger to allow unblocking
function checkBlockedContent(){
  if (blockedContent.length > 0 && (document.getElementById('nubilus-block-box'))){
    searchResults = document.getElementById('ires');
    blockBox = document.createElement('a');
    blockBox.classList.add("nubilus-block-box");
    blockBox.textContent = "Your personal blocklist blocked some results. Click this box to view your blocked results.";
    blockBox.itemId = "nubilus-block-box";
    searchResults.appendChild(blockBox)
    //blockBox.addEventListener("click", addUnblockMessages, true);
  }
}



blockSearchResults();
addBlockMessages();
checkBlockedContent();