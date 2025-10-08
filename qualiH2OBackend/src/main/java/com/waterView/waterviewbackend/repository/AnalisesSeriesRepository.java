package com.waterView.waterviewbackend.repository;

import com.waterView.waterviewbackend.model.Analises;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalisesSeriesRepository extends JpaRepository<Analises, Long> {

    @Query(value = """
      with dias as (
        select (current_date - (cast(:days as integer) - 1)) + g as dia
        from generate_series(0, cast(:days as integer) - 1) as g
      )
      select to_char(d.dia, 'YYYY-MM-DD') as dia,
             round(avg(a.ph)::numeric, 2) as valor
      from dias d
      left join analises a
        on a.hora_da_amostragem >= d.dia
       and a.hora_da_amostragem <  d.dia + interval '1 day'
      group by d.dia
      order by d.dia
      """, nativeQuery = true)
    List<Object[]> seriePhUltimosDias(@Param("days") int days);

    @Query(value = """
      with dias as (
        select (current_date - (cast(:days as integer) - 1)) + g as dia
        from generate_series(0, cast(:days as integer) - 1) as g
      )
      select to_char(d.dia, 'YYYY-MM-DD') as dia,
             round(avg(a.condutancia)::numeric, 2) as valor
      from dias d
      left join analises a
        on a.hora_da_amostragem >= d.dia
       and a.hora_da_amostragem <  d.dia + interval '1 day'
      group by d.dia
      order by d.dia
      """, nativeQuery = true)
    List<Object[]> serieCondUltimosDias(@Param("days") int days);

    @Query(value = """
      with dias as (
        select (current_date - (cast(:days as integer) - 1)) + g as dia
        from generate_series(0, cast(:days as integer) - 1) as g
      )
      select to_char(d.dia, 'YYYY-MM-DD') as dia,
             round(avg(a.turbidez)::numeric, 2) as valor
      from dias d
      left join analises a
        on a.hora_da_amostragem >= d.dia
       and a.hora_da_amostragem <  d.dia + interval '1 day'
      group by d.dia
      order by d.dia
      """, nativeQuery = true)
    List<Object[]> serieTurbUltimosDias(@Param("days") int days);
}
