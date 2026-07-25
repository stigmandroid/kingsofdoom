# Deploy - Kings of Doom

## Atualizar a aplicação

```bash
cd ~/apps/kingsofdoom
git pull
npm ci
npm run build
pm2 restart kingsofdoom
```

## Ver logs

```bash
pm2 logs kingsofdoom
```

## Status

```bash
pm2 status
```

## Reiniciar

```bash
pm2 restart kingsofdoom
```

## Nginx

Configuração:

/etc/nginx/sites-available/kingsofdoom

Testar:

```bash
sudo nginx -t
```

Recarregar:

```bash
sudo systemctl reload nginx
```

## Certificado

Validação:

```bash
sudo certbot renew --dry-run
```
