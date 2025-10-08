-- USERS / AUTH ---------------------------------------------------------------
create table if not exists users (
  id              bigserial primary key,
  username        varchar(120) not null unique,
  email           varchar(255) not null unique,
  senha           varchar(255) not null,   -- hash
  nome            varchar(255) not null,
  esta_ativo      boolean not null default true,
  criado_em       timestamp not null default now()
);

create table if not exists permission (
  id           bigserial primary key,
  description  varchar(120) not null unique
);

create table if not exists user_permission (
  user_id       bigint not null references users(id) on delete cascade,
  permission_id bigint not null references permission(id) on delete cascade,
  primary key (user_id, permission_id)
);

create index if not exists idx_users_email on users(email);
create index if not exists idx_users_username on users(username);

-- ANALISES -------------------------------------------------------------------
create table if not exists analises (
  id                   bigserial primary key,
  codigo               varchar(50) not null unique,
  analista             varchar(120) not null,
  local                varchar(120) not null,

  hora_da_amostragem  TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  status_da_amostra   BOOLEAN,
  aceite_relatorio    BOOLEAN,

  descricao            text,

  ph                   numeric(4,2)  not null check (ph >= 0 and ph <= 14),
  turbidez             numeric(6,2)  not null check (turbidez >= 0),
  condutancia          numeric(8,2)  not null check (condutancia >= 0),

  criado_em            timestamp not null default now()
);

CREATE INDEX IF NOT EXISTS idx_analises_hora_da_amostragem ON analises (hora_da_amostragem DESC);
CREATE INDEX IF NOT EXISTS idx_analises_analista ON analises (LOWER(analista));
CREATE INDEX IF NOT EXISTS idx_analises_local ON analises (LOWER(local));
