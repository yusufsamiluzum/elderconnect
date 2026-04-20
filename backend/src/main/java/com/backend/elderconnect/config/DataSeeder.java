package com.backend.elderconnect.config;

import com.backend.elderconnect.entities.*;
import com.backend.elderconnect.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.transaction.Transactional;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final PostRepository postRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, CommunityRepository communityRepository, 
                      PostRepository postRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.communityRepository = communityRepository;
        this.postRepository = postRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("Veritabanı boş, sahte veriler (dummy data) ekleniyor...");

            // 1. Kullanıcıları Oluştur
            User user1 = new User();
            user1.setUsername("ahmet_amca");
            user1.setEmail("ahmet@example.com");
            user1.setPasswordHash(passwordEncoder.encode("123456"));
            user1.setName("Ahmet");
            user1.setSurname("Yılmaz");
            user1.setDescription("Emekli öğretmen, bahçe işlerini ve doğada yürüyüş yapmayı seviyor.");
            user1.getRoles().add(UserRole.ROLE_USER);
            user1.setApproved(true);
            userRepository.save(user1);

            User user2 = new User();
            user2.setUsername("ayse_teyze");
            user2.setEmail("ayse@example.com");
            user2.setPasswordHash(passwordEncoder.encode("123456"));
            user2.setName("Ayşe");
            user2.setSurname("Kaya");
            user2.setDescription("Örgü örmeyi çok severim, yemek tarifleri paylaşabilirim.");
            user2.getRoles().add(UserRole.ROLE_USER);
            user2.setApproved(true);
            userRepository.save(user2);

            User officialUser = new User();
            officialUser.setUsername("kadikoy_bld");
            officialUser.setEmail("info@kadikoy.bel.tr");
            officialUser.setPasswordHash(passwordEncoder.encode("123456"));
            officialUser.setName("Kadıköy Belediyesi");
            officialUser.getRoles().add(UserRole.ROLE_OFFICIAL);
            officialUser.setApproved(true);
            userRepository.save(officialUser);

            // 2. Toplulukları Oluştur
            Community c1 = new Community();
            c1.setName("bahcecilik");
            c1.setDescription("Toprakla uğraşmayı sevenler kulübü. Saksı çiçeklerinden tarlaya kadar her şey.");
            c1.setType(CommunityType.PUBLIC);
            communityRepository.save(c1);

            Community c2 = new Community();
            c2.setName("saglikli-yasam");
            c2.setDescription("Sabah yürüyüşleri, egzersizler ve sağlıklı beslenme tüyoları.");
            c2.setType(CommunityType.PUBLIC);
            c2.setOfficial(true);
            communityRepository.save(c2);

            // 3. Postları (Gönderileri) Oluştur
            Post post1 = new Post();
            post1.setTitle("İlk biberlerim filizlendi!");
            post1.setContent("Balkondaki saksılarda yetiştirdiğim biberlerin ilk filizlerini gördüm, çok mutluyum.");
            post1.setAuthor(user1);
            post1.setCommunity(c1);
            post1.setScore(5);
            postRepository.save(post1);

            Post post2 = new Post();
            post2.setTitle("Moda Sahili Sabah Yürüyüşü");
            post2.setContent("Tüm komşularımızı salı sabahı saat 07:00'da Moda sahilinde yapacağımız temiz hava yürüyüşüne bekliyoruz!");
            post2.setAuthor(officialUser);
            post2.setCommunity(c2);
            post2.setScore(25);
            postRepository.save(post2);

            Post post3 = new Post();
            post3.setTitle("Torunum için hırka modeli arıyorum");
            post3.setContent("Kış geliyor malum, torunuma sıcak tutacak bir hırka modeli arıyorum, örnekleri olan atabilir mi?");
            post3.setAuthor(user2);
            // Kendi profiline atıyor (herhangi bir community'e değil)
            post3.setScore(12);
            postRepository.save(post3);

            System.out.println("Sahte (dummy) veriler başarıyla eklendi! Artık mobil taraftaki statik dataları silip API'yi kullanabilirsiniz.");
        }
    }
}
