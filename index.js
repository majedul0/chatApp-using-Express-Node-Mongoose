const mongoose = require('mongoose');
const express = require('express');
const app = express();
const path = require('path');
const Chat = require('./models/chat');


app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

//index route
app.get('/chats', async (req, res) => {
   try {
      let chats = await Chat.find();
      console.log(chats);
      res.render('index', { chats });
   } catch (err) {
      console.error('Error fetching chats', err);
      res.status(500).send('Error fetching chats');
   }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
main()
.then(()=>{
    console.log('Connected to MongoDB');
})
.catch((err)=>{    
    console.error('Error connecting to MongoDB', err);   }) 
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}








  //mongoose.connect('mongodb://127.0.0.1:27017/test');

// main()
// .then(()=>{
//     console.log('Connected to MongoDB');
// })
// .catch((err)=>{    
//     console.error('Error connecting to MongoDB', err);   })

// async function main() {
//   await mongoose.connect('mongodb://127.0.0.1:27017/test');
// }

// const userSchema = new mongoose.Schema({
//     name: String,
    
//     email: String,
//     age: Number,
// });

// const User = mongoose.model('User', userSchema);

// const user1 = new User({
//     name: 'Alice',
//     email: 'alice@example.com',
//     age: 30
// });
// user1.save();

// const user2 = new User({
//     name: 'Bob',
//     email: 'bob@example.com',
//     age: 25
// });
// user2.save();

// const user3 = new User({
//     name: 'Charlie',
//     email: 'charlie@example.com',
//     age: 35
// });
// user3.save();

// const user4 = new User({
//     name: 'Diana',
//     email: 'diana@example.com',
//     age: 28
// });
// user4.save();

// const user5 = new User({
//     name: 'Eve',
//     email: 'eve@example.com',
//     age: 32
// });
// user5.save();

// const user6 = new User({
//     name: 'Frank',
//     email: 'frank@example.com',
//     age: 27
// });
// user6.save();

// const user7 = new User({
//     name: 'Grace',
//     email: 'grace@example.com',
//     age: 31
// });
// user7.save();

// const user8 = new User({
//     name: 'Henry',
//     email: 'henry@example.com',
//     age: 29
// });
// user8.save();

// const user9 = new User({
//     name: 'Iris',
//     email: 'iris@example.com',
//     age: 26
// });
// user9.save();

// const user10 = new User({
//     name: 'Jack',
//     email: 'jack@example.com',
//     age: 33
// });
// user10.save();

// const user11 = new User({
//     name: 'Kate',
//     email: 'kate@example.com',
//     age: 24
// });
// user11.save();

// User.updateOne({ name: 'Alice' }, { age: 31 })
// .then(() => {
//     console.log('User updated successfully');
// })
// .catch((err) => {
//     console.error('Error updating user', err);
// });

// module.exports = {
//     User,
// };
//User.find().then((users)=>{
//     console.log(users);
// })
// .catch((err)=>{
//     console.error('Error fetching users', err);
// });
