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
var clickedLink;
var domainToBlock;
//var block_list = safari.extension.settings.block_list;

//var html = document.getElementsByTagName('html')[0].innerHTML;
 
// first function call
//function doBigCalc(theData) {
//  safari.self.tab.dispatchMessage("calcThis",theData);
//}

// pass the page HTML over to the Global.html file
//function passHTML(theData, theActiveElement){
  //document.activeElement.style.background = "red";
  //alert(document.activeElement.tagName)
  //alert(document.activeElement.id)
//  safari.self.tab.dispatchMessage("blockThis", theData);
//}




// last function call
//function getAnswer(theMessageEvent) {
// if (theMessageEvent.name === "theAnswer") {
//  calculatedVal=theMessageEvent.message;
//  console.log(calculatedVal);
// }
 //if (theMessageEvent.name === "theBlock"){
//   console.log(theMessageEvent.message);
// }
//}


// listener
//safari.self.addEventListener("message", getAnswer, false);

//doBigCalc(initialVal);
//passHTML(html);

// start off by calling our function(s)
//doBigCalc(initialVal);



function get_hostname(url){
  return url.match(/:\/\/(www\.)?(.[^/:]+)/)[2];
  //return url.match(/:\/\/(.[^/]+)/)[1];
}


// Register for the contextmenu event.
document.addEventListener("contextmenu", handleContextMenu, false);
// Register for the message event.
safari.self.addEventListener("message", handleMessage, false);


// strip the google click tracker BS
function de_google(url){
  var url_string = new String(url)
  //var urlRegEx = new RegExp("[?&]url=([^&$]*)", "i")
  var match = url_string.match(/[?&]url=([^&$]*)/i);
  //console.log("FULL MATCH: " + unescape(match));
  console.log("MATCH: " + unescape(match[1]));
  //if (!match[1]){
    url = unescape(match[1]);
  //}
  return get_hostname(url);
}


//context menu
function handleContextMenu(event){
  clickedLink = event.target;
  domainToBlock = event.target.href;

  // parse the real URL out of the google string. stupid click tracker.
  if (get_hostname(domainToBlock) == 'google.com'){
    console.log("PRE-CHECKING DOMAIN NAME TO BLOCK");
    domainToBlock = de_google(domainToBlock);
  }

  // passing data back
  safari.self.tab.setContextMenuEventUserInfo(event,{
      "tagName": event.target.tagName, 
      "className": event.target.className,
      "href": domainToBlock,
      "parentTagName": event.target.parentElement.tagName,
      "parentClassName": event.target.parentElement.className,
      "deleteNode": event.target.parentElement.parentElement.parentElement.id
    }
  );
}
 
function handleMessage(event){
  // Always check the name of the message that you want to handle.
  if (event.name !== "block-domain")
      return;
  
  if (!clickedLink)
      return;

  // delete all similar results from current page
  //clickedLink.parentElement.parentElement.parentElement.style.backgroundColor = "red";
  //block_list = block_list + "*." + domainToBlock + ";";



  /******************************
  Add the domain to our personal block list
  ******************************/
  // need to use some type of local storage here.


  /******************************
  Hide all of the blocked items on this page
  ******************************/
  // div#ires is the container for the first OL item
  var ol = document.getElementById('ires').firstElementChild;
  // get our li items
  var li = ol.getElementsByTagName('li');
  //console.log(li);

  //alert(de_google(list[2].firstElementChild.firstElementChild.firstElementChild))
  console.log("DOMAIN TO BLOCK: " + domainToBlock);

  /*
li.g
  div.vsc
    h3.r
      a.l
  */
  for (item in li){
    if (li[item].className == "g"){  // only grab the search results DIV, skip the news
      //alert(li[item].firstElementChild.firstElementChild.innerHTML);
      var link = li[item].firstElementChild.firstElementChild;  // handle for the actual link
      var url = de_google(link.firstElementChild);  // actual URL
    }
    
    
    //var url = de_google(link.firstElementChild)
    //console.log("URL:  " + url)
    //if (url == domainToBlock){
    //  block_result(link)
    //}
  }



  //alert(doc.innerHTML);
  //for (var i in doc){
  //  alert(i);
  //}
  //alert(Object.inspect(doc));
  //for (index in document.getElementById('ires')[0]){
  //  alert(index);
  //}
  //jQuery('li.g>div.vsc>h3.r>a.l').each(function(index){
  //  alert(index);
  //});

  

  //clickedLink.parentElement.parentElement.parentElement.innerHTML = "<div>blocked</div>"

  // add to database


  
  clickedLink = null;
}

function block_result(link){
  //console.log(link.innerHTML);
  link.parentElement.parentElement.style.backgroundColor = "red";
  //link.parentElement.parentElement.parentElement.innerHTML = "</div>blocked</div>";
}
function blockPage(){
  
}