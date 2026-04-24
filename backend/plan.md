# ElderConnect - Proje Planı ve Görevler

Bu dosya ElderConnect uygulamasının roller, kullanım durumları (use cases) ve özelliklerine dayalı ana görevlerini takip etmek için bir kontrol listesi (checkboard) olarak kullanılacaktır.

## Kullanıcı Rolleri ve Yetkileri

### 1. Standart Kullanıcı (Role_User)
- [x] Uygulamaya giriş yaptıklarında official (resmi) hesapların ve şahısların paylaştığı etkinlikleri "ana akış" üzerinde görüntüleyebilme.
- [x] Bu paylaşımlara yorum yazabilme.
- [x] Paylaşımlar üzerinde Upvote ve Downvote şeklinde oy kullanabilme.
- [ ] Paylaşımları "Kaydet" butonu ile kaydedip, kendi profil sayfalarında listeleyebilme.
- [x] Kendi profil sayfasına erişebilme ve kendisine ait bilgileri görüntüleyebilme.
- [x] İsteğe bağlı olarak yeni bir "Community" (Topluluk) oluşturabilme ve oluşturduğu community'nin yetkili **Community Admin'i** olma.
- [x] Ana sayfada bulunan "Communityler" sekmesi üzerinden mevcut toplulukları listeleyebilme ve katılma isteği gönderebilme.
- [x] **(Eğer Community Admin ise)** Topluluğa gelen katılma isteklerini kabul/reddetme ve diğer topluluk işlerini "Community Dashboard" üzerinden yönetebilme.
- [x] **(Eğer Community Admin ise)** Community'deki diğer kullanıcılara adminlik yetkisi verebilme.
- [ ] **(Eğer Community Admin ise)** İstediği bir postu admini olduğu community'lerde yeniden paylaşabilme (Repost). (Repost tuşuna tıklandığında yetkili olunan community'ler listelenir ve seçim yaptırılır).

### 2. Resmi Hesap Yöneticisi (Role_Official)
- [ ] Belediye, vakıf vb. kurumsal hesapları temsil eden kullanıcılardır.
- [ ] Uygulamaya giriş yaptıklarında "Resmi Hesap Dashboard"ına yönlendirilme.
- [ ] Dashboard üzerinde, daha önce yapmış oldukları paylaşımları ve bunlara ait istatistiksel bilgileri (ortalama upvote/downvote oranları, etkileşimler vb.) görüntüleyebilme.
- [ ] Dashboard üzerinde yer alan özellik/buton aracılığıyla yeni bir paylaşım/etkinlik oluşturabilme (Oluşturduklarında user'ların ana akışına düşmesi).

### 3. Süper Yönetici (Role_Admin)
- [ ] Tüm sistemi denetleyen ve kontrol eden süper kullanıcı profilidir.
- [ ] Giriş yapıldığında tüm user'ları, official hesapları ve yapılan postları içeren "Admin Dashboard"ına erişebilme.
- [ ] Yeni bir official (kurum) hesap kayıt olduğunda, bu hesapları onay sırasına (talep sırasına) koyma ve ilgili dashboard sekmesi üzerinden onaylama/reddetme işlemini gerçekleştirme.
- [ ] İhtiyaç duyduğunda istenmeyen paylaşımları (postları) doğrudan sistemden kaldırabilme.
- [ ] Gerekli durumlarda User veya Official hesapları sistemden silebilme. 

---

## Temel Özellikler ve Ekranlar (Features)

### Ana Sayfa (Home Page)
- [ ] Tüm kullanıcı tiplerinin uygulamaya giriş yaptıklarında gördüğü ortak paylaşımların (Official hesap postlarının) aktığı merkez ekran.
- [ ] Dinamik Header: Giriş yapan kullanıcı tipine (Role_User, Role_Official, Role_Admin) özel olarak değişen menü çubuğu (Header). Buralardan gerekli yönetim panellerine (Dashboard) veya profil sekmesine doğrudan yönlendirme butonları içerir.
- [ ] Eskiden yapılmış olan/süresi geçen etkinliklere erişimi sağlamak adına ayrı bir "Geçmiş Etkinlikler" (Biten Etkinlikler) sekmesi barındırma.

### Postlar (Etkinlik Paylaşımları)
- [ ] Official kullanıcılar (resmi hesaplar) tarafından oluşturulur.
- [ ] Post içeriği: Resimler, açıklama mesajı, etkinlik tarihi, ve post oluşturulma tarihi.
- [ ] Standart user'lar tarafından post üzerinde etkileşime girilecek buton/aksiyonlar:
  - Upvote / Downvote, Yorum Yap, Kaydet.
- [ ] Community Admin'leri tarafından post üzerinde kullanılacak:
  - Repost et butonu.
- [ ] **Otomatik Durum Güncelleme:** Etkinliğin yapılma süresi/sona erme tarihi bittiğinde, ilgili post kırmızı bir font ile "Bu etkinlik bitmiştir" ibaresiyle güncellenir ve güncel ana akıştan düşerek arşiv niteliğindeki ilgili sekmeye (Geçmiş etkinlikler) aktarılır.

### Login / Register Sayfası
- [ ] Tüm sistem için ortak tek bir login sayfası bulunur ancak giriş işleminden sonra dönen datadaki Role/Yetki bazlanarak doğru sayfaya (Home screen/Dashboards) dinamik yönlendirme yapılır.
- [ ] Kullanıcı tipi (User veya Official) seçimini içeren bir kayıt (Register) ekranı olması. 

### Dashboard'lar
- [x] **Community Dashboard:** Topluluk üyelerinin, katılma isteklerinin, repost ayarlamalarının ve admin yetkilerinin kontrolü.
- [ ] **Resmi (Official) Hesap Dashboard:** Etkinliklerin analitik bazda kontrolü, yeni etkinlik oluşturma yetkileri.
- [ ] **Süper Admin Dashboard:** Sistemdeki tüm hareketleri (Kullanıcı silme, post gizleme/kaldırma, yeni official hesabı onaylama vb.) yönetebilecek super admin paneli.

### Mekan ve Konum (Location)
- [ ] Uygulama genelinde yaşlı dostu mekanların veya etkinlik alanlarının kaydedilmesi ve aranabilmesi.
- [ ] Etkinliklere (Postlara) konum bilgisi (Location) eklenebilmesi, böylece etkinliklerin nerede gerçekleştiğinin adres bazlı olarak görülebilmesi.
- [ ] Topluluklara (Community) has buluşma mekanlarının tanımlanabilmesi.
