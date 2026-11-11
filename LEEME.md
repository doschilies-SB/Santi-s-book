# Santi´s Book · Escritos y pensamientos

Web estática de escritos, con una primera exposición inspirada en Noctámbulos de Edward Hopper. Incluye la home, la página Sobre Santi Buffa, el archivo de Opinión política y las plantillas que generan las páginas de cada escrito.

## Abrir el proyecto

Usar Node.js 20 o una versión posterior.

```bash
npm ci
npm run dev
```

La vista local se abre en `http://127.0.0.1:3000`. Al editar contenido, estilos o plantillas, el proyecto vuelve a generar las páginas. Recargar el navegador para ver los cambios.

El ZIP también incluye una compilación en `dist/`. Se puede revisar directamente con `npm run preview`.

## Publicar

```bash
npm run build
```

El resultado completo se genera en `dist/`. La configuración del alojamiento debe ejecutar `npm run build` y publicar esa carpeta. El proyecto utiliza HTML, CSS y JavaScript. Node y la dependencia Marked participan en la compilación. El alojamiento final solo sirve archivos estáticos.

Completar `url` en `content/sitio.json` con el dominio definitivo, por ejemplo `https://tudominio.com`, y volver a compilar. Ese valor habilita las direcciones canónicas, la imagen al compartir y el sitemap.

## Cargar el primer escrito

1. Crear un archivo Markdown en `content/escritos/`, por ejemplo `mi-primer-escrito.md`.
2. Escribir allí el texto completo. El título principal se carga en el catálogo.
3. Reemplazar la lista vacía de `content/escritos.json` por una entrada como esta, usando el título y la fecha reales.

```json
[
  {
    "slug": "mi-primer-escrito",
    "title": "Título de tu escrito",
    "category": "Opinión política",
    "publishedAt": "2026-11-11",
    "excerpt": "Una o dos líneas para invitar a leer.",
    "file": "mi-primer-escrito.md"
  }
]
```

4. Ejecutar `npm run build` y publicar la nueva carpeta `dist/`.

Para agregar otro escrito, sumar una entrada al final de la lista y su archivo Markdown. El `slug` debe ser único y usar letras minúsculas sin tildes, números y guiones. Los archivos Markdown se guardan directamente dentro de `content/escritos/`.

La home muestra hasta tres escritos, ordenados por fecha de publicación de mayor a menor. Para dos escritos publicados el mismo día, aparece primero el agregado al final del catálogo. Cada categoría muestra todos sus escritos en ese orden. Una categoría nueva se crea al usar su nombre en un escrito publicado. Opinión política aparece desde el comienzo.

La propiedad opcional `"draft": true` guarda una entrada como borrador. Al publicarla, retirar esa propiedad o cambiarla a `false`. La fecha es editorial y no programa una publicación automática.

Markdown permite párrafos, cursivas, negritas, títulos, citas, listas, enlaces e imágenes. Una línea en blanco separa los párrafos. Los poemas pueden conservar saltos internos con dos espacios al final de cada verso. El contenido se edita en los archivos del proyecto y se vuelve a desplegar.

## Cambiar el cuadro y el ambiente

En `content/sitio.json`, el objeto `exhibition` reúne la obra y su exposición.

| Campo | Qué editar |
| --- | --- |
| `title`, `originalTitle`, `artist`, `year`, `medium` | Ficha del cuadro |
| `image` | Ruta de la imagen, guardada en `public/assets/` |
| `imageWidth`, `imageHeight` | Dimensiones de esa imagen |
| `alt` | Descripción de la imagen para accesibilidad |
| `sourceName`, `sourceUrl`, `reproductionUrl` | Procedencia y créditos |
| `note` | Explicación de que las exposiciones cambian |
| `reflection` | Párrafos de Santi sobre la elección del cuadro |
| `theme` | Colores de fondo, luz, papel, texto y acentos |
| `motifs` | Imagen decorativa con el sombrero y la servilletera |

La paleta se elige para cada exposición. El sitio aplica esos colores desde la configuración. Para una nueva composición visual, los haces de luz, el marco y las líneas de los ventanales están en `public/assets/styles.css`.

Las ilustraciones de los objetos actuales comparten una imagen transparente. `hatPosition` y `napkinPosition` seleccionan su ubicación dentro de la imagen. Usar `"motifs": null` para una exposición que prescinda de esos objetos. Para otros objetos, reemplazar la imagen y ajustar sus tamaños y posiciones en el CSS.

El nombre de la web se edita en `name` y la firma de los textos en `author`. La bienvenida se edita en `welcome` y la presentación personal en `about`.

El sombrero está unido a la S de «Sean bienvenidos» y escala con la letra. El servilletero aparece una sola vez, pequeño y apoyado sobre la línea que abre «Últimos escritos». Las posiciones y los tamaños se ajustan en `.welcome-initial .motif--hat` y `.section-heading .motif--napkin` dentro del CSS.

