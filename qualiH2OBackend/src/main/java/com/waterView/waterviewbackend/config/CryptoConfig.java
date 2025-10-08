package com.waterView.waterviewbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.password.Pbkdf2PasswordEncoder;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CryptoConfig {
    @Bean
    PasswordEncoder passwordEncoder() {

        Map<String, PasswordEncoder> encoders = new HashMap<>();
        Pbkdf2PasswordEncoder pbkdf2 = new Pbkdf2PasswordEncoder(
                "", 8, 185000, Pbkdf2PasswordEncoder.SecretKeyFactoryAlgorithm.PBKDF2WithHmacSHA256);
        encoders.put("pbkdf2", pbkdf2);

        DelegatingPasswordEncoder delegating = new DelegatingPasswordEncoder("pbkdf2", encoders);
        delegating.setDefaultPasswordEncoderForMatches(pbkdf2);

        return new PasswordEncoder() {
            private static final String PREFIX = "{pbkdf2}";

            @Override
            public String encode(CharSequence rawPassword) {
                String encoded = delegating.encode(rawPassword);
                return encoded.startsWith(PREFIX) ? encoded.substring(PREFIX.length()) : encoded;
            }

            @Override
            public boolean matches(CharSequence rawPassword, String stored) {

                String candidate = (stored != null && stored.startsWith("{")) ? stored : PREFIX + stored;
                return delegating.matches(rawPassword, candidate);
            }
        };
    }
}

