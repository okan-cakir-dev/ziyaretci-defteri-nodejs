const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Mesaj = require('./models/mesaj');

const app = express();

// Ayarlar
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// --- MONGODB BAĞLANTISI ---
// BURAYA KENDİ LİNKİNİ YAPIŞTIR (Şifreni girmeyi unutma!)
// Linkin şuna benzemeli: mongodb+srv://admin:12345@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
const dbURL = "BURAYA_GERCEK_LINKINI_YAPISTIR"; 

mongoose.connect(dbURL)
  .then(() => console.log('✅ Veritabanına Bağlandık!'))
  .catch((err) => console.log('❌ Bağlantı Hatası:', err));
// ---------------------------

// 1. ANASAYFA (Listeleme)
app.get('/', (req, res) => {
    Mesaj.find().sort({ tarih: -1 })
        .then((gelenMesajlar) => {
            // 'defter' sayfasını aç
            res.render('defter', { mesajlar: gelenMesajlar });
        })
        .catch((err) => console.log(err));
});

// 2. EKLEME (Kaydetme)
app.post('/ekle', (req, res) => {
    const yeniMesaj = new Mesaj({
        isim: req.body.isim,
        not: req.body.not
    });

    yeniMesaj.save()
        .then(() => {
            // Kaydettikten sonra ANASAYFAYA ('/') git
            res.redirect('/'); 
        })
        .catch((err) => console.log(err));
});

// 3. SİLME
app.get('/sil/:id', (req, res) => {
    Mesaj.findByIdAndDelete(req.params.id)
        .then(() => {
            res.redirect('/');
        })
        .catch((err) => console.log(err));
});

// 4. DÜZENLEME SAYFASINI GÖSTER
app.get('/duzenle/:id', (req, res) => {
    Mesaj.findById(req.params.id)
        .then((sonuc) => {
            res.render('duzenle', { mesaj: sonuc });
        })
        .catch((err) => console.log(err));
});

// 5. GÜNCELLEME İŞLEMİ
app.post('/guncelle/:id', (req, res) => {
    Mesaj.findByIdAndUpdate(req.params.id, {
        isim: req.body.isim,
        not: req.body.not
    })
    .then(() => {
        res.redirect('/');
    })
    .catch((err) => console.log(err));
});

// SUNUCUYU BAŞLAT (Render Uyumlu Port Ayarı)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Sunucu ${PORT} portunda çalışıyor...`);
});