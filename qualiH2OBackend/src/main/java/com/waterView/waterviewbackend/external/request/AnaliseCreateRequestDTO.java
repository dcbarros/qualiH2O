package com.waterView.waterviewbackend.external.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AnaliseCreateRequestDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String analista;
    private String local;
    private LocalDateTime horaDaAmostragem;

    private String descricao;
    private Double ph;
    private Double turbidez;
    private Double condutancia;
}
