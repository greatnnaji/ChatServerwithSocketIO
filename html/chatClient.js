//connect to server and retain the socket
//connect to same host that served the document

//const socket = io('http://' + window.document.location.host)
const socket = io() //by default connects to same server that served the page
socket.on('serverSays', function(message) {
  let msgDiv = document.createElement('div')
  /*
  What is the distinction among the following options to set
  the content? That is, the difference among:
  .innerHTML, .innerText, .textContent
  */
  //msgDiv.innerHTML = message
  //msgDiv.innerText = message
  msgDiv.textContent = message 
  document.getElementById('messages').appendChild(msgDiv)
})

socket.on('senderSays', function(message) {
  let msgDiv = document.createElement('div')
  /*
  What is the distinction among the following options to set
  the content? That is, the difference among:
  .innerHTML, .innerText, .textContent
  */
  //msgDiv.innerHTML = message
  //msgDiv.innerText = message
  msgDiv.textContent = message 
  document.getElementById('messages').appendChild(msgDiv).style.color = 'blue'
})

socket.on('pingSays', function(message) {
  let msgDiv = document.createElement('div')
  /*
  What is the distinction among the following options to set
  the content? That is, the difference among:
  .innerHTML, .innerText, .textContent
  */
  //msgDiv.innerHTML = message
  //msgDiv.innerText = message
  msgDiv.textContent = message 
  document.getElementById('messages').appendChild(msgDiv).style.color = 'red'
})


function sendMessage() {
  let message = document.getElementById('msgBox').value.trim()
  if(message === '') return //do nothing
  let nameTextArray = []
  nameTextArray = checkMessage(message)
  socket.emit('onPing', nameTextArray, message)
  socket.emit('roomMessage', message)
  socket.emit('privateMessage', message)//should be for the client that sends
  document.getElementById('msgBox').value = ''
}

function connectAs(){
  let name = document.getElementById('nameBox').value.trim()
  if(name === '') return //do nothing
  if(validName(name) == true){
    socket.emit('clientSays', name + " joined the server.")
    socket.emit('clientName', name)
  }
  document.getElementById('nameBox').value = ''
}

function checkMessage(message){
  let str = ''
  let nameTextArray = []
  for(char of message){
    if((char != ':')&&(char != ',')){
      str += char
    }else{
      let string = str.trim()
      nameTextArray.push(string)
      str = ''
      if(char == ':'){
        break
      }
    }
  }
  return nameTextArray
}

function clear(){
  let parentElement = document.getElementById('messages')
  let firstChild = document.getElementById('messages').firstChild
  for(let i=parentElement.children.length - 1; i > 0; i--){
    if(parentElement.children[i] !== firstChild){
      parentElement.removeChild(parentElement.children[i])
    }
  }
}

function validName(name){
  const firstLetter = /^[a-z]/i
  const pattern1 = /[0-9]/g
  const pattern2 = /[a-z]/i
  let result = true;
  let validUsername = false;

  if(firstLetter.test(name)){//check if it starts with a letter
    for(let char of name){
    if((!char.match(pattern1))&&!char.match(pattern2)){
      result = false
    }
  }
    if(result == true){
      validUsername = true
      //socket.join("server")
      document.getElementById('nameBox').value = ''
      document.getElementById('nameBox').setAttribute('placeholder', 'Enter a User Name')
      document.getElementById('send_button').style.display = 'block'
      document.getElementById('msgBox').style.display = 'block'
      document.getElementById('clear_button').style.display = 'block'
      document.getElementById('nameBox').style.display = 'none'
      document.getElementById('connect_as_button').style.display = 'none'
  }else{
    validUsername = false
    document.getElementById('nameBox').setAttribute('placeholder', 'Please enter a valid username')
  }
}
return validUsername
}

function handleKeyDown(event) {
  const ENTER_KEY = 13 //keycode for enter key
  if (event.keyCode === ENTER_KEY) {
    sendMessage()
    return false //don't propogate event
  }
}

//Add event listeners
document.addEventListener('DOMContentLoaded', function() {
  //This function is called after the browser has loaded the web page

  //add listener to buttons
  document.getElementById('connect_as_button').addEventListener('click', connectAs)
  document.getElementById('send_button').addEventListener('click', sendMessage)
  document.getElementById('clear_button').addEventListener('click', clear)

  
  //add keyboard handler for the document as a whole, not separate elements.
  document.addEventListener('keydown', handleKeyDown)
  //document.addEventListener('keyup', handleKeyUp)
})
