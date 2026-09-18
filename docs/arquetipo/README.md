# Arquetipo de usuario

Ficha del arquetipo primario del proyecto, para la fase de investigación UX.

| Archivo | Qué es |
|---|---|
| [`Arquetipo-Usuario-Linea1.pdf`](Arquetipo-Usuario-Linea1.pdf) | **Entregable.** 4 páginas A4, listo para imprimir o adjuntar |
| `arquetipo.html` | Fuente editable de la ficha |

## Contenido

1. Datos demográficos y de contexto · perfil psicológico y comportamiento
2. Objetivos y necesidades (funcionales, emocionales, sociales) · dolores y barreras
3. Escenario de uso: un día típico, momentos de uso, dispositivos y frecuencia
4. Cómo el arquetipo influye en decisiones de diseño · qué decidimos no construir · cómo validarlo

## Regenerar el PDF

La ficha se escribe en HTML y se exporta con el navegador, así que se edita como
cualquier página del proyecto.

```bash
python3 -m http.server 8000
# abre http://localhost:8000/docs/arquetipo/arquetipo.html
# imprimir → Guardar como PDF → A4 → activar «Gráficos de fondo» → márgenes: ninguno
```

## Aviso metodológico

Milagros Quispe Ramos es un **personaje ficticio**. Su perfil es una hipótesis
de diseño construida a partir del contexto del proyecto, no el resultado de un
estudio de campo. La página 4 incluye el guion de entrevistas para validarlo.
