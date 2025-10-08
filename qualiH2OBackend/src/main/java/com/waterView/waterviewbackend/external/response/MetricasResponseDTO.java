package com.waterView.waterviewbackend.external.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MetricasResponseDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private long abertas;
    private long total;
    private BigDecimal mediaPh;
    private BigDecimal mediaCondutancia;
    private BigDecimal mediaTurbidez;
}
