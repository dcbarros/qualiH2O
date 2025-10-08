package com.waterView.waterviewbackend.external.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OpcoesFiltrosResponseDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private List<String> analistas;
    private List<String> locais;
}
