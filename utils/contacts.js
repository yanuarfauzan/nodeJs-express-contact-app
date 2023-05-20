const fs = require('fs');

// membuat folder data jika belum ada
const dirPath = './data';
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
}

// membuat file contacts.json jika belum ada

const dataPath = './data/contacts.json';
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, '[]', 'utf-8');
}

// cari semua contact

const loadContact = () => {
    const fileBuffer = fs.readFileSync('data/contacts.json', 'utf-8');
    const contacts = JSON.parse(fileBuffer);
    return contacts;
};


// cari contact berdasarkan nama
const findContact = (nama) => {
    const contacts = loadContact();
    const contact = contacts.find((contact) => contact.nama.toLowerCase() === nama.toLowerCase());
    return contact;
}

// menimpa file contacts.json dengan data yang baru
const saveContacts = (contacts) => {
    fs.writeFileSync('data/contacts.json', JSON.stringify(contacts));
}


// menambah contact ke dalam file json
const addContact = (contact) => {
    const contacts = loadContact();
    contacts.push(contact);
    saveContacts(contacts);
}

// cek duplikat
const cekDuplikat = (nama) => {
    const contacts = loadContact();
    return contacts.find((contact) => contact.nama === nama);
}

// fungsi delete contact

const deleteContact = (nama) => {
    const contacts = loadContact();
    // telusuri contact sampai akhir setiap contact asalkan nama tidak sama dengan nama
    const filteredContacts = contacts.filter((contact) => contact.nama !== nama);
    // timpa apapun yang ada di dalam json nya dengan filteredContact
    saveContacts(filteredContacts);
}

// mengubah contact

const updateContact = (contactBaru) => {
    const contacts = loadContact();
    // hilangkan contact lama yang namanya sama dengan oldNama
    const filteredContacts = contacts.filter((contact) => contact.nama !== contactBaru.oldNama);
    // hapus oldNama biar tidak ikut ke kirim ke file json nya
    delete contactBaru.oldNama;
    // tambahkan contact baru ke filteredContacts
    filteredContacts.push(contactBaru);
    // timpa apapun yang ada di dalam json nya dengan filteredContact
    saveContacts(filteredContacts);
}

module.exports = { loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContact }