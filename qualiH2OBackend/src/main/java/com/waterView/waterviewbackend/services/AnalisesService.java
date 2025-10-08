package com.waterView.waterviewbackend.services;

import com.waterView.waterviewbackend.exceptions.RecursoNaoEncontrado;
import com.waterView.waterviewbackend.exceptions.RequisicaoMalFormada;
import com.waterView.waterviewbackend.external.request.AnaliseCreateRequestDTO;
import com.waterView.waterviewbackend.external.request.AnaliseUpdateRequestDTO;
import com.waterView.waterviewbackend.external.response.*;
import com.waterView.waterviewbackend.mapper.DozerMapper;
import com.waterView.waterviewbackend.model.Analises;
import com.waterView.waterviewbackend.repository.AnalisesRepository;
import com.waterView.waterviewbackend.repository.AnalisesSeriesRepository;
import com.waterView.waterviewbackend.utils.GeradorCodigoAmostra;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalisesService {

    private final AnalisesRepository analisesRepository;
    private final AnalisesSeriesRepository seriesRepository;

    // ===== CRUD =====

    @Transactional
    public AnaliseResponseDTO adicionarAnalise(AnaliseCreateRequestDTO request) {
        if (request == null) throw new RequisicaoMalFormada("Dados da análise faltando ou não existentes.");
//        if (request.getCodigo() == null || request.getCodigo().isBlank())
//            throw new RequisicaoMalFormada("Código precisa ser fornecido");

        Double ph = request.getPh();
        Double turb = request.getTurbidez();
        Double cond = request.getCondutancia();

        if (ph == null || ph < 0 || ph > 14) throw new RequisicaoMalFormada("Valores de ph devem estar entre 0 e 14");
        if (turb == null || turb < 0) throw new RequisicaoMalFormada("Valores de turbidez devem ser positivos");
        if (cond == null || cond < 0) throw new RequisicaoMalFormada("Valores de condutância devem ser positivos");

        var analise = DozerMapper.parseObject(request, Analises.class);
        analise.setId(null);
        analise.setCodigo(GeradorCodigoAmostra.gerarUnico(
                analise.getHoraDaAmostragem(),
                analisesRepository::existsByCodigo
        ));
        analise.setAceiteRelatorio(false);
        analise.setStatusDaAmostra(isAprovada(ph, turb, cond));

        return DozerMapper.parseObject(analisesRepository.save(analise), AnaliseResponseDTO.class);
    }

    @Transactional
    public AnaliseResponseDTO editaAnalisePeloCodigo(String codigo, AnaliseUpdateRequestDTO request){
        if (codigo == null || codigo.isBlank()) throw new RequisicaoMalFormada("CÓdigo não fornecido da forma correta.");
        if (request == null) throw new RequisicaoMalFormada("Dados da análise faltando ou não existentes.");

        Double ph = request.getPh();
        Double turb = request.getTurbidez();
        Double cond = request.getCondutancia();

        if (ph == null || ph < 0 || ph > 14) throw new RequisicaoMalFormada("Valores de ph devem estar entre 0 e 14");
        if (turb == null || turb < 0) throw new RequisicaoMalFormada("Valores de turbidez devem ser positivos");
        if (cond == null || cond < 0) throw new RequisicaoMalFormada("Valores de condutância devem ser positivos");

        var analise = analisesRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RecursoNaoEncontrado("Analise não foi localizada"));

        analise.setAnalista(request.getAnalista());
        analise.setLocal(request.getLocal());
        analise.setHoraDaAmostragem(request.getHoraDaAmostragem());
        analise.setDescricao(request.getDescricao());
        analise.setPh(ph);
        analise.setTurbidez(turb);
        analise.setCondutancia(cond);
        analise.setStatusDaAmostra(isAprovada(ph, turb, cond));

        return DozerMapper.parseObject(analisesRepository.save(analise), AnaliseResponseDTO.class);
    }

    @Transactional
    public AnaliseResponseDTO aceiteRelatorio (String codigo) {
        if (codigo == null || codigo.isBlank()) throw new RequisicaoMalFormada("Código precisa ser fornecido");
        var analise = analisesRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RecursoNaoEncontrado("Análise não foi localizada!"));

        analise.setAceiteRelatorio(true);
        return DozerMapper.parseObject(analisesRepository.save(analise), AnaliseResponseDTO.class);
    }

    @Transactional(readOnly = true)
    public AnaliseResponseDTO obtemAnalisePeloId(Long id) {
        if (id == null || id <= 0) throw new RequisicaoMalFormada("Id não fornecido da forma correta.");
        var analise = analisesRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontrado("Analise não foi localizada"));
        return DozerMapper.parseObject(analise, AnaliseResponseDTO.class);
    }

    @Transactional(readOnly = true)
    public Page<AnaliseResponseDTO> obtemAnalises(Pageable pageable){
        return analisesRepository.findAll(pageable)
                .map(a -> DozerMapper.parseObject(a, AnaliseResponseDTO.class));
    }

    @Transactional(readOnly = true)
    public AnaliseResponseDTO obtemAnalisePeloCodigo(String codigo) {
        if (codigo == null || codigo.isBlank()) throw new RequisicaoMalFormada("Código precisa ser fornecido");
        var analise = analisesRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RecursoNaoEncontrado("Análise não foi localizada!"));
        return DozerMapper.parseObject(analise, AnaliseResponseDTO.class);
    }

    @Transactional
    public void apagaAnalisePeloCodigo(String codigo) {
        if (codigo == null || codigo.isBlank()) throw new RequisicaoMalFormada("Codigo não fornecido da forma correta.");
        var analise = analisesRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RecursoNaoEncontrado("Analise não foi localizada"));
        analisesRepository.delete(analise);
    }

    private boolean isAprovada(Double ph, Double turb, Double cond) {
        return ph >= 6.0 && ph <= 9.0 && turb <= 5.0 && cond <= 500.0;
    }

    @Transactional(readOnly = true)
    public Page<AnaliseResponseDTO> obtemAnalisesFiltrado(
            Pageable pageable,
            String codigo,
            String analista,
            String local,
            Boolean status,
            Boolean aceite) {

        final long t0 = System.nanoTime();

        if (log.isDebugEnabled()) {
            log.debug("[AnalisesService] Listar - req: page={}, size={}, sort={}, filtros(codigo='{}', analista='{}', local='{}', status={}, aceite={})",
                    pageable.getPageNumber(), pageable.getPageSize(), pageable.getSort(),
                    codigo, analista, local, status, aceite);
        }

        final String cod = (codigo == null || codigo.isBlank()) ? null : codigo.trim();
        final String ana = (analista == null || analista.isBlank()) ? null : analista.trim();
        final String loc = (local == null || local.isBlank()) ? null : local.trim();

        if (log.isTraceEnabled()) {
            log.trace("[AnalisesService] filtros normalizados: codigo='{}', analista='{}', local='{}'", cod, ana, loc);
        }

        try {
            Specification<Analises> spec = (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();

            if (cod != null) {
                final String codLike = cod.toLowerCase() + "%";
                spec = spec.and((root, query, cb) ->
                        cb.like(cb.lower(root.get("codigo")), codLike));
            }
            if (ana != null) {
                final String anaLike = "%" + ana.toLowerCase() + "%";
                spec = spec.and((root, query, cb) ->
                        cb.like(cb.lower(root.get("analista")), anaLike));
            }
            if (loc != null) {
                final String locLike = "%" + loc.toLowerCase() + "%";
                spec = spec.and((root, query, cb) ->
                        cb.like(cb.lower(root.get("local")), locLike));
            }
            if (status != null) {
                spec = spec.and((root, query, cb) ->
                        cb.equal(root.get("statusDaAmostra"), status));
            }
            if (aceite != null) {
                spec = spec.and((root, query, cb) ->
                        cb.equal(root.get("aceiteRelatorio"), aceite));
            }

            Page<Analises> page = analisesRepository.findAll(spec, pageable);

            if (log.isDebugEnabled()) {
                log.debug("[AnalisesService] Repo OK: totalElements={}, totalPages={}, numberOfElements={}",
                        page.getTotalElements(), page.getTotalPages(), page.getNumberOfElements());
            }

            Page<AnaliseResponseDTO> out = page.map(a -> DozerMapper.parseObject(a, AnaliseResponseDTO.class));

            final long dtMs = (System.nanoTime() - t0) / 1_000_000;
            log.info("[AnalisesService] Listar concluído em {} ms (page={}, size={}, sort={})",
                    dtMs, pageable.getPageNumber(), pageable.getPageSize(), pageable.getSort());

            return out;

        } catch (org.springframework.dao.DataAccessException ex) {
            String detail = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
            log.error("[AnalisesService] Erro de acesso a dados: {}", detail, ex);
            throw ex; // Re-throw para o Spring tratar
        } catch (Exception ex) {
            log.error("[AnalisesService] Erro inesperado ao listar análises", ex);
            throw ex; // Re-throw para o Spring tratar
        }
    }


    // ===== NOVO: opções distintas para filtros (analistas, locais) =====
    @Transactional(readOnly = true)
    public OpcoesFiltrosResponseDTO opcoesFiltros() {
        return new OpcoesFiltrosResponseDTO(
                analisesRepository.analistas(),
                analisesRepository.locais()
        );
    }

    // ===== Dashboard - Cards =====
    @Transactional(readOnly = true)
    public MetricasResponseDTO cardsDashboardDados() {
        return MetricasResponseDTO.builder()
                .abertas(analisesRepository.totalAnalisesAbertas())
                .total(analisesRepository.totalAnalisesCadastradas())
                .mediaPh(analisesRepository.mediaPh())          // BigDecimal
                .mediaCondutancia(analisesRepository.mediaCond())
                .mediaTurbidez(analisesRepository.mediaTurb())
                .build();
    }

    // ===== Dashboard - Status (aprovados x reprovados) =====
    @Transactional(readOnly = true)
    public StatusSplitResponseDTO statusGrafico() {
        return new StatusSplitResponseDTO(
                analisesRepository.analisesAprovados(),
                analisesRepository.analisesReprovados()
        );
    }

    // ===== Dashboard - Séries diárias últimos N dias =====
    @Transactional(readOnly = true)
    public List<SerieVarDTO> retornaMetricasAnalisadas(int days, String metric) {
        if (days <= 0) days = 30;
        if (days > 180) days = 180;
        List<Object[]> rows = switch (metric == null ? "" : metric.toUpperCase(Locale.ROOT)) {
            case "PH"          -> seriesRepository.seriePhUltimosDias(days);
            case "CONDUTANCIA" -> seriesRepository.serieCondUltimosDias(days);
            case "TURBIDEZ"    -> seriesRepository.serieTurbUltimosDias(days);
            default -> throw new RequisicaoMalFormada("Métrica inválida. Use: PH | CONDUTANCIA | TURBIDEZ");
        };
        return rows.stream()
                .map(r -> new SerieVarDTO((String) r[0], r[1] == null ? null : ((Number) r[1]).doubleValue()))
                .toList();
    }

    private static final float MARGIN = 50f;
    private static final float LINE = 16f;
    private static final float KEY_W = 180f;
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
            .withZone(ZoneId.systemDefault());

    @Transactional(readOnly = true)
    public byte[] gerarPdf(String codigo) {
        if (codigo == null || codigo.isBlank()) throw new RequisicaoMalFormada("Codigo não fornecido da forma correta.");
        var a = analisesRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RecursoNaoEncontrado("Analise não foi localizada"));

        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                float y = page.getMediaBox().getHeight() - MARGIN;

                // título
                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_BOLD, 18);
                cs.newLineAtOffset(MARGIN, y);
                cs.showText("Relatório de Análise – QualiH2O");
                cs.endText();
                y -= LINE * 2;

                y = line(cs, page, y, "Código", a.getCodigo());
                y = line(cs, page, y, "Analista", a.getAnalista());
                y = line(cs, page, y, "Local", a.getLocal());
                y = line(cs, page, y, "Data/Hora", FMT.format(a.getHoraDaAmostragem()));
                y -= LINE;

                y = line(cs, page, y, "pH", fmt(a.getPh()));
                y = line(cs, page, y, "Turbidez (NTU)", fmt(a.getTurbidez()));
                y = line(cs, page, y, "Condutância (µS/cm)", fmt(a.getCondutancia()));
                y = line(cs, page, y, "Status da amostra",
                        Boolean.TRUE.equals(a.getStatusDaAmostra()) ? "APROVADA" : "REPROVADA");

                if (a.getDescricao() != null && !a.getDescricao().isBlank()) {
                    y -= LINE;
                    text(cs, page, y, "Observações:", true);
                    y -= LINE;
                    y = paragraph(cs, page, y, a.getDescricao());
                }
            }

            doc.save(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Falha ao gerar PDF", e);
        }
    }

    private static String fmt(Double d) { return d == null ? "-" : String.format(Locale.US, "%.2f", d); }

    private float line(PDPageContentStream cs, PDPage page, float y, String key, String value) throws IOException {
        float right = page.getMediaBox().getWidth() - MARGIN;

        // key
        cs.beginText();
        cs.setFont(PDType1Font.HELVETICA_BOLD, 12);
        cs.newLineAtOffset(MARGIN, y);
        cs.showText((key == null ? "-" : key) + ":");
        cs.endText();

        // value (wrap simples)
        float xVal = MARGIN + KEY_W;
        float maxW = right - xVal;
        return wrapped(cs, xVal, y, value == null ? "-" : value, maxW, 12f) - 4f;
    }

    private void text(PDPageContentStream cs, PDPage page, float y, String s, boolean bold) throws IOException {
        cs.beginText();
        cs.setFont(bold ? PDType1Font.HELVETICA_BOLD : PDType1Font.HELVETICA, 12);
        cs.newLineAtOffset(MARGIN, y);
        cs.showText(s);
        cs.endText();
    }

    private float paragraph(PDPageContentStream cs, PDPage page, float y, String text) throws IOException {
        float right = page.getMediaBox().getWidth() - MARGIN;
        float maxW = right - MARGIN;
        return wrapped(cs, MARGIN, y, text, maxW, 12f);
    }

    private float wrapped(PDPageContentStream cs, float x, float y, String text, float maxW, float fontSize) throws IOException {
        String[] words = text.split("\\s+");
        StringBuilder line = new StringBuilder();
        float cursorY = y;
        for (String w : words) {
            String test = line.length() == 0 ? w : line + " " + w;
            float wWidth = PDType1Font.HELVETICA.getStringWidth(test) / 1000 * fontSize;
            if (wWidth > maxW) {
                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, fontSize);
                cs.newLineAtOffset(x, cursorY);
                cs.showText(line.toString());
                cs.endText();
                cursorY -= LINE;
                line = new StringBuilder(w);
            } else {
                line = new StringBuilder(test);
            }
        }
        if (!line.isEmpty()) {
            cs.beginText();
            cs.setFont(PDType1Font.HELVETICA, fontSize);
            cs.newLineAtOffset(x, cursorY);
            cs.showText(line.toString());
            cs.endText();
            cursorY -= LINE;
        }
        return cursorY;
    }
}
