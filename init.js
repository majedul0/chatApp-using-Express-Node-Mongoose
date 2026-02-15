const mongoose = require('mongoose');
const Chat = require('./models/chat');

main()
  .then(() => {
    console.log('Connected to MongoDB');
    insertData();
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
  });

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}

async function insertData() {
  try {
    const chats = await Chat.insertMany([
      {
        from: 'Alice',
        to: 'Bob',
        msg: 'Hello Bob!',
        created_at: new Date(),
      },
      {
        from: 'Bob',
        to: 'Alice',
        msg: 'Hi Alice! How are you?',
        created_at: new Date(),
      },
      {
        from: 'Charlie',
        to: 'Alice',
        msg: 'Are you coming to the party?',
        created_at: new Date(),
      },
      {
        from: 'Alice',
        to: 'Charlie',
        msg: 'Yes! I will be there at 8 PM.',
        created_at: new Date(),
      },
      {
        from: 'David',
        to: 'Bob',
        msg: 'Did you finish the project?',
        created_at: new Date(),
      },
      {
        from: 'Bob',
        to: 'David',
        msg: 'Almost done, will send it tonight.',
        created_at: new Date(),
      }
    ]);

    console.log('Chats inserted successfully!');
    console.log(chats);

    mongoose.connection.close(); // optional: close connection after insert
  } catch (err) {
    console.error('Error inserting chats:', err);
  }
}
