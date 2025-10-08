package com.waterView.waterviewbackend.controller;

import com.waterView.waterviewbackend.external.request.AnaliseCreateRequestDTO;
import com.waterView.waterviewbackend.external.request.AnaliseUpdateRequestDTO;
import com.waterView.waterviewbackend.external.response.AnaliseResponseDTO;
import com.waterView.waterviewbackend.external.response.OpcoesFiltrosResponseDTO;
import com.waterView.waterviewbackend.services.AnalisesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Analysis endpoints")
@RestController
@RequestMapping("api/v1/analises")
@RequiredArgsConstructor
public class AnaliseController {

    private final AnalisesService analisesService;

    // ===== CREATE =====
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Adiciona uma análise",
            responses = {
                    @ApiResponse(description = "Create", responseCode = "201",
                            content = @Content(schema = @Schema(implementation = AnaliseResponseDTO.class))),
                    @ApiResponse(description = "Bad Request", responseCode = "400", content = @Content),
                    @ApiResponse(description = "Not Found", responseCode = "404", content = @Content)
            }
    )
    public ResponseEntity<AnaliseResponseDTO> adicionaAnalise(@RequestBody AnaliseCreateRequestDTO requestDTO) {
        var body = analisesService.adicionarAnalise(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    // ===== UPDATE (por código) =====
    @PutMapping(value = "/{codigo}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Edita uma análise pelo código")
    public ResponseEntity<AnaliseResponseDTO> editaAnalise(@PathVariable String codigo, @RequestBody AnaliseUpdateRequestDTO request) {
        var body = analisesService.editaAnalisePeloCodigo(codigo, request);
        return ResponseEntity.ok(body);
    }

    // ===== READ (por código) =====
    @GetMapping(value = "/{codigo}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Obtém uma análise pelo código")
    public ResponseEntity<AnaliseResponseDTO> retornaAnalisePeloCodigo(@PathVariable String codigo){
        var body = analisesService.obtemAnalisePeloCodigo(codigo);
        return ResponseEntity.ok(body);
    }

    // ===== LIST (com filtros opcionais) =====
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Lista análises com filtros e paginação")
    public ResponseEntity<Page<AnaliseResponseDTO>> listar(
            @PageableDefault(size = 10, sort = "horaDaAmostragem", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(required = false) String codigo,
            @RequestParam(required = false) String analista,
            @RequestParam(required = false) String local,
            @RequestParam(required = false) Boolean status, // statusDaAmostra (aprovada ou não)
            @RequestParam(required = false) Boolean aceite  // aceiteRelatorio
    ) {
        Pageable safePageable = sanitizeSort(pageable,
                List.of("horaDaAmostragem", "codigo", "analista", "local"));

        Page<AnaliseResponseDTO> page = analisesService.obtemAnalisesFiltrado(
                safePageable, codigo, analista, local, status, aceite
        );
        return ResponseEntity.ok(page);
    }

    // ===== DELETE (por código) =====
    @DeleteMapping(value = "/{codigo}")
    @Operation(summary = "Apaga uma análise pelo código")
    public ResponseEntity<Void> apagaAnalisePeloCodigo(@PathVariable String codigo){
        analisesService.apagaAnalisePeloCodigo(codigo);
        return ResponseEntity.noContent().build();
    }

    // ===== PATCH aceite (por código) =====
    @PatchMapping(value = "/{codigo}/aceite", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Confirma o aceite de uma análise")
    public ResponseEntity<AnaliseResponseDTO> confirmaAceiteAnalise(@PathVariable String codigo) {
        var body = analisesService.aceiteRelatorio(codigo);
        return ResponseEntity.ok(body);
    }

    // ===== Opções para filtros =====
    @GetMapping(value = "/opcoes", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Opções distintas para filtros (analistas, locais)")
    public ResponseEntity<OpcoesFiltrosResponseDTO> opcoesFiltros() {
        var body = analisesService.opcoesFiltros();
        return ResponseEntity.ok(body);
    }

    // ===== PDF (por código) =====
    @GetMapping(value = "/{codigo}/relatorio.pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @Operation(summary = "Gera relatório PDF da análise (somente aprovadas)")
    public ResponseEntity<byte[]> relatorioPdf(@PathVariable String codigo) {
        byte[] pdf = analisesService.gerarPdf(codigo);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=analise_" + codigo + ".pdf")
                .body(pdf);
    }

    private Pageable sanitizeSort(Pageable pageable, List<String> allowed) {
        if (pageable == null || pageable.getSort().isUnsorted()) return pageable;
        Sort sanitized = Sort.by(
                pageable.getSort().stream()
                        .filter(order -> allowed.contains(order.getProperty()))
                        .map(order -> new Sort.Order(order.getDirection(), order.getProperty()))
                        .toList()
        );
        if (sanitized.isUnsorted()) {
            sanitized = Sort.by(Sort.Direction.DESC, "horaDaAmostragem");
        }
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sanitized);
    }
}
