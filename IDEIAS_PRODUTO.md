# Ideias para o Easy Promoter parecer menos “simples”

Este arquivo é um backlog de inspiração: priorize o que combina com o público (promoters, casas, operação real) e com o tempo que vocês têm.

## Ritmo de trabalho e “por que abrir o app todo dia”

- **Fila do dia**: uma tela ou bloco fixo com “quem contatar hoje” (aniversário, cooldown liberado, quem nunca recebeu mensagem), com limite claro (ex.: top 10).
- **Snooze e lembretes**: “me lembrar em 3 dias” sem apagar o contato do radar.
- **Metas leves**: contador semanal de contatos feitos (só número, sem ranking agressivo).
- **Histórico de toques**: linha do tempo por contato (WhatsApp aberto, confirmação de contato, edição), mesmo que comece simples (só texto e data).

## Dados que parecem “produto maduro”

- **Exportação CSV** da base com os filtros atuais (cliente sente dono dos dados).
- **Importação** com mapeamento de colunas e pré-visualização de erros antes de gravar.
- **Tags livres** além de segmentos fixos (flexível sem quebrar o modelo atual).
- **Campos customizados** (1 ou 2 no início), para caber em bases diferentes sem refatorar tudo.
- **Resumo por segmento** na dashboard: não só gráfico, mas uma frase (“60% mailing ainda sem contato em 14 dias”).

## Canais e ações

- **Templates de mensagem** por canal (WhatsApp) com variáveis (`{{nome}}`, `{{evento}}`) e cópia rápida.
- **Deep links** testados e documentados (abrir chat já com texto sugerido onde a API permitir).
- **Lembrete de follow-up**: após marcar contato, perguntar “quer agendar próximo contato?” com data opcional.

## Admin e operação

- **Auditoria mínima**: quem convidou quem, quando, último login (tabela simples).
- **Desativar promoter** sem apagar histórico (estado `active` no perfil).
- **Limite de convites por dia** (configurável) para reduzir medo de abuso.
- **Página de saúde**: status Supabase, última migração, versão do app (para vocês e para cliente enterprise).

## Experiência que “pesa” sem ser pesada

- **Onboarding em 3 passos** após o primeiro login (onde clicar, o que é cooldown, onde filtrar).
- **Tooltips contextuais** nos campos mais confusos do formulário (uma linha, não parágrafos).
- **Atalhos** documentados num modal “?” (vocês já têm `/` e Esc nos filtros, pode virar “lista de atalhos”).
- **Modo compacto** na lista de contatos (menos padding, mais linhas na tela) para power users.

## Diferenciação de mercado

- **Playlists ou eventos**: entidade simples “próximo rolê” e vincular contatos com interesse (texto + data).
- **Sugestão de abordagem** baseada em último contato + segmento (texto estático por regra, não precisa de IA no começo).
- **Modo “show day”**: checklist do dia do evento (quem confirmou, quem está frio).

## Mobile e confiança

- **PWA** ou “Adicionar à tela inicial” com ícone e splash (sensação de app nativo).
- **Offline de leitura** da lista em cache (só leitura, com banner “conecte para sincronizar”).
- **Política de privacidade e termos** linkados no rodapé e no login (mesmo que stub, passa seriedade).

## O que não fazer cedo demais

- IA generativa em tudo (custo, manutenção e risco de resposta ruim).
- Notificações push agressivas antes de ter valor claro no hábito diário.
- Permissões granulares tipo enterprise (RBAC pesado) antes de ter mais de um papel na prática.

## Como usar esta lista

1. Marque 3 itens que o **cliente citou** ou que **vendem** na conversa.
2. Marque 2 itens que **reduzem suporte** (onboarding, export, mensagens claras de erro).
3. Coloque o resto em “depois” e feche uma versão nomeada (ex.: “1.1 só fila do dia + export”).

Quando quiser, dá para transformar isto em tarefas no `EASY_PROMOTER_CHECKLIST.md` ou no board que vocês usarem.
