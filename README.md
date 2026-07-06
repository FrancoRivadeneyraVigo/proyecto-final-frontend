# ATiempo · Frontend

**Proyecto Fin de Máster (UNIR) — Full Stack Developer**
Plataforma de compraventa de artículos de segunda mano (relojes), con roles de **usuario**, **moderador** y **administrador**, inspirada en Vinted/Wallapop.

Este repositorio contiene el **cliente web** del proyecto, construido con **Angular** (componentes standalone) y **Bootstrap**. Consume la [API REST del backend](https://github.com/xenixui/proyecto-final-backend), construida en Node.js + Express y MySQL.

---

## ¿Qué resuelve este frontend?

Implementa la interfaz para los tres perfiles de la aplicación, cubriendo los requisitos mínimos del proyecto:

- **Autenticación**: formularios de registro e inicio de sesión con validación, redirigiendo a la vista correspondiente según el rol del usuario autenticado (usuario, moderador o administrador).
- **Vista de usuario**: página principal con el listado de artículos publicados y acceso directo a la creación de nuevos artículos, buscador general con filtros por categoría, marca, modelo, estilo, precio y estado, gestión (alta, edición, baja) de artículos propios y marcado de artículo como vendido.
- **Ciclo de vida del artículo**: representación en la interfaz de los estados `Borrador`, `Publicado`, `En revisión`, `Retirado` y `Vendido`.
- **Perfil público**: artículos publicados y valoraciones recibidas de cada usuario.
- **Mensajería interna**: chat entre comprador y vendedor asociado a un artículo, con listado de conversaciones y recepción de notificaciones en tiempo real vía Server-Sent Events (SSE).
- **Reportes**: reporte de artículos y de usuarios desde la interfaz, que pasan a estado "En revisión".
- **Vista de moderador**: panel de reportes pendientes con acceso al detalle de cada uno, acciones para activar o retirar el artículo (notificando al usuario afectado) e historial de moderación.
- **Vista de administrador**: gestión de usuarios y roles, gestión del catálogo (categorías, marcas, modelos, estilos) y panel de estadísticas globales de la plataforma. Incluye además todas las acciones disponibles para el perfil de moderador.

---

## Stack técnico

- **Angular 21** (standalone components, Angular CLI/build)
- **Bootstrap 5** + **Bootstrap Icons** para la UI
- **ag-charts-angular** para las gráficas del panel de estadísticas
- **ngx-sonner** para notificaciones (toasts)


## Integración con el backend

Este frontend requiere que la [API del backend](https://github.com/xenixui/proyecto-final-backend) esté en ejecución y accesible desde la URL configurada.
