const express = require('express');
const connection = require('amqplib').connect('amqp://localhost');

const port = 3000;
const app = express();
const authTokenQueue = 'authToken';
const authResponseQueue = 'authResponse';

// rabbit config routers
app.get('/todo', (req, res ) => {
    try {
        const token = 'Bearer someRandomUserAuthToken';
        // Publish token to the authentication queue for auth microservice to decode
        connection.then((conn) => {
            return conn.createChannel();
        }).then((channel) => {
            return channel.assertQueue(authTokenQueue).then(() => {
            return channel.sendToQueue(authTokenQueue, Buffer.from(JSON.stringify(token)));
            });
        }).catch(console.warn);

        // Listens on the auth
        connection.then((conn) => {
            return conn.createChannel();
        }).then((channel) => {
            return channel.assertQueue(authResponseQueue).then(() => {
                return channel.consume(authResponseQueue, (msg) => {
                    if (msg !== null) {
                        const responseData = JSON.parse(msg.content.toString());
                        channel.ack(msg);
                        channel.close();  // very important else you will get [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client

                        res.status(200);
                        return res.json(responseData);
                    }
                });
            });
        }).catch(console.warn);
    } catch (error) {
        res.status(500);
        return res.json(error);
    }
});

app.listen(port, () => console.info(`Todo App listening on port ${port}...`));