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

var html = document.getElementsByTagName('html')[0].innerHTML;
 
// first function call
//function doBigCalc(theData) {
//  safari.self.tab.dispatchMessage("calcThis",theData);
//}

// pass the page HTML over to the Global.html file
function passHTML(theData, theActiveElement){
  //document.activeElement.style.background = "red";
  //alert(document.activeElement.tagName)
  //alert(document.activeElement.id)
  safari.self.tab.dispatchMessage("blockThis", theData);
}




// last function call
function getAnswer(theMessageEvent) {
// if (theMessageEvent.name === "theAnswer") {
//  calculatedVal=theMessageEvent.message;
//  console.log(calculatedVal);
// }
 if (theMessageEvent.name === "theBlock"){
   console.log(theMessageEvent.message);
 }
}


// listener
safari.self.addEventListener("message", getAnswer, false);

//doBigCalc(initialVal);
passHTML(html);

// start off by calling our function(s)
//doBigCalc(initialVal);



// Register for the contextmenu event.
document.addEventListener("contextmenu", handleContextMenu, false);
// Register for the message event.
safari.self.addEventListener("message", handleMessage, false);


//context menu
function handleContextMenu(event){
  clickedLink = event.target;
  safari.self.tab.setContextMenuEventUserInfo(event,{
      "tagName": event.target.tagName, 
      "className": event.target.className,
      "parentTagName": event.target.parentElement.tagName,
      "parentClassName": event.target.parentElement.className,
      "deleteNode": event.target.parentElement.parentElement.parentElement
    }
  );
}
 
function handleMessage(event){
  // Always check the name of the message that you want to handle.
  if (event.name !== "block-domain")
      return;
  
  if (!clickedLink)
      return;
  
  // Make sure the timestamp of when lastRightClickedElement is saved matches the one sent in the message.
  // This message is sent to every frame on this page, and we don't want to hide lastRightClickedElement in a
  // different frame that was saved from a previous contextmenu event.
  //if (lastContextMenuEventTime === event.message)
  //clickedLink.style.visibility = "hidden";
  clickedLink.style.backgroundColor = "red";
  
  clickedLink = null;
}