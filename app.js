// menggunakan framework express js
const express = require('express');

// method override
const methodOverride = require('method-override');

// require koneksi db
require('./utils/db');

// require model contact
const Contacts = require('./model/Contact');

// express-session
const session = require('express-session');

// cookieParser
const cookieParser = require('cookie-parser');

// connect-flash
const flash = require('connect-flash');


// loadContact
// const { loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContact } = require('./utils/contacts');


const app = express();
const port = 3000;

// setup method oberride
app.use(methodOverride('_method'));

// configurasi flash

app.use(cookieParser('secret'));

app.use(
    session({
        cookie: { maxAge: 6000 },
        secret: 'secret',
        resave: true,
        saveUninitialized: true,
    })
);
app.use(flash());

// express-validator

const { body, validatonResult, validationResult, check } = require('express-validator');


// gunakan ejs
app.set('view engine', 'ejs');
// middleware url encoded
app.use(express.urlencoded({ extended: true }));

// route
app.get('/', (req, res) => {
    // mengembalikan file html
    // res.sendFile('./index.html', { root: __dirname });

    const mahasiswa = [
        { nama: 'Muhammad Firmansyah', kelas: 'XI RPL 1' },
        { nama: 'Jujun Dani', kelas: 'XI RPL 2' },
        { nama: 'Mubarak Syabani', kelas: 'XI RPL 3' },
    ];

    const title = 'Home';
    res.render('index', { nama: 'Yanuar', mahasiswa, title, layout: 'layout/main.layouts' });
})

app.get('/about', (req, res) => {
    const title = 'About';
    res.render('about', { title });
})

// route contact
app.get('/contact', async (req, res) => {

    // mengambil data dari JSON untuk di read di contact.ejs
    // const contacts = loadContact();

    const contacts = await Contacts.find();
    const title = 'Contact';
    res.render('contact', { title, contacts, msg: req.flash('msg') });
})

// route tambah data contact
app.get('/contact/add', (req, res) => {
    const title = 'Tambah Data Contact';

    res.render('addContact', { title });
})

// proses data contact
// check untuk validasi value
app.post('/contact',
    [
        // cek nama apakah sudah ada atau belum
        body('nama').custom(async (value) => {
            // cek duplikat manual
            // const duplikat = cekDuplikat(value);

            // cek duplikat menggunakan mongoose/mongodb
            const duplikat = await Contacts.findOne({ nama: value });

            // kalau sudah ada maka tampilkan error
            if (duplikat) {
                throw new Error('Nama contact sudah ada');
            }
            // kalau belum maka lolos validasi untuk value nama
            return true;
        }),
        // validasi email apakah sesuai format atau belum
        check('email', 'Email tidak valid').isEmail(),
        // validasi noHp apakah sesuai format atau belum
        check('noHp', 'No hp tidak valid').isMobilePhone('id-ID'),

    ], (req, res) => {
        // menangkap error jika validasi tidak lolos
        const errors = validationResult(req);
        // kalau ada error atau isi error tidak kosong
        if (!errors.isEmpty()) {
            // return res.status(400).json({ errors: errors.array() });
            res.render('addContact',
                {
                    title: 'Form tambah contact',
                    // error massage bentuk object dimasukkan ke variable errors dan dikirimkan ke view addContact.ejs
                    errors: errors.array()
                })
        } else {
            // insert object menggunakan mongoose/mongodb
            Contacts.insertMany(req.body, (error, result) => {

                // kirimkan flash message
                req.flash('msg', 'Data contact berhasil ditambahkan');
                // alihkan ke view contact
                res.redirect('/contact');
            });

        }

    });

// route delete contact
// app.get('/contact/delete/:nama', async (req, res) => {
//     // Manual
//     // const contact = findContact(req.params.nama);

//     // mongodb
//     const contact = await Contacts.findOne({ nama: req.params.nama });
//     // jika contact tidak ada
//     if (!contact) {
//         res.status(404);
//         res.send('<h1>404</h1>')
//     } else {
//         // manual 
//         // deleteContact(req.params.nama);
//         // mongodb
//         Contacts.deleteOne({ _id: contact._id }).then((result) => {

//             req.flash('msg', 'Data contact berhasil dihapus');
//             res.redirect('/contact');
//         });
//     }
// })

app.delete('/contact', (req, res) => {
    Contacts.deleteOne({ nama: req.body.nama }).then((result) => {
        req.flash('msg', 'Data contact berhasil dihapus');
        res.redirect('/contact');
    });
})



// route edit data contact
app.get('/contact/edit/:nama', async (req, res) => {
    const title = 'Form Ubah Data';
    const contact = await Contacts.findOne({ nama: req.params.nama });
    res.render('editContact', { title, contact });
})

// route update data contact
app.put('/contact',
    [
        // cek nama apakah sudah ada atau belum
        body('nama').custom(async (value, { req }) => {
            const duplikat = await Contacts.findOne({ nama: value });
            // kalau sudah ada maka tampilkan error
            if (value !== req.body.oldNama && duplikat) {
                throw new Error('Nama contact sudah ada');
            }
            // kalau belum maka lolos validasi untuk value nama
            return true;
        }),
        // validasi email apakah sesuai format atau belum
        check('email', 'Email tidak valid').isEmail(),
        // validasi noHp apakah sesuai format atau belum
        check('noHp', 'No hp tidak valid').isMobilePhone('id-ID'),

    ], (req, res) => {
        // menangkap error jika validasi tidak lolos
        const errors = validationResult(req);
        // kalau ada error atau isi error tidak kosong
        if (!errors.isEmpty()) {
            // return res.status(400).json({ errors: errors.array() });
            res.render('editContact',
                {
                    title: 'Form tambah contact',
                    // error massage bentuk object dimasukkan ke variable errors dan dikirimkan ke view addContact.ejs
                    errors: errors.array(),
                    contact: req.body
                })
        } else {

            Contacts.updateOne(
                { _id: req.body._id },
                {
                    $set: {
                        nama: req.body.nama,
                        noHp: req.body.noHp,
                        email: req.body.email,
                    }
                }
            ).then((result) => {


                // kirimkan flash message
                req.flash('msg', 'Data contact berhasil diubah');
                // alihkan ke view contact
                res.redirect('/contact');
            });
        }

    });

// route detail contact
app.get('/contact/:nama', async (req, res) => {
    // cari contact berdasarkan nama di file json
    // const contact = findContact(req.params.nama);

    // cari contact berdasarkan nama dari mongodb
    const contact = await Contacts.findOne({ nama: req.params.nama })

    const title = 'Detail Contact';
    res.render('detail', { title, contact });
})

app.listen(port, () => {
    console.log(`Example app listening on post ${port}`);
});