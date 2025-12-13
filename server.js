const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(cors({ origin: true, credentials: true }));

app.use(session({
  secret: 'gizli-anahtar-sade',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'apartman_yonetim',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4' 
});
// Otomatik Tamir
async function veritabaniTamir() {
    try {
        const connection = await pool.getConnection();
        await connection.query("ALTER DATABASE apartman_yonetim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        connection.release();
    } catch (error) { console.error(error);
    }
}

const authCheck = (req, res, next) => {
  if (!req.session.userID) return res.status(401).json({ error: 'Oturum gerekli' });
  next();
};
const adminCheck = (req, res, next) => {
  if (req.session.rol !== 'Yonetici') return res.status(403).json({ error: 'Yetkisiz' });
  next();
};
// --- API ---

app.post('/api/login', async (req, res) => {
  try {
    const { telNo, sifre } = req.body;
    const [users] = await pool.query('SELECT * FROM Kullanicilar WHERE TelNo = ?', [telNo]);
    if (users.length === 0 || users[0].Sifre !== sifre) return res.status(401).json({ error: 'Hatalı bilgiler' });
    const user = users[0];
    req.session.userID = user.UserID; req.session.rol = user.Rol; req.session.adSoyad = user.AdSoyad;
    req.session.blok = user.Blok; req.session.daire = user.DaireNo;
    res.json({ success: true, user: { adSoyad: user.AdSoyad, rol: user.Rol, blok: user.Blok, daire: user.DaireNo } 
});
  } catch (error) { res.status(500).json({ error: 'Hata' }); }
});

app.post('/api/admin/sakin-ekle', authCheck, adminCheck, async (req, res) => {
    try {
      const { adSoyad, telNo, sifre, blok, daireNo } = req.body;
      const [existing] = await pool.query('SELECT * FROM Kullanicilar WHERE TelNo = ?', [telNo]);
      if (existing.length > 0) return res.status(400).json({ error: 'Numara zaten kayıtlı' });
      
      await pool.query('INSERT INTO Kullanicilar (AdSoyad, TelNo, Sifre, Rol, Blok, DaireNo) VALUES (?, ?, ?, ?, ?, ?)', 
        [adSoyad, telNo, sifre, 'Sakin', blok, daireNo]);
     
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
});

app.post('/api/logout', (req, res) => { req.session.destroy(() => res.json({ success: true })); });
app.get('/api/check-session', (req, res) => {
  if (req.session.userID) res.json({ loggedIn: true, user: { userID: req.session.userID, adSoyad: req.session.adSoyad, rol: req.session.rol, blok: req.session.blok, daire: req.session.daire } });
  else res.json({ loggedIn: false });
});
app.get('/api/kategoriler', authCheck, async (req, res) => {
    try {
      const { tur, oncelik } = req.query;
      const [rows] = await pool.query('SELECT * FROM Sikayet_Kategorileri WHERE Tur = ? AND Oncelik = ?', [tur, oncelik]);
      res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
});
app.post('/api/sikayetler', authCheck, async (req, res) => {
    try {
      await pool.query('INSERT INTO Sikayetler (UserID, KategoriID) VALUES (?, ?)', [req.session.userID, req.body.kategoriID]);
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
});
app.get('/api/sikayetler/kullanici', authCheck, async (req, res) => {
    try {
      const [rows] = await pool.query(`SELECT s.*, k.Tanim, k.Tur, k.Oncelik FROM Sikayetler s JOIN Sikayet_Kategorileri k ON s.KategoriID = k.KategoriID WHERE s.UserID = ? ORDER BY s.TarihSaat DESC`, [req.session.userID]);
      res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
});
app.get('/api/sikayetler/tum', authCheck, adminCheck, async (req, res) => {
    try {
      const query = `
        SELECT s.*, k.Tanim, k.Tur, k.Oncelik, u.AdSoyad, u.TelNo, u.Blok, u.DaireNo
        FROM Sikayetler s 
        LEFT JOIN Sikayet_Kategorileri k ON s.KategoriID = k.KategoriID 
        LEFT JOIN Kullanicilar u ON s.UserID = u.UserID 
        ORDER BY s.TarihSaat DESC`;
      const [rows] = await pool.query(query);
      res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
});

// GÜNCELLENDİ: Durum "Cozuldu" olduğunda tarihi kaydet
app.put('/api/sikayetler/:id/durum', authCheck, adminCheck, async (req, res) => {
    try {
      const { durum, birim } = req.body;
      let query = 'UPDATE Sikayetler SET Durum = ?';
      let params = [durum];
      if (birim) { query += ', Birim = ?'; params.push(birim); }
      
      // Eğer durum 'Cozuldu' ise tarihi güncelle
      if (durum === 'Cozuldu') {
          query += ', CozulmeTarihi = NOW()';
      }

      query += ' WHERE SikayetID = ?';
      params.push(req.params.id);
      await pool.query(query, params);
      res.json({ success: true });
  
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
});
app.get('/api/istatistikler', authCheck, adminCheck, async (req, res) => {
    try {
      const [stats] = await pool.query(`SELECT COUNT(*) as toplam, SUM(CASE WHEN Durum = 'Beklemede' THEN 1 ELSE 0 END) as beklemede, SUM(CASE WHEN Durum = 'Cozuldu' THEN 1 ELSE 0 END) as cozuldu FROM Sikayetler`);
      const [finans] = await pool.query("SELECT SUM(Miktar) as alacak FROM Aidatlar WHERE Durum = 'Odenmedi'");
      const veri = stats[0];
      veri.alacak = finans[0].alacak || 0; 
      res.json(veri);
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
});

// --- YENİ: ANALİZ VERİLERİ ---
app.get('/api/analizler', authCheck, adminCheck, async (req, res) => {
    try {
        // 1. Kategori Analizi
        const [kategori] = await pool.query(`
            SELECT k.Tanim as Kategori, COUNT(*) as Sayi 
            FROM Sikayetler s 
            JOIN Sikayet_Kategorileri k ON s.KategoriID = k.KategoriID 
            GROUP BY k.Tanim ORDER BY Sayi DESC LIMIT 5`);

        // 2. Blok Yoğunluğu (Heatmap)
        const [blok] = await pool.query(`
            SELECT u.Blok, COUNT(*) as Sayi 
            FROM Sikayetler s 
            JOIN Kullanicilar u ON s.UserID = u.UserID 
            WHERE u.Blok IS NOT NULL 
            GROUP BY u.Blok`);

        // 3. Personel Performansı & SLA
        // Çözülme süresi (Saat cinsinden fark)
        const [performans] = await pool.query(`
            SELECT Birim, AVG(TIMESTAMPDIFF(HOUR, TarihSaat, CozulmeTarihi)) as OrtSure 
            FROM Sikayetler 
            WHERE Durum = 'Cozuldu' AND Birim IS NOT NULL 
            GROUP BY Birim`);

        // 4. Genel SLA Ortalaması
        const [sla] = await pool.query(`
            SELECT AVG(TIMESTAMPDIFF(HOUR, TarihSaat, CozulmeTarihi)) as genelOrtalama 
            FROM Sikayetler WHERE Durum = 'Cozuldu'`);

        res.json({ kategori, blok, personel: performans, sla: sla[0] });
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
});

app.get('/api/duyurular', authCheck, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Duyurular ORDER BY Tarih DESC LIMIT 5');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
});
app.post('/api/duyurular', authCheck, adminCheck, async (req, res) => {
    try {
        const { baslik, icerik } = req.body;
        await pool.query('INSERT INTO Duyurular (Baslik, Icerik) VALUES (?, ?)', [baslik, icerik]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
});
app.post('/api/aidatlar/ekle', authCheck, adminCheck, async (req, res) => {
    try {
        const { hedef, baslik, miktar, tarih } = req.body; 
        if (hedef === 'herkes') {
            await pool.query(
                 `INSERT INTO Aidatlar (UserID, Baslik, Miktar, SonOdemeTarihi) 
                 SELECT UserID, ?, ?, ? FROM Kullanicilar WHERE Rol = 'Sakin'`, 
                [baslik, miktar, tarih]
            );
        } else {
            await pool.query(
                'INSERT INTO Aidatlar (UserID, Baslik, Miktar, SonOdemeTarihi) VALUES (?, ?, ?, ?)',
                [hedef, baslik, miktar, tarih]
            );
        }
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
});
app.get('/api/aidatlar/ozet', authCheck, async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM Aidatlar WHERE UserID = ? AND Durum = 'Odenmedi' ORDER BY SonOdemeTarihi ASC", [req.session.userID]);
        let toplam = 0;
        rows.forEach(r => toplam += parseFloat(r.Miktar));
        res.json({ toplam: toplam, liste: rows });
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
});
app.get('/api/aidatlar/tum', authCheck, adminCheck, async (req, res) => {
    try {
        const query = `
            SELECT a.*, u.AdSoyad, u.Blok, u.DaireNo 
            FROM Aidatlar a 
            JOIN Kullanicilar u ON a.UserID = u.UserID 
            ORDER BY a.Durum ASC, a.SonOdemeTarihi ASC`;
    
    const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
});
app.put('/api/aidatlar/:id/ode', authCheck, adminCheck, async (req, res) => {
    try {
        await pool.query("UPDATE Aidatlar SET Durum = 'Odendi' WHERE AidatID = ?", [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
});
app.get('/api/sakinler', authCheck, adminCheck, async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT UserID, AdSoyad, Blok, DaireNo FROM Kullanicilar WHERE Rol = 'Sakin' ORDER BY Blok, DaireNo");
        res.json(rows);
    } catch (error) { res.status(500).json({ error: 'Hata' }); }
});
app.listen(PORT, async () => { 
    console.log(`Server çalışıyor: http://localhost:${PORT}`);
    await veritabaniTamir();
});