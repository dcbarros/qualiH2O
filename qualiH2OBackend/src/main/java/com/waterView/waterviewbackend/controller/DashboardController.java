package com.waterView.waterviewbackend.controller;

import com.waterView.waterviewbackend.external.response.MetricasResponseDTO;
import com.waterView.waterviewbackend.external.response.SerieVarDTO;
import com.waterView.waterviewbackend.external.response.StatusSplitResponseDTO;
import com.waterView.waterviewbackend.services.AnalisesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Dashboard endpoints")
@RestController
@RequestMapping("api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final AnalisesService service;

    @GetMapping("/cards")
    @Operation(summary = "Cards: abertas, total, médias (pH/condutância/turbidez)")
    public ResponseEntity<MetricasResponseDTO> cards() {
        return ResponseEntity.ok(service.cardsDashboardDados());
    }

    @GetMapping("/status")
    @Operation(summary = "Aprovados x Reprovados")
    public ResponseEntity<StatusSplitResponseDTO> status() {
        return ResponseEntity.ok(service.statusGrafico());
    }

    @GetMapping("/series")
    @Operation(summary = "Séries diárias (média) dos últimos N dias")
    public ResponseEntity<List<SerieVarDTO>> series(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam String metric // PH | CONDUTANCIA | TURBIDEZ
    ) {
        return ResponseEntity.ok(service.retornaMetricasAnalisadas(days, metric));
    }
}
