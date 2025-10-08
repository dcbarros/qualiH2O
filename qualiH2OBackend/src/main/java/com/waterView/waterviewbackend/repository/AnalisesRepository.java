package com.waterView.waterviewbackend.repository;

import com.waterView.waterviewbackend.model.Analises;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnalisesRepository extends JpaRepository<Analises, Long>, JpaSpecificationExecutor<Analises> {

    Optional<Analises> findByCodigo(String codigo);
    boolean existsByCodigo(String codigo);
    Page<Analises> findAll(Pageable pageable);

    // ===== Counts (JPQL)
    @Query("select count(a) from Analises a")
    long totalAnalisesCadastradas();

    @Query("select count(a) from Analises a where a.aceiteRelatorio = false")
    long totalAnalisesAbertas();

    @Query("select count(a) from Analises a where a.statusDaAmostra = true")
    long analisesAprovados();

    @Query("select count(a) from Analises a where a.statusDaAmostra = false")
    long analisesReprovados();

    // ===== Médias (nativo)
    @Query(value = "select coalesce(avg(ph),0) from analises", nativeQuery = true)
    BigDecimal mediaPh();

    @Query(value = "select coalesce(avg(condutancia),0) from analises", nativeQuery = true)
    BigDecimal mediaCond();

    @Query(value = "select coalesce(avg(turbidez),0) from analises", nativeQuery = true)
    BigDecimal mediaTurb();

    // ===== Filtros (JPQL dinâmico via parâmetros opcionais)
    @Query("""
      select a from Analises a
       where (:codigo   is null or lower(a.codigo)   like lower(concat(coalesce(:codigo, ''), '%')))
         and (:analista is null or lower(a.analista) like lower(concat('%', coalesce(:analista, ''), '%')))
         and (:local    is null or lower(a.local)    like lower(concat('%', coalesce(:local, ''), '%')))
         and (:aprovada is null or a.statusDaAmostra = :aprovada)
         and (:aceite   is null or a.aceiteRelatorio = :aceite)
    """)
    Page<Analises> buscarPaginado(@Param("codigo") String codigo,
                                  @Param("analista") String analista,
                                  @Param("local") String local,
                                  @Param("aprovada") Boolean status,
                                  @Param("aceite") Boolean aceite,
                                  Pageable pageable);

    // ===== Opções de filtros
    @Query("select distinct a.analista from Analises a where a.analista is not null order by a.analista asc")
    List<String> analistas();

    @Query("select distinct a.local from Analises a where a.local is not null order by a.local asc")
    List<String> locais();
}
