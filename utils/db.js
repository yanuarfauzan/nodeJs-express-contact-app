const mongoose = require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017/yanuar', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});




// // Menambah satu data
// const contact1 = new Contact({
//     nama: "Ahmad",
//     noHp: "081234567890",
//     email: "ahmad@gmail.com"
// });

// // Simpan ke collenctions
// contact1.save().then((contact) => console.log(contact));