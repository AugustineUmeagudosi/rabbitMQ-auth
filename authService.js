const express = require('express');
const connection = require('amqplib').connect('amqp://localhost');

const port = 2000;
const app = express();

// Consumer == listening for authentication tokens
connection.then((conn) => {
    return conn.createChannel();
  }).then((channel) => {
    return channel.assertQueue('authToken').then(() => {
      return channel.consume('authToken', (msg) => {
        if (msg !== null) {
          const token = JSON.parse(msg.content.toString());
          channel.ack(msg);
          const processedToken = token.split(' ')[1];
          const user = {
            name: 'John Doe',
            id: processedToken,
            role: 'admin'
          };

          sendResponse(user);
          return console.log('message recieved and processed');
        }
      });
    });
  }).catch(console.warn);
  
  // Publisher == publishes the results of an authentication token decoding
  async function sendResponse(response) {
      connection.then((conn) => {
          return conn.createChannel();
        }).then((channel) => {
          return channel.assertQueue('authResponse').then(() => {
            return channel.sendToQueue('authResponse', Buffer.from(JSON.stringify(response)));
          });
      }).catch(console.warn);
  }

app.listen(port, () => console.info(`Auth Service listening on port ${port}...`));