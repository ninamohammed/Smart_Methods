try{
var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var recognition = new SpeechRecognition();
}
catch(e) {
console.error(e);
$('.no-browser-support').show();
$('.app').hide();
}


var noteTextarea = $('#note-textarea');
var instructions = $('#recording-instructions');
var notesList = $('ul#notes');

var noteContent = '';

var notes = getAllNotes();
renderNotes(notes);

recognition.continuous = true;

recognition.onresult = function(event) {

var current = event.resultIndex;

var transcript = event.results[current][0].transcript;

var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

if(!mobileRepeatBug) {
  noteContent += transcript;
  noteTextarea.val(noteContent);
}
};

recognition.onstart = function() {
instructions.text('تم تفعيل التعرف على الصوت. حاول التحدث في الميكروفون.');
}

recognition.onspeechend = function() {
instructions.text('لقد كنت هادئًا لفترة من الوقت ، لذا أوقف التعرف على الصوت نفسه');
}

recognition.onerror = function(event) {
if(event.error == 'no-speech') {
  instructions.text('لم يتم الكشف عن الكلام. حاول مرة أخرى.');  
};
}


$('#start-record-btn').on('click', function(e) {



recognition.start();
});

//
if (noteContent.length) {
  noteContent += ' ';
}
//
if (a == "يمين." || a=="يمين") {
  console.log(a)
  sendSerialLine();

}else if(a == "يسار." || a=="يسار") {
  console.log(a)
  sendSerialLineB();

}
//

//

//


$('#pause-record-btn').on('click', function(e) {
recognition.stop();
instructions.text('Voice recognition paused.');
});

// Sync the text inside the text area with the noteContent variable.
noteTextarea.on('input', function() {
noteContent = $(this).val();
})

$('#save-note-btn').on('click', function(e) {
recognition.stop();

if(!noteContent.length) {
  instructions.text('Could not save empty note. Please add a message to your note.');
}
else {
 
  saveNote(new Date().toLocaleString(), noteContent);

  noteContent = '';
  renderNotes(getAllNotes());
  noteTextarea.val('');
  instructions.text('Note saved successfully.');
}
    
})


notesList.on('click', function(e) {
e.preventDefault();
var target = $(e.target);

if(target.hasClass('listen-note')) {
  var content = target.closest('.note').find('.content').text();
  readOutLoud(content);
}

if(target.hasClass('delete-note')) {
  var dateTime = target.siblings('.date').text();  
  deleteNote(dateTime);
  target.closest('.note').remove();
}
});


function readOutLoud(message) {
var speech = new SpeechSynthesisUtterance();

speech.text = message;
speech.volume = 1;
speech.rate = 1;
speech.pitch = 1;

window.speechSynthesis.speak(speech);
}

function renderNotes(notes) {
var html = '';
if(notes.length) {
  notes.forEach(function(note) {
    html+= `<li class="note">
      <p class="header">
        <span class="date">${note.date}</span>
        <a href="#" class="listen-note" title="Listen to Note">Listen to Note</a>
        <a href="#" class="delete-note" title="Delete">Delete</a>
      </p>
      <p class="content">${note.content}</p>
    </li>`;    
  });
}
else {
  html = '<li><p class="content">You don\'t have any notes yet.</p></li>';
}
notesList.html(html);
}


function saveNote(dateTime, content) {
localStorage.setItem('note-' + dateTime, content);
}


function getAllNotes() {
var notes = [];
var key;
for (var i = 0; i < localStorage.length; i++) {
  key = localStorage.key(i);
  console.log(i)
  console.log(key)

  if(key.substring(0,5) == 'note-') {
    notes.push({
      date: key.replace('note-',''),
      content: localStorage.getItem(localStorage.key(i))
    });
  }
}
console.log(notes)
return notes;
}


function deleteNote(dateTime) {
localStorage.removeItem('note-' + dateTime);
}


//

document.querySelector('button').addEventListener('click', async () => {
  const port = await navigator.serial.requestPort();
  await port.open({ baudRate: 9600 });

});


async function listenToPort() {
  const textDecoder = new TextDecoderStream();
  const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
  const reader = textDecoder.readable.getReader();
  // Listen to data coming from the serial device.
  while (true) {
      const { value, done } = await reader.read();
      if (done) {
          // Allow the serial port to be closed later.
          reader.releaseLock();
          break;
      }
      // value is a string.
      appendToTerminal(value);
  }


}
async function sendSerialLine() {
  dataToSend = 'A'
  dataToSend = dataToSend + "\r\n";

  await writer.write(dataToSend);
}
async function sendSerialLineB() {
  dataToSend = 'B'
  dataToSend = dataToSend + "\r\n";

  await writer.write(dataToSend);
}

//

//
var port, textEncoder, writableStreamClosed, writer;
async function connectSerial() {
    try {
        // Prompt user to select any serial port.
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });

        textEncoder = new TextEncoderStream();
        writableStreamClosed = textEncoder.readable.pipeTo(port.writable);

        writer = textEncoder.writable.getWriter();
        listenToPort();
    } catch {
        alert("Serial Connection Failed");
    }
}

