# Unidad didáctica de Radiología

Sitio educativo estático sobre calidad de imagen y posicionamiento radiográfico. No requiere servidor ni instalación de dependencias.

## Ejecución local

Abre `index.html` en un navegador moderno. Para una vista local más fiel, sirve la carpeta con cualquier servidor estático (por ejemplo, la extensión Live Server de VS Code).

## Publicación en GitHub Pages

El flujo de trabajo de `.github/workflows/pages.yml` publica automáticamente el contenido de la rama `main` en GitHub Pages al subir cambios.

1. En GitHub, abre **Settings → Pages**.
2. En **Build and deployment**, selecciona **GitHub Actions** como fuente.
3. Abre **Actions** y espera a que termine el flujo **Publicar sitio en GitHub Pages**.
4. Visita `https://nahirandreav.github.io/tarea-integradora/`.

Cada actualización se publica al hacer `git push` a `main`. Pages puede tardar unos minutos en reflejarla.

## Archivos del sitio

- `index.html`, `style.css`, `app.js`, `guia.js`: estructura, estilos e interacción.
- `pdf-lib.min.js`: dependencia local para generar el informe PDF sin CDN.
- `imagenes/*.webp`: imágenes usadas por la unidad.

Las imágenes son simulaciones educativas. El sitio funciona como frontend estático y no almacena datos en un servidor; el progreso queda en el navegador local del estudiante.