## Contenido de esta entrega

- La web se llama **Santi´s Book**. Los textos conservan la firma de **Santi Buffa**.
- Se retiraron la sección de la frase de San Martín, «Pasen a leer» y las flechas decorativas de enlaces y navegación.
- La explicación de Noctámbulos reproduce la versión elegida por Santi, incluidas su puntuación y ortografía.
- La bienvenida incorpora el cierre aprobado sobre encontrarse en la calle y el remate de la IA. Se ajustaron tildes y «faceta» en el resto de la bienvenida.
- Sobre Santi Buffa contiene una presentación provisional basada en la intención del sitio. Reemplazar `about` cuando Santi entregue su presentación definitiva.
- El catálogo está vacío y Opinión política está creada. El primer escrito lo carga Santi después.
- El sitio está dedicado a la lectura. Los comentarios, formularios y cuentas de lectores quedan fuera del alcance acordado.
- Las páginas de lectura usan un fondo cálido claro y una columna de texto de hasta 700 píxeles.
- El cuadro puede ampliarse con un clic y cerrarse con Escape o el botón Cerrar.
- La navegación y la lectura funcionan también con JavaScript desactivado. La ampliación usa entonces el enlace directo a la imagen.

## Archivos principales

| Archivo | Función |
| --- | --- |
| `content/sitio.json` | Nombre, autor, bienvenida, presentación y exposición |
| `content/escritos.json` | Catálogo de publicaciones |
| `content/escritos/*.md` | Cuerpo de cada escrito |
| `src/templates.mjs` | Home, archivo, páginas de lectura y página personal |
| `public/assets/styles.css` | Diseño y adaptación a pantallas chicas |
| `public/assets/main.js` | Ampliación accesible del cuadro |
| `scripts/build.mjs` | Generación de páginas y validación del catálogo |
| `scripts/dev.mjs` | Servidor local con regeneración al editar |
| `scripts/serve.mjs` | Vista local del resultado generado |

## Recursos visuales

La reproducción de Noctámbulos se descargó desde Wikimedia Commons. La ficha y los créditos enlazan al Art Institute of Chicago.

- https://commons.wikimedia.org/wiki/File:Hopper_Nighthawks.jpg
- https://www.artic.edu/artworks/111628/nighthawks

El marco se construyó en CSS tomando como referencia la madera rojiza y las molduras de la imagen que proporcionó Santi. Se adapta a las proporciones del cuadro.

Las tipografías DM Sans e Instrument Serif se incluyen localmente. Sus licencias están en `public/assets/fonts/`.

El sombrero y la servilletera se generaron con ImageGen como ilustraciones decorativas inspiradas en el ambiente del cuadro. El recurso está en `public/assets/objetos-nocturnos.png`. Se usó el siguiente prompt.

```text
Create a transparent-background asset sheet for a personal literary website inspired by the atmosphere and palette of Edward Hopper's 1942 Nighthawks. Wide landscape canvas, roughly 2:1. Exactly TWO separate isolated objects, well apart, at the same baseline, each completely visible with generous empty transparent margin. LEFT HALF: one dark charcoal-brown 1940s men's fedora, three-quarter side view, shallow pinched crown, broad brim and dark grosgrain band, warmly lit from upper right, olive-green shadows, visible painterly brushwork. RIGHT HALF: one small vintage 1940s tabletop stainless-steel diner napkin dispenser, upright rectangular with rounded shoulders, a few cream paper napkins showing through front opening, three-quarter view. Warm amber highlights and desaturated sage-green reflections. Restrained realistic oil-painting style with hand-painted surface texture, matching the realism of the painting rather than cartoon or vector style. These are website decorative cutouts to sit separately next to headings. True transparent background surrounding the objects and between them. No text, no lettering, no border, no frame, no room, no table, no people, no duplicate objects. Each object is centered entirely within its own half and occupies about 65% of that half's width.
```

## Pedido para AG

```text
Abrí este proyecto y leé LEEME.md. Instalá las dependencias con npm ci,
ejecutá npm run dev y revisá la versión de escritorio y la versión móvil.
El sitio se llama Santi´s Book. El diseño, la bienvenida y la explicación de
Noctámbulos ya están definidos. Conservá el sombrero sobre la S de Sean y el
servilletero pequeño apoyado en la línea de Últimos escritos. No agregues
flechas decorativas ni restaures la frase de San Martín.
El catálogo está preparado para que yo cargue el primer texto después.
Usá npm run build para generar dist y configurá el alojamiento para publicar
esa carpeta. Cuando definamos el dominio, completá url en content/sitio.json.
La presentación de Sobre Santi Buffa es provisional.
```
