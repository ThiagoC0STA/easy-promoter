# Easy Promoter - checklist do projeto

Checklist para evoluir do fluxo em planilha para um app com **Supabase** (dados, auth e regras).

**Decisoes ja alinhadas**

- Tema **claro e escuro** (preferencia salva e respeitando `prefers-color-scheme` onde fizer sentido).
- Papeis: **promoter** (ve so os proprios dados) e **super admin** (ve todos os promoters / contatos conforme regra de produto).
- **Sem cadastro publico:** ninguem cria conta sozinho; so entra quem foi **convidado** pelo super admin.
- **UI profissional:** aparencia de produto maduro (tipografia, cores, espacamento, feedback de estados), nao "tela de prototipo".
- **Cooldown**: 10 dias (visual only, nao bloqueante).
- **Segmentos**: multi-select (mailing, posta, gasta bem).
- **Eventos**: nada por agora (MVP = contacts only).
- **Super admin**: read-only sobre contatos de outros promoters.

---

## 1. Produto e escopo

- [x] Definir usuario principal (promoter solo vs equipe / casa)
- [x] Definir regra de "cooldown" (10 dias, visual only)
- [x] Definir se um contato pode estar em varios segmentos (sim, multi-select)
- [x] Listar filtros obrigatorios na primeira versao (genero musical, segmento, dias sem contato, aniversario)
- [x] Decidir se havera "evento / festa" como entidade (nao, MVP)
- [x] Definir o que o super admin pode fazer alem de ver (somente leitura)
- [x] Definir expiracao e reenvio de convite (link invalido apos X dias, etc.)

---

## 2. Supabase - projeto e ambiente

- [x] Criar projeto no Supabase
- [x] Guardar `SUPABASE_URL` e chaves so em variaveis de ambiente (nunca no front publico alem da anon key)
- [x] Configurar dominios / redirect URLs se usar auth com email ou OAuth
- [x] Habilitar extensoes necessarias

---

## 3. Supabase - modelo de dados

- [x] Tabela de **perfis** (ligada a `auth.users`): nome exibido, `role` (`promoter` | `super_admin`), `owner_id`
- [x] Tabela ou fila **invites** (edge function com `inviteUserByEmail`)
- [x] Tabela **contacts**: nome, whatsapp, instagram, birthday, notes, genres[], segments[], frequency, spending, post_type, reach, confirmed, responded, last_contacted_at
- [x] Campos da aba `_Listas`: frequency, spending, post_type, reach, confirmed, responded (check constraints)
- [x] Campo **last_contacted_at** em contacts
- [x] Trigger `updated_at` automatico

---

## 4. Supabase - seguranca (RLS)

- [x] Ativar RLS na tabela contacts
- [x] Politicas: promoter so le/escreve contatos onde ele e o dono (`owner_id = auth.uid()`)
- [x] Politicas: super admin pode `SELECT` em todas as linhas via `is_super_admin()`
- [x] Garantir que promoters nunca consigam promover a si mesmos a super admin
- [x] Revisar politicas para `INSERT` / `UPDATE` / `DELETE` / `SELECT`
- [x] Service role so no backend (Edge Function) para enviar convites

---

## 5. Supabase - Auth (so convidado)

- [x] Desativar cadastro publico no painel do Supabase
- [x] Fluxo de convite: super admin dispara convite (Edge Function com service role chamando `inviteUserByEmail`)
- [x] Email do convite: redirect URL da app
- [x] Definir se promoters usam magic link ou senha (magic link por padrao, senha como opcao)
- [x] Trigger para criar linha em `profiles` ao confirmar usuario, com `role = 'promoter'` por padrao
- [x] Primeiro usuario super admin: criado manual no painel

---

## 6. App (frontend)

### Design profissional (UI/UX)

- [x] **Design system leve**: paleta, raios de borda, sombras e espacamento consistentes nos dois temas
- [x] **Tipografia legivel**: escala clara (titulos, corpo, legendas), pesos adequados, line-height confortavel
- [x] **Hierarquia visual**: acao principal vs secundaria (botoes, links, chips de segmento/genero)
- [x] **Estados vazios e de erro**: spinner, mensagens claras, formularios com validacao visivel
- [x] **Acessibilidade basica**: contraste nos dois temas, foco visivel, labels em inputs
- [x] **Mobile-first**: layout responsivo com card view em telas pequenas

### Funcionalidades

- [x] **Dark mode e light mode**: toggle na UI, token/cores por tema, persistir escolha
- [x] Respeitar `prefers-color-scheme` como default ate o usuario escolher tema manualmente
- [x] Area **super admin**: listar promoters, ver contatos de um promoter (somente leitura)
- [x] Tela **enviar convite**: campo de email, feedback de sucesso/erro
- [x] Lista de contatos com ordenacao "ha mais tempo sem contato" (nulls first)
- [x] Indicador visual de cooldown (verde = disponivel, amarelo = recente, vermelho = aguardar)
- [x] Filtros por segmento e por genero musical (multi-select dropdowns)
- [x] Destaque de aniversarios proximos (proximos 7 dias)
- [x] Acao "Registrar contato agora" (atualiza `last_contacted_at`)
- [x] Link Instagram / WhatsApp clicavel
- [x] Formulario de criacao/edicao com todos os campos
- [x] Landing page profissional com design startup

---

## 7. Migracao da planilha

- [x] Script `scripts/migrate-xlsx.ts` para import inicial (fora da pasta `supabase`)
- [x] Normalizar WhatsApp para formato numerico (digits only)
- [x] Unificar as tres abas em um contato com varios segmentos (dedup por nome)
- [x] Converter colunas "Genero" 1-5 em lista de generos; ignorar "."
- [x] Importar `ultimo contato` para `last_contacted_at`
- [ ] Conferir amostra manual apos import (10 a 20 linhas)

---

## 8. Qualidade e lancamento

- [ ] Testar RLS: promoter A nao ve contatos de promoter B
- [ ] Testar RLS: super admin ve dados de A e B conforme politicas
- [ ] Testar que signup publico nao cria usuario (tentativa pela API ou UI)
- [ ] Testar fluxo completo: convite -> email -> primeiro login -> profiles correto
- [x] Testar tema claro/escuro em rotas principais
- [ ] Testar regra de cooldown com datas no passado e no futuro
- [ ] Backup / politica de retencao alinhada ao uso (LGPD se aplicavel)
- [x] Versao inicial usavel em mobile (responsivo)

---

## 9. Roadmap de produto (ideias além do MVP)

Checklist detalhado com todas as ideias priorizáveis: **`IDEIAS_PRODUTO.md`** (itens da leva **1.1** já marcados lá: fila do dia, CSV, onboarding, atalhos, compacto, manifest, legal).

- [ ] Ler `IDEIAS_PRODUTO.md` e escolher a leva da próxima versão (regra 3 + 2 do topo desse arquivo)
- [ ] Marcar itens concluídos diretamente em `IDEIAS_PRODUTO.md` com `[x]`
- [ ] Quando uma ideia exigir mudança no banco ou RLS, acrescentar subtarefa em `EASY_PROMOTER_CHECKLIST.md` nas seções 3 ou 4

---

## Legenda rapida

| Item na planilha atual | No app |
|------------------------|--------|
| Varias abas por tipo    | Um contato + segmentos/tags |
| 5 colunas "Genero"      | Lista de generos |
| ultimo contato          | `last_contacted_at` + touch action |
| _Listas                 | Campos com check constraints |

---

*Atualize este arquivo marcando `[x]` conforme for fechando cada etapa.*
