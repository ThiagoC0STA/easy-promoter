# Easy Promoter: checklist de ideias de produto

Backlog para o app parecer mais completo e “vivo”. Marque `[x]` conforme for entregando. Priorize o que o cliente pede, o que vende na conversa e o que reduz suporte.

**Última leva no código (sugestão de versão): 1.6**  
Removido adiamento (“lembrar depois” / snooze) da lista e da fila do dia; botão do WhatsApp usa ícone da marca. Leva **1.5**: sem modelos de mensagem. **1.4**: histórico local, follow-up, banner da fila.

**Leva anterior: 1.1**  
Fila do dia, resumo por segmento, export CSV, modo compacto, onboarding, atalhos, manifest, privacidade/termos.

---

## Como priorizar (faça uma vez por release)

- [ ] Escolher **3 itens** que o cliente citou ou que mais vendem na demo
- [ ] Escolher **2 itens** que reduzem suporte (onboarding, export, erros claros, docs)
- [x] Dar um **nome de versão** à leva – sugerido: **1.6** (1.5 e anteriores acima)
- [ ] Revisar a seção **Evitar neste trimestre** e confirmar o que fica fora

---

## 1. Ritmo de trabalho (“por que abrir todo dia”)

- [x] **Fila do dia**: bloco ou rota com “quem contatar hoje” (aniversário, cooldown ok, nunca contatado), limite claro (ex.: top 10) – no dashboard
- [x] **Ordenação da fila** por regra única documentada (score ou prioridade fixa) – ver `lib/dashboard/day-queue.ts`
- [ ] **Snooze / lembrete**: removido do produto (decisão atual; sem adiar na lista ou na fila)
- [x] **Metas leves**: contador semanal de contatos registrados (sem ranking agressivo) – card “Toques em 7 dias” (`weekly-touch-stats.ts`)
- [x] **Histórico de toques** por contato: linha do tempo (data + tipo: canal aberto, confirmação touch, edição) – **local no navegador** na edição do contato (`touch-history-storage.ts`); edições de formulário ainda sem log dedicado
- [x] **Notificação in-app** opcional quando a fila do dia tiver novos itens (sem push agressivo no início) – banner na dashboard com “marcar como visto” (`DayQueueFreshnessBanner`)

---

## 2. Dados (sensação de produto maduro)

- [x] **Export CSV** da lista respeitando filtros atuais – botão na lista de contatos (`lib/contacts/export-contacts-csv.ts`)
- [x] **Import CSV** com mapeamento de colunas – cabeçalhos `name`/`nome`, `whatsapp`, `instagram`, `birthday`, `segments` (`lib/contacts/csv-import.ts` + `/app/contacts/import`)
- [x] **Pré-visualização de import** com lista de erros antes de gravar – tabela + erros por linha após import (`CsvImportForm`)
- [ ] **Tags livres** além dos segmentos fixos (modelo + UI + filtro)
- [ ] **Campos customizados** (começar com 1 ou 2 campos configuráveis)
- [x] **Resumo por segmento** na dashboard: frase gerada além do gráfico (ex.: “X% mailing sem contato em 14 dias”) – `lib/dashboard/segment-insights.ts`
- [x] **Backup manual** documentado para o cliente (export + onde guardar) – texto no `title` do botão Exportar CSV

---

## 3. Canais e ações

- [ ] **Templates de mensagem** (WhatsApp) com variáveis: fora do produto por decisão atual
- [ ] **Copiar texto pronto** a partir do contato: fora do produto (sem biblioteca de modelos)
- [x] **Deep links** testados: abrir WhatsApp/Instagram com texto quando a plataforma permitir – WhatsApp com `?text=` (Instagram sem texto na URL)
- [x] **Documentação interna** dos formatos de link (para manutenção) – `channel-urls-doc.ts` + bloco na página Saúde
- [x] **Follow-up opcional** após “contato feito”: perguntar data do próximo contato e gravar (campo ou nota estruturada) – data **local** no modal e bloco na edição (`followup-storage.ts`)

