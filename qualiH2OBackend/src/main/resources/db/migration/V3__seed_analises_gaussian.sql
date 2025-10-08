-- Função auxiliar: gera string alfanumérica A–Z,0–9 de tamanho n
CREATE OR REPLACE FUNCTION random_alnum(n int)
RETURNS text LANGUAGE sql AS $$
  SELECT string_agg(ch, '')
  FROM (
    SELECT substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
                  1 + floor(random() * 36)::int, 1) AS ch
    FROM generate_series(1, n)
  ) AS t;
$$;

WITH base AS (
  SELECT
    gs AS i,
    sqrt(-2 * ln(random())) * cos(2 * pi() * random()) AS z1,
    sqrt(-2 * ln(random())) * sin(2 * pi() * random()) AS z2,
    (
      date_trunc('day', now())
      - (interval '1 day' * (30 - gs))
      + (random() * interval '23 hours')
      + (random() * interval '59 minutes')
    )::timestamp AS hora_ref
  FROM generate_series(1, 30) AS gs
),
valores AS (
  SELECT
    i,
    hora_ref,
    LEAST(14.0, GREATEST(0.0, 7.0 + 0.8 * z1))           AS ph,
    GREATEST(0.0, 3.0 + 1.2 * z2)                        AS turbidez,
    GREATEST(0.0, 300.0 + 80.0 * z1)                     AS condutancia
  FROM base
),
enriquecido AS (
  SELECT
    i,
    hora_ref,
    ph,
    turbidez,
    condutancia,
    (ARRAY['Ana Silva','Bruno Lima','Carla Souza','Diego Alves','Elisa Rocha','Felipe Nunes','Gabi Reis','Henrique Tavares'])[1 + floor(random()*8)::int] AS analista,
    (ARRAY['ETA Centro','ETA Norte','ETA Sul','Poço 12','Poço 7','Rio Pardo - Margem Leste'])[1 + floor(random()*6)::int]                                 AS local,
    CASE
      WHEN ph BETWEEN 6.0 AND 9.0
       AND turbidez <= 5.0
       AND condutancia <= 500.0
      THEN true ELSE false
    END AS status_aprovada
  FROM valores
),
pronto AS (
  SELECT
    'AM-' || to_char(hora_ref, 'YYYYMMDD') || '-' || random_alnum(6) AS codigo,
    analista,
    local,
    hora_ref                                      AS hora_da_amostragem,
    status_aprovada                                AS status_da_amostra,
    false                                          AS aceite_relatorio,
    CASE WHEN NOT status_aprovada
         THEN 'Observação: valores fora da faixa recomendada em pelo menos um parâmetro.'
         ELSE 'Amostra dentro dos limites recomendados.'
    END                                            AS descricao,
    ph, turbidez, condutancia
  FROM enriquecido
)
INSERT INTO analises
  (codigo, analista, local, hora_da_amostragem,
   status_da_amostra, aceite_relatorio, descricao,
   ph, turbidez, condutancia)
SELECT
  codigo, analista, local, hora_da_amostragem,
  status_da_amostra, aceite_relatorio, descricao,
  ph, turbidez, condutancia
FROM pronto
ON CONFLICT (codigo) DO NOTHING;
