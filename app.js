const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const Mesaj = require('./models/mesaj');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'cok-gizli-kelime',
    resave: false,
    saveUninitialized: true
}));

const dbURL = "mongodb+srv://admin:220325@cluster0.fynxfgn.mongodb.net/?appName=Cluster0"

mongoose.connect(dbURL)
  .then(() => console.log('✅ Veritabanına Bağlandık!'))
  .catch((err) => console.log('❌ Bağlantı Hatası:', err));

app.get('/', (req, res) => {
    Mesaj.find().sort({ tarih: -1 })
        .then((gelenMesajlar) => {

            const adminMi = req.session.admin;
            
            res.render('defter', { 
                mesajlar: gelenMesajlar, 
                admin: adminMi 
            });
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
    const girilenSifre = req.body.sifre;

    if (girilenSifre === "220325") {
        req.session.admin = true;
        res.redirect('/');
    } else {
        res.send("<h1>Yanlış Şifre! <a href='/giris'>Geri Dön</a></h1>");
    }
});

app.get('/cikis', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            console.log(err);
        }
        res.redirect('/');
    });
});

app.post('/ekle', (req, res) => {
    const yeniMesaj = new Mesaj({ 
        isim: req.body.isim, 
        not: req.body.not 
    });

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
        res.send("Yetkiniz yok!");
    }
});

app.get('/duzenle/:id', (req, res) => {
    if (req.session.admin) {
        Mesaj.findById(req.params.id)
            .then(sonuc => res.render('duzenle', { mesaj: sonuc }))
            .catch(err => console.log(err));
    } else {
        res.send("Yetkiniz yok!");
    }
});

app.post('/guncelle/:id', (req, res) => {
    if (req.session.admin) {
        Mesaj.findByIdAndUpdate(req.params.id, { 
            isim: req.body.isim, 
            not: req.body.not 
        })
        .then(() => res.redirect('/'))
        .catch(err => console.log(err));
    } else {
        res.send("Yetkiniz yok!");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Sunucu ${PORT} portunda çalışıyor...`));