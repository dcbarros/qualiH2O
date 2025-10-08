package com.waterView.waterviewbackend.security.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.waterView.waterviewbackend.exceptions.InvalidJwtAuthenticationException;
import com.waterView.waterviewbackend.external.response.TokenResponseDTO;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Component
public class JwtTokenProvider {

    @Value("${security.jwt.token.secret-key:secret}")
    private String secretKey;

    @Value("${security.jwt.token.expire-length:14400}") // 4h em segundos
    private long validityInSeconds;

    private Algorithm algorithm;
    private JWTVerifier verifier;

    @PostConstruct
    protected void init() {
        this.algorithm = Algorithm.HMAC256(secretKey.getBytes());
        this.verifier  = JWT.require(algorithm).build();
    }

    public TokenResponseDTO createAccessToken(String username, List<String> roles) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime validity = now.plusSeconds(validityInSeconds);
        String accessToken = buildToken(username, roles, now, validity);
        return new TokenResponseDTO(username, true, now, validity, accessToken);
    }

    public TokenResponseDTO refreshToken(String refreshToken) {
        if (refreshToken.startsWith("Bearer ")) {
            refreshToken = refreshToken.substring("Bearer ".length());
        }
        DecodedJWT decoded = verifier.verify(refreshToken);
        String username = decoded.getSubject();
        List<String> roles = decoded.getClaim("roles").asList(String.class);
        return createAccessToken(username, roles);
    }

    public boolean validateToken(String token) {
        try {
            DecodedJWT decoded = verifier.verify(token);
            return decoded.getExpiresAt().after(new Date());
        } catch (Exception e) {
            throw new InvalidJwtAuthenticationException("Token expirado ou inválido!");
        }
    }

    public String getUsername(String token) {
        return verifier.verify(token).getSubject();
    }

    private String buildToken(String username, List<String> roles, LocalDateTime now, LocalDateTime exp) {
        String issuerUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        return JWT.create()
                .withSubject(username)
                .withClaim("roles", roles)
                .withIssuedAt(toDate(now))
                .withExpiresAt(toDate(exp))
                .withIssuer(issuerUrl)
                .sign(algorithm)
                .strip();
    }

    public Date toDate(LocalDateTime ldt) {
        return Date.from(ldt.atZone(ZoneId.systemDefault()).toInstant());
    }
}
