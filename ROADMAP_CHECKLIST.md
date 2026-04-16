# Easy Promoter – roadmap (checklist)

Use este arquivo para marcar o que já foi feito e o que vem na sequência. Marque com `[x]` quando concluir.

---

## Já entregue (referência)

- [x] Auth Supabase, convite pelo admin, callback e sessão
- [x] Perfis promoter / super admin e RLS em `contacts`
- [x] CRUD de contatos, filtros, cooldown visual, aniversários
- [x] WhatsApp com confirmação para atualizar último contato
- [x] Dashboard com gráficos e lista de contatos em rota separada
- [x] Header com rota ativa destacada
- [x] Admin: convites, lista de promoters, contatos read-only
 
---

## Curto prazo (MVP+)

- [ ] Histórico de contatos (`contact_touch_logs` ou equivalente) ao confirmar “contatei hoje”
- [ ] Bloco “Últimas ações” no dashboard alimentado por esse histórico
- [ ] Card “Quem chamar hoje” com regra simples (frio + prioridade)
- [ ] Exportar CSV da lista de contatos (respeitando filtros atuais)
- [ ] Busca por WhatsApp e por Instagram, além do nome
- [ ] Tags livres por contato (além de mailing/posta/gasta bem)

---

## Médio prazo

- [x] Modelos de mensagem: removidos do produto (texto único no link do WhatsApp)
- [ ] Meta semanal (“N contatos esta semana”) com barra no dashboard
- [ ] Alerta de possível duplicado (mesmo WhatsApp ou nome muito parecido)
- [ ] Tabela de convites no admin (pendente, aceito, reenviar)
- [ ] Melhorias de UX: skeletons, estados vazios mais ricos, feedback de erro uniforme

---

## Maior escopo (quando fizer sentido)

- [ ] Entidade evento/festa com status por contato (confirmado, talvez, não)
- [ ] PWA ou app mobile focado em lista + WhatsApp
- [ ] Notificações (e-mail ou push): aniversário, contato muito tempo sem falar
- [ ] Organização / equipe: vários promoters, permissões e contatos compartilhados

---

## Qualidade e produto

- [ ] Testes manuais de RLS (promoter A não vê B; admin vê read-only)
- [ ] Revisão de acessibilidade (foco, contraste, labels)
- [ ] Atalhos de teclado na lista de contatos (opcional)
- [ ] Densidade compacta / confortável (opcional)

---

*Atualize os itens conforme prioridade do time.*