---

## 4. Admin e operação

- [ ] **Auditoria mínima**: quem convidou quem, data, papel convidado
- [ ] **Último login** (ou última atividade) visível na lista de promoters
- [ ] **Desativar promoter** (`active` no perfil) sem apagar dados
- [ ] **Lista de promoters** mostra estado ativo/inativo
- [ ] **Limite de convites por dia** (config por env ou tabela `app_settings`)
- [x] **Página de saúde** (admin ou só dev): versão do app, status Supabase, última migração relevante – `/admin/health` (sem histórico de migração automático ainda)

---

## 5. Experiência (peso sem peso)

- [x] **Onboarding pós-login** em 3 passos (cooldown, filtros, onde registrar contato) – `AppOnboarding`, primeira visita em `/app`
- [x] **Marcar onboarding como concluído** (localStorage ou coluna no profile) – `localStorage` chave `ep_onboarding_v1_done`
- [x] **Tooltips** nos campos mais densos do formulário (uma linha cada) – `title` em Nome, Segmentos, Último contato (expandir depois)
- [x] **Modal “Atalhos”** (`?`): `/` na busca, `Esc` nos filtros – botão no header + `useGlobalShortcutHelp`
- [x] **Modo compacto** na lista de contatos (toggle: menos padding, mais densidade)
- [x] **Lembrar preferência** de modo compacto (localStorage) – chave `ep_contacts_compact_v1`

---

## 6. Diferenciação de mercado

- [ ] **Entidade evento / rolê**: nome, data, nota curta
- [ ] **Vincular contatos ao evento** (interesse / convidado / compareceu)
- [x] **Sugestão de abordagem** por regra estática (último contato + segmento → texto sugerido, sem IA) – `approach-hint.ts` na lista
- [ ] **Modo “dia do show”**: checklist (confirmados, frios, aniversariantes do dia)
- [ ] **Atalho na dashboard** para o modo show quando houver evento “hoje”

---

## 7. Mobile e confiança

- [x] **PWA**: manifest, ícone, tema da barra, `start_url` – `app/manifest.ts` + `metadata` no layout (ícone placeholder `window.svg`; evoluir para PNG 192/512)
- [ ] **Splash / nome** ao adicionar à tela inicial (onde o SO permitir)
- [x] **Cache de leitura** da lista com banner “offline, dados podem estar desatualizados” – banner global leve (`OnlineStatusBanner`; cache local completo ainda não)
- [x] **Página Política de privacidade** (stub ou texto real) – `/privacidade`
- [x] **Termos de uso** (stub ou texto real) – `/termos`
- [x] **Links no rodapé** da landing e na tela de login

---

## 8. Qualidade e crescimento (pós-MVP)

- [ ] **Testes E2E** da fila do dia ou do fluxo crítico que vocês escolherem
- [ ] **Métricas de uso** anônimas (opcional): telas mais visitadas, falhas de import
- [x] **Changelog** visível para admins ou em doc interna – `/admin/changelog` + `lib/admin/changelog.ts`

---

## 9. Evitar neste trimestre (revisar a cada release)

Marque `[x]` quando a equipe **confirmar em reunião** que continua fora do escopo (evita escopo creep).

- [ ] **Evitar**: IA generativa em todos os fluxos
- [ ] **Evitar**: notificações push agressivas antes do hábito diário no app
- [ ] **Evitar**: RBAC granular estilo enterprise antes de existir mais de um papel na prática
- [ ] **Evitar**: módulo financeiro / cobrança sem definição de negócio clara

---

## Referência cruzada

- Checklist técnico e MVP: `EASY_PROMOTER_CHECKLIST.md`
- Polimento visual e UX de interface: `DESIGN_UX_CHECKLIST.md`
