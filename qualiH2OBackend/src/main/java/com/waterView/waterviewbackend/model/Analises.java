package com.waterView.waterviewbackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
public class Analises implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true)
    private String codigo;
    @NotBlank
    private String analista;
    @NotBlank
    private String local;

    @NotNull
    @Column(name = "hora_da_amostragem")
    private LocalDateTime horaDaAmostragem;

    @NotNull
    private Boolean statusDaAmostra; // True - Passou/ False - Reprovado
    @NotNull
    private Boolean aceiteRelatorio;

    private String descricao;

    @NotNull
    private Double ph;
    @NotNull
    private Double turbidez;
    @NotNull
    private Double condutancia;

}
