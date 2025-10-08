INSERT INTO permission (description)
VALUES ('ROLE_USER')
ON CONFLICT (description) DO NOTHING;

-- (senha = Senha1234).
INSERT INTO users (username, email, senha, nome, esta_ativo)
VALUES
  ('01234567', 'admin@example.com',
   '85904f8e21240cb9aeb32bd4389e8e425ed15f27d7fd3bcbb30b6aef06f54581cce690d577bcbf66',
   'Administrador', TRUE)
ON CONFLICT (username) DO NOTHING;

WITH
  u AS (SELECT id FROM users WHERE username = '01234567'),
  p_user AS (SELECT id FROM permission WHERE description = 'ROLE_USER')
INSERT INTO user_permission (user_id, permission_id)
SELECT u.id, p_user.id FROM u, p_user
ON CONFLICT DO NOTHING;