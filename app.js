const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const Mesaj = require('./models/mesaj');
const moment = require('moment');

const app = express();

moment.locale('tr');
app.locals.moment = moment;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'cok-gizli-anahtar',
    resave: false,
    saveUninitialized: true
}));

const dbURL = process.env.MONGO_URL || "mongodb+srv://admin:220325@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority"; 

mongoose.connect(dbURL)
  .then(() => console.log('✅ Veritabanına Bağlandık!'))
  .catch((err) => console.log('❌ Bağlantı Hatası:', err));

app.get('/', (req, res) => {
    Mesaj.find().sort({ tarih: -1 })
        .then((gelenMesajlar) => {
            const adminMi = req.session.admin;
            res.render('defter', { mesajlar: gelenMesajlar, admin: adminMi });
        })
        .catch((err) => {
            console.log(err);
            res.render('defter', { mesajlar: [], admin: false });
        });
});

app.get('/giris', (req, res) => {
    res.render('giris');
});

app.post('/giris-yap', (req, res) => {
    if (req.body.sifre === "220325") {
        req.session.admin = true;
        res.redirect('/');
    } else {
        res.send("<h1>Hatalı Şifre <a href='/giris'>Geri Dön</a></h1>");
    }
});

app.get('/cikis', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

app.post('/ekle', (req, res) => {
    const yeniMesaj = new Mesaj({ isim: req.body.isim, not: req.body.not });
    yeniMesaj.save()
        .then(() => res.redirect('/'))
        .catch(err => console.log(err));
});

app.get('/sil/:id', (req, res) => {
    if (req.session.admin) {
        Mesaj.findByIdAndDelete(req.params.id)
            .then(() => res.redirect('/'))
            .catch(err => console.log(err));
    } else {
        res.send("Yetkisiz işlem.");
    }
});

app.get('/duzenle/:id', (req, res) => {
    if (req.session.admin) {
        Mesaj.findById(req.params.id)
            .then(sonuc => res.render('duzenle', { mesaj: sonuc }))
            .catch(err => console.log(err));
    } else {
        res.send("Yetkisiz işlem.");
    }
});

app.post('/guncelle/:id', (req, res) => {
    if (req.session.admin) {
        Mesaj.findByIdAndUpdate(req.params.id, { isim: req.body.isim, not: req.body.not })
            .then(() => res.redirect('/'))
            .catch(err => console.log(err));
    } else {
        res.send("Yetkisiz işlem.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Sunucu ${PORT} portunda çalışıyor...`));