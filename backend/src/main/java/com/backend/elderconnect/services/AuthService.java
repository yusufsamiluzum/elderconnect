package com.backend.elderconnect.services;

import com.backend.elderconnect.dto.*;
import com.backend.elderconnect.entities.OfficialProfile;
import com.backend.elderconnect.entities.User;
import com.backend.elderconnect.entities.UserRole;
import com.backend.elderconnect.repositories.OfficialProfileRepository;
import com.backend.elderconnect.repositories.UserRepository;
import com.backend.elderconnect.security.jwt.JwtUtils;
import com.backend.elderconnect.security.services.RefreshTokenService;
import com.backend.elderconnect.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    OfficialProfileRepository officialProfileRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    RefreshTokenService refreshTokenService;

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        if (user.getRoles().contains(UserRole.ROLE_OFFICIAL) && !user.isApproved()) {
            throw new RuntimeException("Error: Hesabınız henüz admin tarafından onaylanmamıştır.");
        }

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        String refreshToken = refreshTokenService.createRefreshToken(userDetails.getId()).getToken();

        return new JwtResponse(jwt, refreshToken, userDetails.getId(),
                userDetails.getUsername(), userDetails.getEmail(), roles);
    }

    @Transactional
    public RegisterResponse registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPasswordHash(encoder.encode(signUpRequest.getPassword()));
        if (signUpRequest.getName() != null) user.setName(signUpRequest.getName());
        if (signUpRequest.getSurname() != null) user.setSurname(signUpRequest.getSurname());
        if (signUpRequest.getCity() != null) user.setCity(signUpRequest.getCity());

        if ("official".equalsIgnoreCase(signUpRequest.getAccountType())) {
            if (signUpRequest.getOrganizationName() == null || signUpRequest.getOrganizationName().isBlank()) {
                throw new RuntimeException("Error: Kurum adı zorunludur.");
            }
            user.getRoles().add(UserRole.ROLE_OFFICIAL);
            user.setApproved(false);
            userRepository.save(user);

            OfficialProfile profile = new OfficialProfile();
            profile.setUser(user);
            profile.setOrganizationName(signUpRequest.getOrganizationName());
            profile.setOrganizationType(signUpRequest.getOrganizationType());
            profile.setOrganizationDescription(signUpRequest.getOrganizationDescription());
            officialProfileRepository.save(profile);

            return new RegisterResponse("PENDING_APPROVAL",
                    "Başvurunuz alındı. Admin onayından sonra giriş yapabileceksiniz.");
        } else {
            user.getRoles().add(UserRole.ROLE_USER);
            user.setApproved(true);
            userRepository.save(user);

            return new RegisterResponse("ACTIVE", "Hesabınız başarıyla oluşturuldu.");
        }
    }
}
