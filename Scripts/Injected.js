//var x = "this is some text";
//var x = document.getElementsByTagName('html')[0].innerHTML

//function change_color(){
//  document.body.style.background = "red";
//}


/*
function handleMessage(msgEvent) {
  var messageName = msgEvent.name;
  var messageData = msgEvent.message;
  if (messageName === "activateMyScript"){
    if (messageData === "block_domain"){
      alert('blocking domain');
    }
    if (messageData === "start"){
      startIt();
    }
  }
}
*/
//var initialVal=1;
//var calculatedVal=0;
var clicked_link;
var domain_to_block;


// from here: http://beardscratchers.com/journal/using-javascript-to-get-the-hostname-of-a-url
String.prototype.getHostname = function() {
  var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
  return this.match(re)[1].toString();
}

// Register for the contextmenu event.
document.addEventListener("contextmenu", handleContextMenu, false);
// Register for the message event.
safari.self.addEventListener("message", handleMessage, false);

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


//context menu
function handleContextMenu(event){
  console.log("Injected.js: handleContextMenu");
  targetLink = event.target;
  // google search result titles which contain a word in the search string 
  // add EM tags around the exact title matches
  if (event.target.tagName == "EM"){
    targetLink = event.target.parentElement;
  }

  domainToBlock = normalizeURL(targetLink.href)[1];

  // not actually passing the extra event.userInfo anywhere, yet, but might
  //   add a check to ignore certain elements
  safari.self.tab.setContextMenuEventUserInfo(event,{
      "tagName": targetLink.tagName, 
      "className": targetLink.className,
      "blockedDomain": domainToBlock,
      "parentTagName": targetLink.parentElement.tagName,
      "parentClassName": targetLink.parentElement.className,
      "deleteNode": targetLink.parentElement.parentElement.parentElement.id
    }
  );
}
 
function handleMessage(event){
  console.log("Injected.js: handleMessage");

  // Always check the name of the message that you want to handle.
  if (event.name !== "block-domain")
      return;
  
  if (!targetLink)
      return;

  confirm_block = confirm("Block " + domainToBlock + "?");
  if (confirm_block){
    localStorage.setItem(domainToBlock);
    blockDomains();
  }
  else{
    return;
  }

  /******************************
  Hide all of the blocked items on this page
  ******************************/
  /*
  // div#ires is the container for the first OL item
  var ol = document.getElementById('ires').firstElementChild;
  // get our li items
  var li = ol.getElementsByTagName('li');
  //console.log(li);

  //console.log("DOMAIN TO BLOCK: " + domain_to_block);

  
  for (item in li){
    // only grab the search results DIV, skip the news
    if (li[item].className == "g" && li[item].id != "newsbox"){
      //alert(li[item].firstElementChild.firstElementChild.innerHTML);
      var linkHandle = li[item].firstElementChild.firstElementChild;  // handle for the actual link
      var testURL = normalizeURL(linkHandle.firstElementChild)[0];  // actual URL
      var test_domain = normalizeURL(linkHandle.firstElementChild)[1];  // actual domain

      // Add the domain to our personal block list
      localStorage.setItem(test_domain)

      // Then block everything in the list
      block_domains();

      // then loop thru all of the blocked domains

      //if (test_domain == domain_to_block){
      //  block_result(linkHandle);
      //};
    }
  }
  */
  targetLink = null;
}

function blockResult(link){
  //console.log(link.innerHTML);
  //link.parentElement.parentElement.style.backgroundColor = "red";
  link.parentElement.parentElement.style.display = "none";
  //link.parentElement.parentElement.parentElement.innerHTML = "</div>blocked</div>";
}

// this function is called twice:
// page load: all previously blocked domains are removed;
// after blocking a domain: the blocked domain is added to the list,
//   then the list is refreshed

/*
function blockDomains(){
  var ol = document.getElementById('ires').firstElementChild;
  var li = ol.getElementsByTagName('li');
  for (item in li){
    // only grab the search results DIV, skip the news
    if (li[item].className == "g" && li[item].id != "newsbox"){
      var linkHandle = li[item].firstElementChild.firstElementChild;  // handle for the actual link
      var testURL = normalizeURL(linkHandle.firstElementChild)[0];  // actual URL
      var testDomain = normalizeURL(linkHandle.firstElementChild)[1];  // actual domain

      // loop thru our localStorage items and block results from our blocklist
      for (var i=0; i < localStorage.length; i++) {
        if (testDomain == localStorage.key(i)){
          blockResult(linkHandle);  
        }
      };
    }
  }
}
*/
// called on page load

safari.self.tab.dispatchMessage("heyExtensionBar","Klaatu barada nikto");
//blockDomains();