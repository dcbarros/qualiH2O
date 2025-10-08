package com.waterView.waterviewbackend.external.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AnaliseResponseDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String codigo;
    private String analista;
    private String local;
    private LocalDateTime horaDaAmostragem;
    private Boolean statusDaAmostra;
    private Boolean aceiteRelatorio;

    private String descricao;
    private Double ph;
    private Double turbidez;
    private Double condutancia;

}
