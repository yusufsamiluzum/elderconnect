# ElderConnect Backend Servis Rehberi

Bu belge, ElderConnect platformu için geliştirilen backend servislerinin işlevlerini ve sunduğu API uç noktalarını (endpoints) açıklamaktadır.

## 🔐 1. Auth & Identity Service (Kimlik Yönetimi)
Sistemdeki tüm giriş ve yetkilendirme süreçlerini yönetir. JWT tabanlı güvenlik sağlar.

- **POST `/api/auth/register`**: Yeni kullanıcı kaydı oluşturur.
- **POST `/api/auth/login`**: Kullanıcı girişi yapar; Access Token ve Refresh Token döner.
- **POST `/api/auth/refresh`**: Refresh Token kullanarak yeni bir Access Token üretir.
- **POST `/api/auth/logout`**: Mevcut oturumu sonlandırır ve refresh token'ı siler.
- **GET `/api/auth/validate`**: Mevcut token'ın geçerliliğini kontrol eder.

---

## 👤 2. User Service (Profil ve Sosyal Veri)
Kullanıcıların kişisel verilerini ve platformdaki ayak izlerini yönetir.

- **GET `/api/users/{username}`**: Bir kullanıcının kamuya açık profil bilgilerini döner.
- **PUT `/api/users/me`**: Giriş yapmış kullanıcının profilini günceller (isim, soyisim, açıklama).
- **GET `/api/users/me/stats`**: Toplam post, yorum ve karma puanı özetini döner.
- **GET `/api/users/me/saved`**: Kullanıcının kaydettiği postların listesini döner.
- **POST/DELETE `/api/users/me/saved/{postId}`**: Bir postu kaydeder veya kaydını kaldırır.
- **GET `/api/users/{username}/activity`**: Kullanıcının geçmiş post ve yorumlarını listeler.

---

## 📝 3. Post & Bulletin Service (İçerik ve Akış)
Paylaşımlar, resmi duyurular ve bülten akışlarını yönetir.

- **GET `/api/posts`**: Ana akış. `sort` parametresi (hot, new, top) ile sıralanabilir.
- **GET `/api/posts/bulletin`**: Sadece doğrulanmış kurumların paylaştığı resmi bültenler.
- **POST `/api/posts`**: Yeni bir post oluşturur (Bireysel veya bir topluluğa).
- **GET `/api/posts/{id}`**: Post detayı ve yazar bilgilerini döner.
- **PUT/DELETE `/api/posts/{id}`**: Postu günceller veya siler (Yetki kontrolü ile).
- **POST `/api/posts/{id}/vote`**: Posta oy verir (UPVOTE veya DOWNVOTE).
- **POST `/api/posts/{id}/forward`**: Bir postu başka bir topluluğa yönlendirir.

---

## 🤝 4. Community Service (Topluluk ve Grup Yönetimi)
Platformdaki ilgi alanı veya bölge bazlı toplulukları yönetir.

- **GET `/api/communities`**: Tüm toplulukları listeler (popular veya official filtresi ile).
- **POST `/api/communities`**: Yeni bir topluluk oluşturur.
- **GET `/api/communities/{name}`**: Topluluğun detay sayfasını döner.
- **POST/DELETE `/api/communities/{id}/membership`**: Topluluğa üye olur veya ayrılır.
- **GET `/api/communities/{id}/posts`**: Sadece o topluluğa ait paylaşımları listeler.
- **POST/DELETE `/api/communities/{id}/moderators`**: Topluluğa moderatör atar veya kaldırır (Admin yetkisi).

---

## 💬 5. Comment Service (Yorumlaşma)
Paylaşımlar altındaki hiyerarşik (ağaç yapısı) yorumlaşma sistemini yönetir.

- **GET `/api/posts/{postId}/comments`**: Bir postun tüm yorumlarını iç içe geçmiş (replies) halde döner.
- **POST `/api/posts/{postId}/comments`**: Bir posta ana yorum ekler.
- **POST `/api/comments/{commentId}/replies`**: Mevcut bir yoruma yanıt (alt yorum) ekler.
- **PUT/DELETE `/api/comments/{id}`**: Yorumu günceller veya siler.
- **POST `/api/comments/{id}/vote`**: Yoruma oy verir.

---

## 📍 6. Location Service (Mekan ve Konum)
Yaşlı dostu mekanların ve topluluk buluşma noktalarının yönetimi.

- **GET `/api/locations`**: Şehir ve mekan tipine göre arama yapar.
- **GET `/api/communities/{id}/locations`**: Bir topluluğa tanımlanmış mekanları listeler.
- **POST `/api/communities/{id}/locations`**: Topluluk için yeni bir mekan ekler (Moderasyon yetkisiyle).

---

## 🔍 7. Search & Discovery (Arama)
Platform genelinde çapraz arama sağlar.

- **GET `/api/search`**: `q` parametresi ile postlar, topluluklar ve kullanıcılar arasında arama yapar.

---

