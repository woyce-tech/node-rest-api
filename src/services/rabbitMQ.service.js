/* eslint-disable no-console */
const amqp = require('amqplib');

const { RESPONSE_STATUS } = require('../constants');

const AMQP_URL = process.env.AMQP_URL || 'amqp://localhost:5672';
let channel;
let connection;

async function connectConsumer() {
  try {
    connection = await amqp.connect(AMQP_URL);
    channel = await connection.createChannel();

    // Declare Exchanges
    await channel.assertExchange('Exchange_One', 'direct', { durable: true });
    await channel.assertExchange('Exchange_Two', 'direct', { durable: true });
    // Declare queues and bind them to Exchange One
    const queuesExchangeOne = [
      { name: 'queue1', routingKey: 'key1' },
      { name: 'queue2', routingKey: 'key2' },
      { name: 'queue3', routingKey: 'key3' },
    ];
    await Promise.all(
      queuesExchangeOne.map(async ({ name, routingKey }) => {
        await channel.assertQueue(name, { durable: true });
        await channel.bindQueue(name, 'Exchange_One', routingKey);
      })
    );
    // Declare queues and bind them to Exchange Two
    const queuesExchangeTwo = [
      { name: 'queue4', routingKey: 'key4' },
      { name: 'queue5', routingKey: 'key5' },
      { name: 'queue6', routingKey: 'key6' },
    ];
    await Promise.all(
      queuesExchangeTwo.map(async ({ name, routingKey }) => {
        await channel.assertQueue(name, { durable: true });
        await channel.bindQueue(name, 'Exchange_Two', routingKey);
      })
    );
    console.log('Exchanges, Queues, and Bindings are set up.');

    // Assert queues for Exchange One
    await Promise.all(
      queuesExchangeOne.map(async ({ name: queue }) => {
        await channel.assertQueue(queue, { durable: true });
        console.log(`Consumer connected to queue: ${queue} for Exchange One`);
        // Consume messages from the queue
        channel.consume(queue, (msg) => {
          if (msg !== null) {
            console.log(`Received message from queue ${queue} for Exchange One:`, msg.content.toString());
            // Acknowledge the message to remove it from the queue
            channel.ack(msg);
          }
        });
      })
    );

    // Assert queues for Exchange Two
    await Promise.all(
      queuesExchangeTwo.map(async ({ name: queue }) => {
        await channel.assertQueue(queue, { durable: true });
        console.log(`Consumer connected to queue: ${queue} for Exchange Two`);
        // Consume messages from the queue
        channel.consume(queue, (msg) => {
          if (msg !== null) {
            console.log(`Received message from queue ${queue} for Exchange Two:`, msg.content.toString());
            // Acknowledge the message to remove it from the queue
            channel.ack(msg);
          }
        });
      })
    );
  } catch (error) {
    console.error('Failed to connect to AMQP', error);
    // Reconnect logic or other error handling here
  }
}

const sendDataToExchanges = async (data, routingKeyOne, routingKeyTwo) => {
  if (!channel) {
    throw new Error('Cannot send data: channel not initialized');
  }
  const bufferData = Buffer.from(JSON.stringify(data));
  try {
    // Publish to Exchange One
    await channel.publish('Exchange_One', routingKeyOne, bufferData, { persistent: true });
    // Publish to Exchange Two
    await channel.publish('Exchange_Two', routingKeyTwo, bufferData, { persistent: true });
    console.log('Data sent to both exchanges.');
  } catch (error) {
    console.error('Error while publishing:', error);
    throw error;
  }
};

const outReach = async () => {
  try {
    const now = new Date();
    const istTime = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const data = {
      title: 'Six of Crows',
      time: istTime,
    };
    sendDataToExchanges(data, 'key1', 'key4');
    console.log(`A message is sent to both exchanges at ${istTime}`);
    return {
      status: RESPONSE_STATUS.SUCCESS,
      data: [],
    };
  } catch (error) {
    return {
      message: error.message,
      status: RESPONSE_STATUS.ERROR,
    };
  }
};

// Close RabbitMQ connection
async function closeRabbitMQConnection() {
  if (channel) {
    try {
      await channel.close();
      console.log('RabbitMQ connection closed');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error.message);
    }
  }
}

module.exports = {
  sendDataToExchanges,
  outReach,
  closeRabbitMQConnection,
  connectConsumer,
};
