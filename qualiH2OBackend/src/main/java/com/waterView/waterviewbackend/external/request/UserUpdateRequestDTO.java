package com.waterView.waterviewbackend.external.request;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserUpdateRequestDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String email;
    private String senhaAntiga;
    private String senhaNova;
}
