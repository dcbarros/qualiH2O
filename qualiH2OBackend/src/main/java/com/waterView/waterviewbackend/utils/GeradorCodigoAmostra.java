package com.waterView.waterviewbackend.utils;

import java.io.Serializable;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Objects;
import java.util.function.Predicate;

public final class GeradorCodigoAmostra implements Serializable {

    private static final String PREFIX = "AM";
    private static final String ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RNG = new SecureRandom();
    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final int DEFAULT_LEN = 6;

    private GeradorCodigoAmostra() {}

    public static String gerar(LocalDateTime dataAmostragem) {
        LocalDateTime dt = Objects.requireNonNullElseGet(dataAmostragem, LocalDateTime::now);
        String ymd = DAY.format(dt.atZone(ZoneId.systemDefault()));
        return PREFIX + "-" + ymd + "-" + randomSuffix(DEFAULT_LEN);
    }
    public static String gerarUnico(LocalDateTime dataAmostragem, Predicate<String> exists) {
        for (int attempt = 0; attempt < 20; attempt++) {
            String codigo = gerar(dataAmostragem);
            if (exists == null || !exists.test(codigo)) {
                return codigo;
            }
        }
        throw new IllegalStateException("Falha ao gerar código único após múltiplas tentativas.");
    }
    private static String randomSuffix(int len) {
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            int idx = RNG.nextInt(ALPHANUM.length());
            sb.append(ALPHANUM.charAt(idx));
        }
        return sb.toString();
    }
}
