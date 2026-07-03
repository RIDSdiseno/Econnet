# Security setup

Este backend usa variables de entorno para credenciales de base de datos, JWT,
OAuth, pasarelas de pago, Cloudinary y SMTP. No guardes secretos reales en Git.

## Entorno local

1. Copia `.env.example` a `.env`.
2. Completa `.env` con valores reales solo en tu entorno local o proveedor de
   despliegue.
3. Genera un secreto JWT seguro:

```powershell
npm run generate:jwt-secret
```

4. Usa el valor generado como `JWT_SECRET`. Debe tener al menos 64 caracteres.

## Verificar si `.env` esta trackeado

```powershell
git ls-files | findstr ".env"
```

## Quitar `.env` del tracking

```powershell
git rm --cached --ignore-unmatch .env
```

Despues confirma que `.env.example` siga versionado y que `.env` no aparezca en
`git status` como archivo listo para commit.

## Revisar si `.env` estuvo en el historial

```powershell
git log --all --full-history -- .env
```

## Purgar `.env` del historial con `git filter-repo`

Instala `git-filter-repo` si no lo tienes disponible y ejecuta:

```powershell
git filter-repo --path .env --invert-paths
```

Si tambien se versionaron otros archivos con secretos, repite el proceso para
cada ruta afectada. Despues de reescribir historial, coordina el force push con
el equipo y pide a todos clonar nuevamente o rebasar con cuidado.

## Rotacion obligatoria de credenciales expuestas

Si alguna credencial real estuvo en Git, aunque ya se haya purgado del historial,
debe considerarse expuesta. Rota los secretos en los proveedores reales:

- PostgreSQL / proveedor de base de datos.
- Cloudinary.
- Google OAuth.
- Microsoft OAuth.
- Mercado Pago.
- Transbank / Webpay / Oneclick.
- SMTP.
- JWT_SECRET.

No reutilices secretos antiguos despues de la rotacion.
