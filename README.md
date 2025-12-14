# 🏢 Apartman Yönetim Sistemi

Yönetim Bilişim Sistemleri Bölümü, **Sistem Analizi ve Tasarımı** dersi için geliştirilmiş web tabanlı apartman ve site yönetim otomasyonudur.

Bu proje; site yöneticilerinin aidat takibi, arıza yönetimi, duyuru işlemleri ve site sakinlerinin durum takibini dijitalleştirmeyi amaçlar.

## 🚀 Proje Hakkında

Geleneksel yöntemlerin (defter, Excel) yarattığı veri güvenliği ve takip sorunlarını çözmek amacıyla geliştirilmiştir. Sistem, Rol Tabanlı Erişim Kontrolü (RBAC) kullanarak Yönetici ve Sakinler için farklı arayüzler sunar.

## 🛠️ Kullanılan Teknolojiler

* **Backend:** Node.js, Express.js
* **Veritabanı:** MySQL
* **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
* **Grafik ve Analiz:** Chart.js (Dashboard Analizleri için)
* **Güvenlik:** Rol bazlı oturum yönetimi (Session), Yönetici onaylı kayıt sistemi.

---

## ✨ Temel Özellikler

### 👤 Yönetici (Admin) Modülü
* **Dashboard:** Şikayet kategorileri, blok yoğunluğu, personel SLA performansı ve finansal özet grafikleri (Chart.js).
* **Sakin Yönetimi:** Siteye dışarıdan kayıt kapalıdır. Sadece yönetici yeni sakin ekleyebilir.
* **Finans:** Toplu aidat tanımlama ve ödeme takibi.
* **Talep Yönetimi:** Gelen arıza bildirimlerini görüntüleme, personele atama ve çözüldü olarak işaretleme.
* **Duyurular:** Tüm siteye anlık duyuru (Su kesintisi vb.) geçme.

### 🏠 Sakin (User) Modülü
* **Arıza Bildirimi:** Ev içi veya ortak alan sorunlarını (Fotoğraf/Konum/Aciliyet) bildirme.
* **Borç Takibi:** Güncel aidat borcunu görüntüleme.
* **Süreç Takibi:** Oluşturduğu şikayetin durumunu (Beklemede -> İşlemde -> Çözüldü) izleme.

---

## 💻 Kurulum (Localhost)

Projeyi kendi bilgisayarınızda çalıştırmak isterseniz:

1.  Repoyu klonlayın:
    ```bash
    git clone [https://github.com/BATosi7/site-yonetim-sistemi.git](https://github.com/BATosi7/site-yonetim-sistemi.git)
    ```
2.  Gerekli paketleri yükleyin:
    ```bash
    npm install
    ```
3.  Veritabanını oluşturun:
    * MySQL'de `apartman_yonetim` adında bir veritabanı açın.
    * `server.js` dosyasındaki veritabanı bağlantı bilgilerini kendi MySQL şifrenize göre düzenleyin.
4.  Sunucuyu başlatın:
    ```bash
    node server.js
    ```
5.  Tarayıcıda `http://localhost:3000` adresine gidin.

---

## 🔐 Test Hesapları (Demo)

**Yönetici Girişi:**
* **Tel:** 1
* **Şifre:** 1

**Sakin Girişi:**
* **Tel:** 5
* **Şifre:** 5
