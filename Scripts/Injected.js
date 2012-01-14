/*

Our Injected.js page:



*/

/*
Hides the search results in our block list
*/
function blockSearchResults(){
    try{
        var searchResults = document.getElementById('ires').firstElementChild;
        var siteResults = searchResults.getElementsByTagName('cite');
        for (var i=0; i<siteResults.length; i++){
            resultHandle = siteResults[i];
            result = siteResults[i].innerText.match(/([^/ ]+)/i)[1];
            // open our blocklist up
            var blockList = JSON.parse(localStorage.getItem('blocked'));
            // see if the domain exists
            if (blockList.indexOf(result) > -1)
            {
                blockContent(resultHandle);
            }
    }    
    addBlockMessages();
    }
    catch(err){
    console.log(err);
    }
}

/*
Adds a block message to each search result item
*/
function addBlockMessages(){
  var searchResults = document.getElementById('ires').firstElementChild;
  var siteResults = searchResults.getElementsByTagName('cite');
  for (var i=0; i<siteResults.length; i++){
    result = siteResults[i];
    /*
      this should be the parent element a few nodes up

      this element will hold the custom css class we use to determine whether an
      element was blocked or not.
    */
    parentList = result.parentElement.parentElement.parentElement.parentElement;
    blockURL = result.innerText.match(/([^/ ]+)/i)[1];  // URL to block
    
    // check if we've already created a "Block [site]" message, if so overwrite
    if (siteResults[i].getElementsByClassName('nubilus-block-me').length > 0){
      blockMessage = siteResults[i].getElementsByClassName('nubilus-block-me')[0]
    }
    else{
      blockMessage = document.createElement('a');
      result.appendChild(blockMessage);
    }

    // already been blocked, so create our unblock message
    if (parentList.classList.contains("nubilus-result-blocked")){
      blockMessage.textContent = "- Unblock " + blockURL;
      blockMessage.removeEventListener("click", blockContent, true);
      blockMessage.addEventListener("click", unblockContent, true);
    }
    // not blocked, create our block message
    else {
      blockMessage.textContent = "- Block " + blockURL;
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
  var parentList = element.parentElement.parentElement.parentElement.parentElement;
  // for some reason, blocking picks up a DIV
  if (parentList.tagName == "DIV"){
    parentList = parentList.parentElement;
  }
  parentList.classList.add("nubilus-result-blocked");
  parentList.classList.remove("nubilus-result-unblocked");
  parentList.style.display = "none";  // manual display, since that's how we active the temporary show
  addBlockMessages();
}

// unblocks already blocked content
function unblockContent(event){
  const element = event.target;
  // remove from local storage
  removeFromLocalStorage(element.getAttribute("data-source"));
  // block the result
  var parentList = element.parentElement.parentElement.parentElement.parentElement.parentElement;
  parentList.classList.remove("nubilus-result-blocked");
  parentList.classList.add("nubilus-result-unblocked");
  addBlockMessages();
}

// add a blocked domain to local storage
function addToLocalStorage(domain){
  var blockList = JSON.parse(localStorage.getItem('blocked'))
  if (blockList.indexOf(domain) == -1){  // domain does not exist in blocklist
    blockList.push(domain);
  }
  localStorage.setItem('blocked', JSON.stringify(blockList))
}

// remove an item from local storage
function removeFromLocalStorage(domain){
  var blockList = JSON.parse(localStorage.getItem('blocked'));
  if (blockList.indexOf(domain) > -1){
    blockList.splice(blockList.indexOf(domain), 1);
  }
  localStorage.setItem('blocked', JSON.stringify(blockList));
}

// reset all of our localStorage settings
function resetLocalStorage(){
  localStorage.setItem('blocked', JSON.stringify([]));
  localStorage.setItem('reset', JSON.stringify(false));
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

// does a simple check to see if we need a trigger to allow unblocking
function checkBlockedContent(){
  // attempt to remove any existing info box if no results are blocked
  if (document.getElementsByClassName('nubilus-result-blocked').length == 0){
    try{
      parent = document.getElementById('ires');
      child = document.getElementById('nubilus-block-box');
      parent.removeChild(child);  
    }
    catch(err){
      // fails silently in the corner
    }
  }
  else{
    if (document.getElementById('nubilus-block-box')){
      // nothing to see here. yet. maybe       
    }
    else{  // create a block box with data
      blockBox = document.createElement('a');
      blockBox.setAttribute("id", "nubilus-block-box");
      document.getElementById('ires').appendChild(blockBox)
      //document.getElementById('nubilus-block-box')
    }
    searchResults = document.getElementById('nubilus-block-box');
    blockBox.classList.add("nubilus-block-box");
    blockBox.textContent = "Your personal blocklist blocked some results. Click this text to view or edit your blocked results.";
    blockBox.addEventListener("click", displayBlockedResults, true);
  }
}

function displayBlockedResults(){
  var blockedResults = document.getElementsByClassName('nubilus-result-blocked');
  for (var i=0; i<blockedResults.length; i++){
    blockedResults[i].style.display = "block";
  }
}

// initializes our settings, also used as reset in case of failure
function checkReset(){
  try{
    if (localStorage.getItem('blocked') == null){
      resetLocalStorage();
    }
  }
  catch(err){
    resetLocalStorage();
  }
}

function handleMessage(msgEvent){
  var messageName = msgEvent.name;
  var messageData = msgEvent.message;
  if (messageName === "resetMessageFromGlobal"){
    if (messageData === "true"){
      // reset local Storage;
      resetLocalStorage();
    }
  }
  if (messageName === "toggleAdsFromGlobal"){
    if (messageData === true){
      set('displayAds', true);
    }
    else{
      set('displayAds', false)
    }
    displayAds();
  }
}



/*
  var blockList = JSON.parse(localStorage.getItem('blocked'));
  if (blockList.indexOf(domain) > -1){
    blockList.splice(blockList.indexOf(domain), 1);
  }
  localStorage.setItem('blocked', JSON.stringify(blockList));
*/

// toying around with setting a store/unstore function 
function set(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}

function get(key){
  return JSON.parse(localStorage.getItem(key));
}

function displayAds(){
  switch (get('displayAds')){
    case true:
      unblockAds();
      break;
    default:
      blockAds();
      break;
  }
}


// block the 2 add elements on the page
function blockAds(){
  try{
    document.getElementById('mbEnd').style.display = 'none';
    document.getElementById('taw').style.display = 'none';  
  }
  catch(err){
    console.log(err);
  }
}

function extraNav(){
  /*
  copy #navcnt
  change ID
  append before div.med
  */
}

// unblock the 2 add elements on the page
function unblockAds(){
  try{
    document.getElementById('mbEnd').style.display = null;
    document.getElementById('taw').style.display = null;
  }
  catch(err){
    console.log(err);
  }
}


safari.self.addEventListener("message", handleMessage, false);

checkReset();
displayAds();
blockSearchResults();