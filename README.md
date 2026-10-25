# SprintBase

Prototipo académico de gestión SCRUM para el proyecto TI-162. Es una maqueta estática de frontend: no tiene servidor, autenticación real ni base de datos, y no usa almacenamiento persistente. Las interacciones se representan en memoria mientras la página está abierta; al recargar, todo vuelve al estado inicial.

## Páginas

- `index.html`: resumen general.
- `proyectos.html`: gestión visual de proyectos.
- `backlog.html`: historias, planning poker y ficha con checklist simulados.
- `sprints.html`, `tareas.html` y `kanban.html`: planificación y seguimiento visual de Sprints.
- `seguimiento.html`: indicadores y burndown ilustrativos.
- `impedimentos.html`: reporte visual de impedimentos derivados de tareas.
- `juntas.html`: reuniones Scrum y asistencia de ejemplo.
- `retrospectiva.html`: retrospectiva de muestra.
- `administracion.html`: equipo y roles Scrum.
- `login.html`: vista de autenticación simulada.

## Cómo probar

Abre `index.html` directamente en el navegador y navega por el menú lateral. El selector «Ver como» ilustra la visibilidad de controles según Product Owner, Scrum Master, equipo o stakeholder; vuelve a «Vista neutral» al recargar. En el Product Backlog, prueba las cartas de estimación y la ficha de historia. También puedes probar los selectores de Sprint, los avisos y las pestañas de gráficos.

Ninguna acción guarda cambios. Los botones simulados solo muestran avisos o abren elementos visuales temporales; no se deben añadir `localStorage`, `sessionStorage`, cookies, IndexedDB ni llamadas de red para persistir o cargar los datos de la maqueta.

Una versión funcional requeriría, entre otros elementos, un backend, autenticación y autorización reales, una base de datos y validación del lado del servidor.
