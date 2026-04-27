package com.backend.elderconnect.config;

import com.backend.elderconnect.entities.*;
import com.backend.elderconnect.repositories.*;
import com.backend.elderconnect.services.GeminiService;
import com.backend.elderconnect.services.RecommendationService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final PostRepository postRepository;
    private final EventRepository eventRepository;
    private final PostVoteRepository postVoteRepository;
    private final CommentRepository commentRepository;
    private final OfficialProfileRepository officialProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final RecommendationService recommendationService;

    public DataSeeder(UserRepository userRepository, CommunityRepository communityRepository,
                      PostRepository postRepository, EventRepository eventRepository,
                      PostVoteRepository postVoteRepository, CommentRepository commentRepository,
                      OfficialProfileRepository officialProfileRepository,
                      PasswordEncoder passwordEncoder,
                      RecommendationService recommendationService) {
        this.userRepository = userRepository;
        this.communityRepository = communityRepository;
        this.postRepository = postRepository;
        this.eventRepository = eventRepository;
        this.postVoteRepository = postVoteRepository;
        this.commentRepository = commentRepository;
        this.officialProfileRepository = officialProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.recommendationService = recommendationService;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("ElderConnect Devasa Veri Seti Yükleniyor... (Hizli Kurulum)");

        // 1. ADMIN
        User admin = createUser("admin", "Sistem", "Yöneticisi", "ElderConnect Admin");
        admin.getRoles().add(UserRole.ROLE_ADMIN);
        userRepository.save(admin);

        // 2. KULLANICILAR
        User u1 = createUser("mehmet_bey", "Mehmet", "Yılmaz", "Emekli Ziraat Mühendisi, toprak aşığı.");
        User u2 = createUser("fatma_hanim", "Fatma", "Kaya", "Mutfak sırları ve el işleri uzmanı.");
        User u3 = createUser("ali_hoca", "Ali", "Demir", "Emekli Tarih Öğretmeni, kitap kurdu.");
        User u4 = createUser("ayse_teyze", "Ayşe", "Yıldız", "Seyahat etmeyi ve yeni yerler görmeyi sever.");
        User u5 = createUser("huseyin_amca", "Hüseyin", "Ak", "Eski marangoz, ahşap işleri meraklısı.");
        
        User off1 = createOfficialUser("kadikoy_bld", "Kadıköy Belediyesi", "BELEDIYE");
        User off2 = createOfficialUser("uskudar_bld", "Üsküdar Belediyesi", "BELEDIYE");
        User off3 = createOfficialUser("saglik_bak", "Sağlık Bakanlığı", "BAKANLIK");

        // 3. TOPLULUKLAR
        Community c1 = createCommunity("Bahçecilik", "Bitki yetiştirme ve bahçe bakımı.", u1);
        Community c2 = createCommunity("Tarih ve Kültür", "Geçmişin izinde sohbetler.", u3);
        Community c3 = createCommunity("Mutfak Sanatları", "Geleneksel tarifler ve püf noktaları.", u2);
        Community c4 = createCommunity("Teknoloji Rehberi", "Büyükler için dijital dünya.", off1);
        Community c5 = createCommunity("Sağlıklı Yaşam", "Zinde kalmak için ipuçları.", off3);
        Community c6 = createCommunity("El Emeği", "Örgü, nakış ve ahşap işleri.", u5);
        Community c7 = createCommunity("Seyahat", "Gezilecek yerler ve anılar.", u4);

        // 4. POSTLAR (Hazir Etiketli)
        List<Post> posts = new ArrayList<>();
        posts.add(createPost("Domates fideleri ne zaman dikilmeli?", "Nisan sonu en ideal zamandır.", u1, c1, 20, "bahçecilik, tarım, bitki"));
        posts.add(createPost("Limon ağacım sararıyor", "Demir eksikliği olabilir, gübreye dikkat.", u1, c1, 15, "bahçecilik, limon, bitki bakımı"));
        posts.add(createPost("Gül budama teknikleri", "Yanlış budama gülü kurutur.", u1, c1, 12, "bahçecilik, çiçek, budama"));
        
        posts.add(createPost("İstanbul'un Gizli Hazineleri", "Süleymaniye'nin bilinmeyen hikayesi.", u3, c2, 45, "tarih, istanbul, kültür"));
        posts.add(createPost("Cumhuriyet İlanı Anıları", "Dedemden dinlediğim o gün...", u3, c2, 60, "tarih, cumhuriyet, anı"));
        posts.add(createPost("Eski İstanbul Vapurları", "Paşabahçe vapurunun zarafeti.", u4, c2, 35, "tarih, istanbul, deniz"));
        
        posts.add(createPost("Tam Kıvamında Tarhana", "Köy usulü fermente tarhana tarifi.", u2, c3, 80, "yemek, tarif, kışlık"));
        posts.add(createPost("Bayram Çöreği Püf Noktaları", "Mahlep miktarını kaçırmayın.", u2, c3, 55, "yemek, hamur işi, bayram"));
        posts.add(createPost("Zeytinyağlı Enginar", "Kararmaması için limonlu su şart.", u2, c3, 40, "yemek, sağlıklı beslenme, tarif"));
        
        posts.add(createPost("WhatsApp Görüntülü Arama", "Adım adım görüntülü arama rehberi.", off1, c4, 110, "teknoloji, iletişim, telefon"));
        posts.add(createPost("E-Devlet Şifresi Nasıl Alınır?", "PTT'ye gitmeden şifre alma yöntemi.", off1, c4, 95, "teknoloji, e-devlet, rehber"));
        posts.add(createPost("Akıllı Telefon Temizliği", "Gereksiz dosyaları nasıl sileriz?", off1, c4, 70, "teknoloji, telefon, temizlik"));
        
        posts.add(createPost("Günde 10 Bin Adım Şart Mı?", "Yaşınıza göre ideal yürüyüş mesafesi.", off3, c5, 150, "sağlık, egzersiz, yürüyüş"));
        posts.add(createPost("Dengeli Beslenme Listesi", "Protein ve kalsiyum dengesi.", off3, c5, 130, "sağlık, beslenme, diyet"));
        posts.add(createPost("Göz Sağlığı İçin Öneriler", "Ekran başında geçirdiğiniz süreye dikkat.", off3, c5, 90, "sağlık, göz, teknoloji"));
        posts.add(createPost("Evde Sabah Egzersizi", "5 dakikalık esneme hareketleri.", off3, c5, 200, "sağlık, egzersiz, evde spor"));

        posts.add(createPost("Ahşap Oyma Sanatı", "Çam ağacından kaşık yapımı.", u5, c6, 40, "hobi, ahşap, el sanatı"));
        posts.add(createPost("Tığ İşi Bebek Yeleği", "Kış hazırlıkları için harika bir model.", u2, c6, 50, "hobi, örgü, el sanatı"));
        
        posts.add(createPost("Ege Köyleri Gezi Rehberi", "Birgi ve Şirince turu.", u4, c7, 75, "seyahat, gezi, kültür"));
        posts.add(createPost("Doğu Ekspresi Deneyimi", "Kışın tren yolculuğu bir başka.", u4, c7, 85, "seyahat, tren, kış"));

        // 5. ETKİNLİKLER (Hazir Etiketli)
        createEvent("Dijital Okuryazarlık Atölyesi", "Temel bilgisayar kullanımı eğitimi.", LocalDateTime.now().plusDays(2), "Kadıköy Kültür Merkezi", off1, "teknoloji, eğitim, kurs");
        createEvent("Boğaz'da Sabah Yürüyüşü", "Belediye eşliğinde sabah sporu.", LocalDateTime.now().plusDays(4), "Üsküdar Sahil", off2, "sağlık, spor, yürüyüş");
        createEvent("Sağlıklı Yaş Alma Semineri", "Beslenme ve psikoloji üzerine söyleşi.", LocalDateTime.now().plusDays(7), "Zoom (Online)", off3, "sağlık, seminer, psikoloji");
        createEvent("Tarih Yolculuğu: Galata", "Rehber eşliğinde Galata turu.", LocalDateTime.now().plusDays(10), "Galata Kulesi Önü", off1, "tarih, gezi, istanbul");

        // 6. ETKİLEŞİMLER
        likePost(u1, posts.get(0));
        likePost(u1, posts.get(1));
        likePost(u1, posts.get(12));
        likePost(u1, posts.get(13));
        likePost(u1, posts.get(3));
        commentPost(u1, posts.get(0), "Toprak gerçekten en büyük huzur.");
        joinEvent(u1, eventRepository.findAll().get(1));

        // 7. MANUEL ILGI ALANLARI (AI YERINE SEEDER ICIN)
        u1.setInterests("bahçecilik, sağlık, yürüyüş, tarih, bitki");
        u2.setInterests("yemek, örgü, sağlıklı beslenme, el sanatı");
        u3.setInterests("tarih, istanbul, kültür, kitap");
        u4.setInterests("seyahat, gezi, istanbul, vapur");
        userRepository.save(u1);
        userRepository.save(u2);
        userRepository.save(u3);
        userRepository.save(u4);

        System.out.println("TEBRİKLER! ElderConnect saniyeler içinde hazir hale geldi.");
    }

    private User createUser(String username, String name, String surname, String desc) {
        User u = new User();
        u.setUsername(username);
        u.setEmail(username + "@example.com");
        u.setPasswordHash(passwordEncoder.encode("123456"));
        u.setName(name);
        u.setSurname(surname);
        u.setDescription(desc);
        u.getRoles().add(UserRole.ROLE_USER);
        u.setApproved(true);
        return userRepository.save(u);
    }

    private User createOfficialUser(String username, String name, String type) {
        User u = new User();
        u.setUsername(username);
        u.setEmail(username + "@gov.tr");
        u.setPasswordHash(passwordEncoder.encode("123456"));
        u.setName(name);
        u.getRoles().add(UserRole.ROLE_OFFICIAL);
        u.setApproved(true);
        userRepository.save(u);

        OfficialProfile op = new OfficialProfile();
        op.setUser(u);
        op.setOrganizationName(name);
        op.setOrganizationType(type);
        officialProfileRepository.save(op);
        return u;
    }

    private Community createCommunity(String name, String desc, User owner) {
        Community c = new Community();
        c.setName(name.toLowerCase().replace(" ", "-"));
        c.setDescription(desc);
        c.setOwner(owner);
        c.getMembers().add(owner);
        return communityRepository.save(c);
    }

    private Post createPost(String title, String content, User author, Community community, int score, String keywords) {
        Post p = new Post();
        p.setTitle(title);
        p.setContent(content);
        p.setAuthor(author);
        p.setCommunity(community);
        p.setScore(score);
        p.setKeywords(keywords);
        return postRepository.save(p);
    }

    private Event createEvent(String title, String desc, LocalDateTime date, String loc, User organizer, String keywords) {
        Event e = new Event();
        e.setTitle(title);
        e.setDescription(desc);
        e.setEventDate(date);
        e.setLocationName(loc);
        e.setOrganizer(organizer);
        e.setKeywords(keywords);
        return eventRepository.save(e);
    }

    private void likePost(User u, Post p) {
        PostVote vote = new PostVote();
        vote.setUser(u);
        vote.setPost(p);
        vote.setVoteType(VoteType.UPVOTE);
        postVoteRepository.save(vote);
    }

    private void commentPost(User u, Post p, String content) {
        Comment c = new Comment();
        c.setCommenter(u);
        c.setPost(p);
        c.setContent(content);
        commentRepository.save(c);
    }

    private void joinEvent(User u, Event e) {
        if (e.getParticipants() == null) e.setParticipants(new java.util.HashSet<>());
        e.getParticipants().add(u);
        eventRepository.save(e);
    }
}
