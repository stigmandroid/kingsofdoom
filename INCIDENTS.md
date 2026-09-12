# INCIDENTS

Registro de incidentes relevantes do Kings of Doom Command Center.

---

## 2026-09-12 — CWL Archive: membros fantasmas e ataques perdidos incorretos

### Impacto

O histórico pós-CWL apresentava jogadores com guerras/ataques disponíveis acima do real, gerando falsos registros de ataques perdidos em K.O.D. e K.O.D.rec.

Na temporada `2026-09-03` foram identificados:

- K.O.D.: 10 registros de membros fantasmas;
- K.O.D.rec: 14 registros de membros fantasmas;
- total: 24 registros incorretos em `cwl_war_members`.

### Causa raiz

O arquivador da CWL utilizava UPSERT para persistir os membros presentes em cada snapshot, porém não removia jogadores que haviam aparecido em snapshots anteriores e deixado de fazer parte da escalação final da guerra.

Como `findCwlArchivePlayerPerformance()` considera cada registro em `cwl_war_members` uma participação na guerra, esses registros obsoletos eram interpretados como participações reais sem ataque realizado.

### Correção estrutural

Foi adicionada reconciliação da escalação por:

- `war_id`;
- `side`;
- `clan_tag`;
- lista atual de `player_tag`.

A reconciliação remove somente membros que não existem mais no snapshot atual.

Também foi adicionada uma barreira de segurança:

- a reconciliação só pode ocorrer quando `teamSize` é válido;
- `clan.members.length === teamSize`;
- `opponent.members.length === teamSize`.

Snapshots incompletos não podem provocar exclusão de escalações válidas.

### Reparo histórico

Antes do reparo foi criado e validado backup nativo do SQLite:

`backups/kings-of-doom-cwl-2026-09-03-2026-09-12T17-40-54.sqlite`

Validação:

- `valid: true`;
- `integrityCheck: ok`.

Os `raw_json` finais das 14 guerras dos dois clãs foram confirmados como íntegros, com exatamente 15 membros em cada escalação.

Foram removidos em transação atômica:

- 10 registros fantasmas da K.O.D.;
- 14 registros fantasmas da K.O.D.rec.

Total: 24 registros.

### Validação pós-correção

Confirmado após o reparo:

- 7/7 guerras da K.O.D. com exatamente 15 membros persistidos;
- 7/7 guerras da K.O.D.rec com exatamente 15 membros persistidos;
- build de produção concluído com sucesso;
- processo `kingsofdoom` reiniciado com sucesso;
- processo `cocbot` não foi alterado.

### Prevenção

Não utilizar somente UPSERT para coleções mutáveis derivadas de snapshots.

Quando uma coleção de API representa o estado completo e autoritativo de uma entidade, deve existir reconciliação entre:

- registros atuais persistidos;
- registros presentes no snapshot mais recente.

Reconciliações destrutivas devem possuir validação explícita de completude do snapshot antes da exclusão.
