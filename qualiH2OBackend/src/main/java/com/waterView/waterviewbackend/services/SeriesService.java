package com.waterView.waterviewbackend.services;


import com.waterView.waterviewbackend.external.response.SerieVarDTO;
import com.waterView.waterviewbackend.repository.AnalisesSeriesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SeriesService {

    public enum Metric { PH, CONDUTANCIA, TURBIDEZ }

    private final AnalisesSeriesRepository repo;

    public List<SerieVarDTO> ultimosDias(int days, Metric metric) {
        if (days <= 0) days = 30;
        if (days > 180) days = 180;

        List<Object[]> rows = switch (metric) {
            case PH          -> repo.seriePhUltimosDias(days);
            case CONDUTANCIA -> repo.serieCondUltimosDias(days);
            case TURBIDEZ    -> repo.serieTurbUltimosDias(days);
        };

        return rows.stream()
                .map(r -> new SerieVarDTO((String) r[0], r[1] == null ? null : ((Number) r[1]).doubleValue()))
                .toList();
    }
}
