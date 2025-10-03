# Portafolio Fotográfico — Sitio estático listo para GitHub Pages

Sitio estático (HTML+CSS+JS) para un portafolio de fotógrafa junior. **Diseño creativo y moderno** con hero section impactante, galería con descripciones detalladas, modo claro/oscuro y lightbox interactivo. Publicable gratis en GitHub Pages.

## ✨ Características destacadas

- **Hero section creativo** con foto de la fotógrafa, estadísticas y elementos decorativos
- **Descripciones detalladas** para cada foto: propósito, técnica utilizada y historia detrás
- **Lightbox expandido** con información completa y navegación inteligente
- **Sección "Sobre mí"** mejorada con biografía personal y galería de trabajo
- **Diseño responsive** con animaciones suaves y efectos visuales modernos
- **Modo claro/oscuro** con persistencia en localStorage
- **Filtros por categoría** y búsqueda en tiempo real
- **Optimización de imágenes** con WebP y srcset

## Estructura

```
.
├─ index.html
├─ 404.html
├─ assets/
│  ├─ css/
│  │  └─ tailwind-extras.css
│  └─ js/
│     └─ gallery.js
└─ fotos/             # coloca tus fotos reales aquí (ya existe en el repo)
```

- Puedes mantener las fotos en `fotos/` (recomendado). Si prefieres `assets/photos/`, crea la carpeta y ajusta rutas en `assets/js/gallery.js`.

## Cómo colocar tus fotos

1. Copia tus imágenes a `fotos/`.
2. Nombra los archivos de forma descriptiva, por ejemplo:
   - `retrato_marta-barcelona-2024.jpg`
   - `bodas_laura-jorge-anillos-2023.jpg`
   - `producto_cafe-pack-2024.png`
3. Las categorías se infieren por palabras del nombre: `retrato`, `boda`, `anillo`, `embaraz`, `playa`, `producto`, etc. Si no coincide, caerá en `varios`.
4. El título se genera del nombre de archivo (guiones/bajos → espacios). La metainformación (ubicación/año) se intenta deducir si aparece en el nombre.

## WebP + srcset/sizes y `<picture>`

Para mejor rendimiento, genera 3 tamaños por foto y su versión WebP. Nomenclatura sugerida:

- `nombre-480.webp` (o `.jpg`), `nombre-1200.webp`, `nombre-2560.webp`
- Tamaños objetivo: 480w (móvil), 1200w (tablet/desktop medio), 2560w (desktop grande)

Ejemplo de uso en HTML (ya incluido en el hero):

```html
<picture>
  <source type="image/webp" srcset="fotos/foto-retrato-480.webp 480w, fotos/foto-retrato-1200.webp 1200w, fotos/foto-retrato-2560.webp 2560w" sizes="(max-width: 768px) 100vw, 40vw" />
  <img src="fotos/foto-retrato.jpg" alt="Retrato" loading="eager" decoding="async" />
  </picture>
```

Para las miniaturas de la galería puedes actualizar `assets/js/gallery.js` para usar srcset dinámico si generas variantes. Busca el comentario:

```js
// picture.innerHTML = `<source type="image/webp" srcset="..." sizes="...">`;
```

y agréga tus rutas.

## Cómo convertir a WebP y generar tamaños

- Usando Squoosh (GUI, gratis): `https://squoosh.app/`
- Usando Sharp (CLI, Node):

```bash
# Windows PowerShell
npm i -g sharp-cli
sharp fotos/foto.jpg --resize 480 --format webp -o fotos/foto-480.webp
sharp fotos/foto.jpg --resize 1200 --format webp -o fotos/foto-1200.webp
sharp fotos/foto.jpg --resize 2560 --format webp -o fotos/foto-2560.webp
```

- Usando cwebp (CLI): `https://developers.google.com/speed/webp/docs/using`

## Tailwind por CDN (Play CDN)

Este proyecto usa Tailwind por CDN para evitar build. Puede haber un pequeño FOUC (Flash of Unstyled Content). Lo mitigamos ocultando el body hasta establecer el tema y cargar estilos. Puedes retirar esta mitigación si compilas Tailwind.

### Opción producción (compilar Tailwind)

1. Inicializa Node y Tailwind:

```bash
npm init -y
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

2. Configura `tailwind.config.js`:

```js
module.exports = {
  content: ["./index.html", "./assets/js/**/*.js"],
  darkMode: "class",
  theme: { extend: {} },
  plugins: [],
};
```

3. Crea `assets/css/input.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

4. Compila en desarrollo:

```bash
npx tailwindcss -i ./assets/css/input.css -o ./assets/css/output.css --watch
```

5. Compila para producción (minificado):

```bash
npx tailwindcss -i ./assets/css/input.css -o ./assets/css/output.css --minify
```

6. En `index.html`, reemplaza el Play CDN por:

```html
<link rel="stylesheet" href="assets/css/output.css" />
```

## Publicar gratis en GitHub Pages

- Método 1 (raíz):
  1. Sube todo a GitHub.
  2. En GitHub > Settings > Code and automation > Pages.
  3. Source: `Deploy from a branch`.
  4. Branch: `main` (o `master`), Folder: `/root`.
  5. Guarda. Tu sitio quedará en `https://<usuario>.github.io/<repo>/`.

- Método 2 (carpeta `/docs`):
  1. Mueve `index.html`, `404.html`, `assets/` a `docs/`.
  2. En Pages, elige Folder: `/docs`.

### Comandos git de ejemplo

```bash
# Inicializar y primer push
git init
git add .
git commit -m "Portafolio inicial"
# Reemplaza <usuario> y <repo>
git branch -M main
git remote add origin https://github.com/<usuario>/<repo>.git
git push -u origin main
```

## Accesibilidad y SEO

- Alt de imágenes: se genera desde el nombre del archivo.
- Navegación por teclado: botones y enlaces tienen foco visible.
- Metas de SEO/Open Graph/Twitter están en `index.html`. Puedes ajustar el `title` y `description`.

## Notas de rendimiento

- `loading="lazy"` y `decoding="async"` en miniaturas.
- Usa `<picture>` + WebP y `srcset/sizes` para mayor eficiencia.
- Preconnect a Google Fonts y `preload` para la imagen hero (ajústala si cambias la destacada).
- Minimiza JS/CSS si compilas Tailwind (ver sección producción).

## Ejemplos de 3 imágenes de muestra

En este repo ya hay fotos en `fotos/`. Ejemplos visibles en la galería:

- `fotos/foto-retrato.jpg`
- `fotos/casados-mirandose.jpg`
- `fotos/espuma-playa.jpg`

Para cada una, si generas variantes:

```text
foto-retrato-480.webp, foto-retrato-1200.webp, foto-retrato-2560.webp
casados-mirandose-480.webp, casados-mirandose-1200.webp, casados-mirandose-2560.webp
espuma-playa-480.webp, espuma-playa-1200.webp, espuma-playa-2560.webp
```

Y ajusta el `<picture>` de ejemplo del hero o en `gallery.js`.

## Formulario de contacto sin backend

- `mailto:` ya funciona, pero algunos clientes pueden abrir el correo local.
- Alternativas gratuitas:
  - Formspree: crea un endpoint y cambia `action="https://formspree.io/f/<id>"` y `method="POST"`.
  - Netlify Forms: añade `netlify` y `name` al `<form>` y publica en Netlify.

---

Hecho con foco en simplicidad, rendimiento y una estética limpia y profesional.


