const socket = io();
let username = null;

Swal.fire({
    title: "Bienvenido",
    text: "Ingresa tu nombre de usuario",
    input: 'text',
    inputPlaceholder: 'Ingresa aqui tu nombre',
    confirmButtonText: 'Ingresar',
    allowOutsideClick: false,
    inputValidator: (value) =>{
        if(!value) return 'Debes ingresar tu nombre de usuario';
    }
}).then(result => {
    username = result.value;
})

function sendMessage(){
    const message = document.getElementById('messageInput').value;
    socket.emit('newMessage', message);
}

function appendMessage(socketId, message){
    const messageList = document.getElementById("messageList");
    const newMessage = document.createElement('p')
    newMessage.textContent = `${socketId}: ${message}`
    messageList.appendChild(newMessage)
}

socket.on('messageList', (messages)=>{
    const messageList = document.getElementById('messageList')
    messageList.innerHTML = "";
    messages.forEach((message) => {
        appendMessage(
            message.socketId,
            message.message
        )
    })
})

socket.on('newMessage', (data) =>{
    appendMessage(data.socketId, data.message)
})