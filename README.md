# Visor de Inspecciones de Bienes Inmuebles

Visor web estático para publicar en GitHub Pages.

## Estructura

- `index.html`: estructura del visor.
- `style.css`: estilos visuales.
- `app.js`: lógica del mapa, filtros, indicadores y tablas.
- `data/inspecciones.json`: datos principales de inmuebles.
- `data/elementos.json`: hallazgos físicos por elemento.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube todos estos archivos conservando la carpeta `data`.
3. En el repositorio, entra a **Settings > Pages**.
4. En **Build and deployment**, selecciona `Deploy from a branch`.
5. Elige la rama `main` y la carpeta `/root`.
6. Guarda los cambios y espera a que GitHub genere el enlace.

## Nota

Para probarlo localmente, abre la carpeta con un servidor local. Por ejemplo:

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000`.


## Ajuste v23
Los campos de “Dato encontrado susceptible de análisis” se consolidan únicamente en estas categorías: Georreferenciación, Nomenclatura, Nombre, Responsable, En el inventario, Ocupación y Análisis especial (englobe, desenglobe).
