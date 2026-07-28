# ==========================================================

# Kings of Doom Command Center

# ----------------------------------------------------------

# Arquivo:

# DEPLOY.md

#

# Responsabilidade:

# Documentar o procedimento oficial de deploy do

# Kings of Doom Command Center em produção.

#

# IMPORTANTE:

# Este documento foi validado em ambiente real.

#

# Seguir exatamente esta sequência para evitar

# indisponibilidade da aplicação.

#

# Autor:

# stigmandroid

#

# Última atualização:

# 27/07/2026

#

# Status:

# ✅ Validado em Produção

# ==========================================================

# 🚀 Deploy do Kings of Doom Command Center

---

# Arquitetura

Stack:

- Next.js 16
- React 19
- Node.js
- PM2
- Nginx
- Ubuntu 24.04 LTS
- Hostinger VPS

Aplicação:

```
/home/stigmandroid/apps/kingsofdoom
```

Usuário responsável pela aplicação:

```
stigmandroid
```

PM2 oficial:

```
/home/stigmandroid/.pm2
```

---

# Fluxo Oficial

```text
VS Code
    │
    ▼
git add
    │
git commit
    │
git push
    │
────────────────────────────
Servidor VPS
────────────────────────────
Login
    │
su - stigmandroid
    │
git pull
    │
npm ci
    │
npm run build
    │
PM2 Restart
    │
Validação
```

---

# Antes de qualquer Deploy

Sempre verificar:

```bash
whoami
```

Resultado esperado:

```
stigmandroid
```

Verificar diretório:

```bash
pwd
```

Resultado esperado:

```
/home/stigmandroid/apps/kingsofdoom
```

Verificar PM2:

```bash
PM2_HOME=/home/stigmandroid/.pm2 pm2 status
```

---

# 1. Atualizar código local

Verificar alterações

```bash
git status
```

Adicionar arquivos

```bash
git add .
```

Criar commit

```bash
git commit -m "Descrição da alteração"
```

Enviar

```bash
git push origin main
```

Confirmar último commit

```bash
git log -1 --oneline
```

---

# 2. Acessar a VPS

Hostinger

↓

VPS

↓

Gerenciar

↓

Terminal

Entrar como:

```
root
```

---

# 3. Trocar para o usuário correto

```bash
su - stigmandroid
```

Confirmar:

```bash
whoami
```

Resultado esperado:

```
stigmandroid
```

---

# 4. Entrar no projeto

```bash
cd ~/apps/kingsofdoom
```

Confirmar:

```bash
pwd
```

Resultado esperado:

```
/home/stigmandroid/apps/kingsofdoom
```

---

# 5. Atualizar aplicação

Atualizar código

```bash
git pull origin main
```

Instalar dependências

```bash
npm ci
```

Gerar build

```bash
npm run build
```

---

# 6. Reiniciar aplicação

Sempre utilizar o PM2 oficial.

```bash
PM2_HOME=/home/stigmandroid/.pm2 pm2 restart kingsofdoom
```

Salvar configuração

```bash
PM2_HOME=/home/stigmandroid/.pm2 pm2 save
```

Validar

```bash
PM2_HOME=/home/stigmandroid/.pm2 pm2 status
```

Resultado esperado

```
kingsofdoom
online
```

---

# 7. Caso o processo não exista

Erro:

```
Process or Namespace kingsofdoom not found
```

Criar processo

```bash
PM2_HOME=/home/stigmandroid/.pm2 pm2 start npm --name kingsofdoom -- start
```

Salvar

```bash
PM2_HOME=/home/stigmandroid/.pm2 pm2 save
```

Validar

```bash
PM2_HOME=/home/stigmandroid/.pm2 pm2 status
```

---

# 8. Logs

Últimas 50 linhas

```bash
PM2_HOME=/home/stigmandroid/.pm2 pm2 logs kingsofdoom --lines 50
```

Sair

```
Ctrl + C
```

---

# 9. Validar aplicação

Validar internamente

```bash
curl -I http://localhost:3000
```

Resultado esperado

```
HTTP/1.1 307 Temporary Redirect

location: /pt-BR
```

---

# 10. Validar no navegador

Abrir:

```
https://kingsofdoom.com
```

Executar:

```
Ctrl + F5
```

Validar:

- Home
- Guerra
- Releases
- Dados do clã
- API funcionando
- Sem erros críticos

---

# Rotação da Chave da Clash API

Sempre seguir esta ordem.

1. Criar nova chave.
2. Atualizar `.env.local` local.
3. Validar localmente.
4. Atualizar `.env.local` da VPS.
5. Executar:

```bash
npm run build
```

6. Reiniciar PM2.

7. Validar produção.

8. Somente então excluir a chave antiga.

Nunca excluir uma chave antes da validação.

---

# Variáveis de Ambiente

Produção utiliza:

```
.env.local
```

Variável obrigatória:

```
CLASH_API_TOKEN
```

Após qualquer alteração em variáveis de ambiente:

1. Build
2. Restart PM2
3. Validação

---

# Nginx

Arquivo

```
/etc/nginx/sites-available/kingsofdoom
```

Testar

```bash
sudo nginx -t
```

Recarregar

```bash
sudo systemctl reload nginx
```

---

# Certificado SSL

Validar

```bash
sudo certbot renew --dry-run
```

---

# Troubleshooting

## Processo não encontrado

```
Process or Namespace kingsofdoom not found
```

Verificar:

```bash
PM2_HOME=/home/stigmandroid/.pm2 pm2 status
```

---

## PM2 vazio

Executar

```bash
PM2_HOME=/home/stigmandroid/.pm2 pm2 start npm --name kingsofdoom -- start
```

Salvar

```bash
PM2_HOME=/home/stigmandroid/.pm2 pm2 save
```

---

## API retorna 403

Verificar:

- Chave da Clash API.
- IP autorizado.
- CLASH_API_TOKEN.
- Reinício do PM2.

---

## Alteração no .env.local

Sempre executar

```bash
npm run build
```

Depois

```bash
PM2_HOME=/home/stigmandroid/.pm2 pm2 restart kingsofdoom
```

---

# Incidentes Conhecidos

## 26/07/2026

Primeiro deploy da VPS.

---

## 27/07/2026

- Rotação das chaves da Clash API.
- Descoberta do PM2_HOME oficial.
- Padronização do usuário `stigmandroid`.
- Padronização do diretório da aplicação.
- Documentação atualizada.

---

# Checklist Final

☐ git add

☐ git commit

☐ git push

☐ Login na VPS

☐ su - stigmandroid

☐ whoami

☐ pwd

☐ PM2_HOME=/home/stigmandroid/.pm2 pm2 status

☐ git pull origin main

☐ npm ci

☐ npm run build

☐ PM2_HOME=/home/stigmandroid/.pm2 pm2 restart kingsofdoom

☐ PM2_HOME=/home/stigmandroid/.pm2 pm2 save

☐ curl http://localhost:3000

☐ Home

☐ Guerra

☐ Releases

☐ Dados do Clã

☐ API funcionando

☐ Deploy concluído
