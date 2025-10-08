package com.waterView.waterviewbackend.external.request;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AnaliseUpdateRequestDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String analista;
    private String local;
    private LocalDateTime horaDaAmostragem;
    private Boolean aceiteRelatorio;

    private String descricao;
    private Double ph;
    private Double turbidez;
    private Double condutancia;
}
