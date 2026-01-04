const express = require('express');
const fs = require('fs');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// BU FONKSİYONU ESKİSİNİN YERİNE YAPIŞTIR
const verileriOku = () => {
    try {
        const dosya = fs.readFileSync('mesajlar.json', 'utf-8');
        return JSON.parse(dosya);
    } catch (hata) {
        // Eğer dosya yoksa veya bozuksa burası çalışır
        console.log("Dosya okunurken hata oluştu (Bu normal olabilir):", hata.message);
        return []; // <-- EN ÖNEMLİ KISIM BURASI! MUTLAKA OLMALI.
    }
};

const verileriKaydet = (veriListesi) => {
    fs.writeFileSync('mesajlar.json', JSON.stringify(veriListesi, null, 2));
};

app.get('/', (istek, cevap) => {
    // BURASI ÇOK ÖNEMLİ:
    // Eğer verileriOku() undefined dönerse, manuel olarak [] (boş liste) veriyoruz.
    const mesajlar = verileriOku() || []; 
    
    cevap.render('defter', { gelenMesajlar: mesajlar });
});

app.post('/ekle', (istek, cevap) => {
    const mesajlar = verileriOku();

    mesajlar.push({
        isim: istek.body.isim,
        not: istek.body.not
    });

    verileriKaydet(mesajlar);
    cevap.redirect('/');
});

app.get('/sil/:id', (istek, cevap) => {
    const mesajlar = verileriOku();
    const sira = istek.params.id;

    mesajlar.splice(sira, 1);

    verileriKaydet(mesajlar);
    cevap.redirect('/');
});

app.get('/duzenle/:id', (istek, cevap) => {
    const mesajlar = verileriOku();
    const sira = istek.params.id;
    const secilenMesaj = mesajlar[sira];

    cevap.render('duzenle', { id: sira, veri: secilenMesaj });
});

app.post('/guncelle/:id', (istek, cevap) => {
    const mesajlar = verileriOku();
    const sira = istek.params.id;

    mesajlar[sira] = {
        isim: istek.body.isim,
        not: istek.body.not
    };

    verileriKaydet(mesajlar);
    cevap.redirect('/');
});

app.listen(3000, () => {
    console.log('Kalıcı Hafızalı Sunucu Açık: http://localhost:3000');
});