const express = require('express');
const connection = require('amqplib').connect('amqp://localhost');

const port = 3000;
const app = express();

// rabbit config routers
app.get('/todo', (req, res ) => {
    try {
        const token = 'Bearer someRandomUserAuthToken';
        // Publisher
        connection.then((conn) => {
            return conn.createChannel();
        }).then((channel) => {
            return channel.assertQueue('authToken').then(() => {
            return channel.sendToQueue('authToken', Buffer.from(JSON.stringify(token)));
            });
        }).catch(console.warn);

        // Consumer
        connection.then((conn) => {
            return conn.createChannel();
        }).then((channel) => {
            return channel.assertQueue('authResponse').then(() => {
                return channel.consume('authResponse', (msg) => {
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