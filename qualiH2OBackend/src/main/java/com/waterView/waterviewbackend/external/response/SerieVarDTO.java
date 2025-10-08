package com.waterView.waterviewbackend.external.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;

@Data
@AllArgsConstructor
public class SerieVarDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String dia;
    private Double valor;
}
