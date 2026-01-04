const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Mesaj = require('./models/mesaj'); 

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const dbURL = "mongodb+srv://admin:12345@cluster0.fynxfgn.mongodb.net/?appName=Cluster0"; 

mongoose.connect(dbURL)
  .then(() => console.log('✅ Veritabanına Bağlandık!'))
  .catch((err) => console.log('❌ Bağlantı Hatası:', err));

app.get('/', (req, res) => {
    Mesaj.find().sort({ tarih: -1 })
        .then((gelenMesajlar) => {
            res.render('defter', { mesajlar: gelenMesajlar });
        })
        .catch((err) => {
            console.log(err);
            res.send("Veri çekilirken hata oluştu.");
        });
});

app.post('/ekle', (req, res) => {
    console.log("Formdan gelen veri:", req.body); 

    const yeniMesaj = new Mesaj({
        isim: req.body.isim,
        not: req.body.not
    });

    yeniMesaj.save()
        .then(() => {
            console.log("Mesaj başarıyla kaydedildi!");
            res.redirect('/');
        })
        .catch((err) => {
            console.log("Kaydederken hata:", err);
            res.send("Kaydederken hata oluştu.");
        });
});

app.get('/sil/:id', (req, res) => {
    const id = req.params.id;

    Mesaj.findByIdAndDelete(id)
        .then(() => {
            console.log("Mesaj silindi.");
            res.redirect('/'); 
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get('/duzenle/:id', (req, res) => {
    const id = req.params.id;

    Mesaj.findById(id)
        .then((sonuc) => {
            res.render('duzenle', { mesaj: sonuc });
        })
        .catch((err) => console.log(err));
});

app.post('/guncelle/:id', (req, res) => {
    const id = req.params.id;

    Mesaj.findByIdAndUpdate(id, {
        isim: req.body.isim,
        not: req.body.not
    })
    .then(() => {
        res.redirect('/'); 
    })
    .catch((err) => console.log(err));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Sunucu ${PORT} portunda çalışıyor...`);
});