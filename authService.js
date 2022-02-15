const express = require('express');
const connection = require('amqplib').connect('amqp://localhost');

const port = 2000;
const app = express();
const authTokenQueue = 'authToken';
const authResponseQueue = 'authResponse';

// Consumer == listening for authentication tokens
connection.then((conn) => {
    return conn.createChannel();
  }).then((channel) => {
    return channel.assertQueue(authTokenQueue).then(() => {
      return channel.consume(authTokenQueue, (msg) => {
        if (msg !== null) {
          const token = JSON.parse(msg.content.toString());
          channel.ack(msg);

          // handle program logic here
          const processedToken = token.split(' ')[1];
          const user = {
            name: 'John Doe',
            id: processedToken,
            role: 'admin'
          };

          // publish the response to the todo service
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
          return channel.assertQueue(authResponseQueue).then(() => {
            return channel.sendToQueue(authResponseQueue, Buffer.from(JSON.stringify(response)));
          });
      }).catch(console.warn);
  }

app.listen(port, () => console.info(`Auth Service listening on port ${port}...`));