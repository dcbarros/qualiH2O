package com.waterView.waterviewbackend.external.response;
import java.io.Serializable;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class TokenResponseDTO implements Serializable{

    private static final long serialVersionUID = 1L;

    private String username;
    private Boolean authenticated;
    private LocalDateTime created;
    private LocalDateTime expiration;
    private String accessToken;

}
