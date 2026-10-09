# UniBecario — Seguridad, HTTPS, OWASP ZAP y API móvil

## Estado de implementación

Arquitectura del repositorio `UniBecario-control`: React/Vite (frontend), Supabase Auth, PostgreSQL + RLS (base de datos/API), Vercel (hosting frontend).

- El archivo raíz `vercel.json` habilita cabeceras defensivas y redirección interna de rutas SPA. No reemplaza la autorización en PostgreSQL.
- Vercel administra automáticamente el TLS/SSL de dominios correctamente vinculados, con Let's Encrypt. **No instalar Certbot en Vercel**. Certbot solo se emplearía si se migrara a un VPS o servidor propio con control del sistema operativo.
- HTTPS también es usado por el proyecto Supabase, en `https://gieqvogvvidjmwzzgduz.supabase.co`. Nunca uses la contraseña de PostgreSQL o la clave secreta/service_role en React.
- Supabase Auth y las políticas de RLS deben comprobarse con perfiles autenticados de distintos roles. El acceso con `ProtectedRoute` es una defensa de UX, NO reemplaza RLS.

## Comprobar HTTPS en el despliegue

1. Confirma que Vercel construye la rama `master` de este repositorio y publica el commit con `vercel.json`.
2. Confirma el certificado y el candado TLS abriendo la URL `https://...` y verifica redirección desde HTTP.
3. Valida cabeceras: `curl -I https://TU-DOMINIO/`. Deben estar `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`.
4. Prueba abrir directamente `/login`, `/student/dashboard` y `/admin/dashboard`, refrescar y comprobar redirecciones por rol.
5. Hacer tests de política RLS: visitante sin sesión, becario pendiente, becario activo, admin activo; intentar leer/escribir datos de otro usuario; verificar bloqueo.
6. Verificar que `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en Vercel apuntan al proyecto correcto. Las variables `VITE_*` son públicas en el bundle del navegador: usar solo clave **publishable**, nunca secretos.

## OWASP ZAP: auditoría reproducible

El workflow `.github/workflows/zap-baseline.yml` es **manual**, y no se ha ejecutado automáticamente.

1. En GitHub > Settings > Secrets and variables > Actions > Variables, crear `ZAP_TARGET_URL` con una URL HTTPS **propia/autorizada**, preferentemente de staging, sin datos reales.
2. En GitHub > Actions > **Auditoria OWASP ZAP (baseline pasivo)** > **Run workflow**.
3. Descargar el artifact `reporte-owasp-zap` (HTML y JSON) y registrar fecha, URL, alertas, severidad, evidencia, cambios y una segunda verificación.
4. La auditoría baseline rastrea páginas y evalúa alertas pasivas; no garantiza que el sistema esté libre de vulnerabilidades.
5. **No ejecutes Full Scan/escaneo activo contra producción ni contra endpoints ajenos**: puede generar tráfico ofensivo, modificar datos y requerir permiso explícito. Reservar pruebas activas para una réplica o staging aislado.

Para ejecutarlo manualmente desde tu computadora con Docker (sobre tu propia URL HTTPS):

```powershell
mkdir zap-output
docker run --rm -v "${PWD}/zap-output:/zap/wrk:rw" ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t "https://TU-DOMINIO" -m 1 -T 10 -r reporte.html -J reporte.json -I
```

## Arquitectura Web + API + móvil

```text
React (Vercel) / App móvil futura
       | HTTPS + sesión/JWT del usuario
       v
Supabase Auth + REST API + Edge Functions (para lógica privilegiada)
       | RLS, privilegios y validación del servidor
       v
PostgreSQL de UniBecario
```

Supabase ya dispone de Data REST API generada automáticamente bajo `https://gieqvogvvidjmwzzgduz.supabase.co/rest/v1/`. **No exponer el esquema private**. La API web y la futura app móvil pueden reutilizar los mismos usuarios y permisos.

Usar Edge Functions autenticadas para operaciones administrativas sensibles (aprobación de solicitudes, reinicio/auditoría de horas e invitaciones) cuando se implemente esa funcionalidad. Validar token del usuario y permisos del lado del servidor; nunca confiar en rol pasado por el cliente.

En React no existe todavía un rol visual `superadmin` ni hay app móvil implementada. Propuesta incremental: PWA para acceso desde teléfonos, luego app híbrida con Capacitor o React Native/Expo, manteniendo Auth y la misma API.

## Requisitos de seguridad pendientes

- La autenticación real requiere cuentas en Supabase Auth. Las identidades e historiales importados al esquema privado deben vincularse **tras verificación de identidad**; no promocionar cuentas por coincidencia de correo automáticamente.
- Revisar el flujo OAuth Google: la ruta `/auth/callback` debe estar implementada y registrada en Redirect URLs de Supabase, o usar un destino gestionado existente.
- Exigir contraseñas robustas, verificación de correo, MFA para administradores, protección de intentos de login y registros de auditoría de operaciones.
- Completar la revisión de políticas RLS y pruebas automatizadas; el scanner no cubre lógica de negocio, separación entre usuarios o vulnerabilidades internas.
- Integrar una Content-Security-Policy apropiada **después** de verificar los recursos externos que utiliza la UI, para no bloquear scripts/estilos legítimos.
- Evaluar dependencias con `npm audit`, corregir vulnerabilidades y probar `npm run build` antes de publicar.
- Conservar los datos históricos originales como fuente de verdad durante la vinculación; no importar datos ficticios.
- Controlar el acceso a reportes ZAP: URLs, rutas y query strings podrían ser sensibles.

## Referencias

- Vercel SSL: https://vercel.com/docs/domains/working-with-ssl
- Vercel configuración y headers: https://vercel.com/docs/project-configuration/vercel-json
- Vercel Vite/SPA: https://vercel.com/docs/frameworks/frontend/vite
- OWASP ZAP Baseline: https://www.zaproxy.org/docs/docker/baseline-scan/
- Supabase Data API: https://supabase.com/docs/guides/api
- Supabase seguridad: https://supabase.com/docs/guides/database/secure-data
