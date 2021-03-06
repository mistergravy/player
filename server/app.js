const express = require('express');
let app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
app.use(cors({
  origin: "*"
}));
app.use(morgan('dev'));
// app.use(express.static(path.join(__dirname, '/../public')));



const http = require('http');
let server = http.createServer(app);
const io = require('socket.io').listen(server);



let port = process.env.PORT || 3002;
const Promise = require('bluebird');

const AWS = require('aws-sdk');




app.use(express.static(__dirname + '/../public'), () => {
  console.log(`using ${__dirname}`)
});
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


server.listen((port), () => {
  console.log(`server is listening on PORT: ${port}`);
});
var sqs = new AWS.SQS({
    apiVersion: '2012-11-05',
    region: 'us-east-2',
    params: {
      AttributeNames: [
        "SentTimestamp"
    ],
      MaxNumberOfMessages: 1,
      MessageAttributeNames: [
        "All"
    ],
      QueueUrl: "https://sqs.us-east-2.amazonaws.com/021058984666/song-queue"
    }
  }
);

let receiveMessage = Promise.promisify(sqs.receiveMessage, {context: sqs});
let deleteMessage = Promise.promisify(sqs.deleteMessage, {context: sqs});

let message = null;

(pollQueue = () => {
  console.log("Starting long poll operation");

  receiveMessage({
    WaitTimeSeconds: 20,
    VisibilityTimeout: 20
  })
  .then( (data) => {
    // make a post call to db to put new data in db
    // do some socket.io call that will send the message to react component
    if(data.Messages !== undefined) {
      console.log(data.Messages[0].Body);
      message = JSON.parse(data.Messages[0].Body);

    }
    if(!data.Messages) {
      throw(
        new Error("There are no messages in the queue")
      )
    }
    return(
      deleteMessage({
        ReceiptHandle: data.Messages[0].ReceiptHandle
      })
    )
  })
  .then( (data) => {
    console.log("Message deleted!");
  })
  .catch(
    (err) => {
      console.log(err.message);
    }
  )
  .finally(pollQueue);
})();



io.on('connection', s => {
  // s.on('register', handleRegister);

  s.emit('message', message);

  s.on('disconnect', () => {
    console.log('user disconnected');
  })
});









