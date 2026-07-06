# 🎓 Proyecto Final de Máster · Frontend

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-43.2%25-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![HTML](https://img.shields.io/badge/HTML-35.6%25-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-21.2%25-1572B6?style=for-the-badge&logo=css3&logoColor=white)

**Repositorio:** [`FrancoRivadeneyraVigo/proyecto-final-frontend`](https://github.com/FrancoRivadeneyraVigo/proyecto-final-frontend)

</div>

---

## 📌 Descripción

Este repositorio contiene el **frontend** del Proyecto Final de Máster.
Su objetivo es ofrecer una interfaz moderna, clara y usable para consumir los servicios del backend, cubriendo flujos clave como autenticación, gestión de usuario y operaciones principales de la aplicación.

Este frontend está diseñado para integrarse con el backend oficial del proyecto:

➡️ **Backend:** [`xenixui/proyecto-final-backend`](https://github.com/xenixui/proyecto-final-backend)

---

## 🧱 Arquitectura (alto nivel)

- **Cliente web (SPA)** desarrollado con tecnologías frontend modernas.
- **Consumo de API REST** expuesta por el backend.
- **Gestión de autenticación** mediante token (flujo login/logout y sesión).
- **Separación por capas de UI**, lógica de presentación y servicios de acceso a datos.

---

## 🛠️ Stack tecnológico

Según la composición del repositorio:

- **TypeScript (43.2%)**
- **HTML (35.6%)**
- **CSS (21.2%)**

---

## 🚀 Puesta en marcha

### 1) Clonar el repositorio

```bash
git clone https://github.com/FrancoRivadeneyraVigo/proyecto-final-frontend.git
cd proyecto-final-frontend
```

### 2) Instalar dependencias

```bash
npm install
```

### 3) Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto y define, como mínimo, la URL del backend.

Ejemplo:

```env
VITE_API_URL=http://localhost:3000
```

> Si tu proyecto usa otra convención (`REACT_APP_...`, `NEXT_PUBLIC_...`, etc.), ajusta el nombre de variable según la configuración real del código.

### 4) Ejecutar en desarrollo

```bash
npm run dev
```

### 5) Generar build de producción

```bash
npm run build
```

### 6) Previsualizar build

```bash
npm run preview
```

---

## 🔐 Integración con backend

Para que el frontend funcione correctamente, asegúrate de tener el backend levantado.

1. Inicia `xenixui/proyecto-final-backend`.
2. Verifica que la URL de API configurada en el frontend coincide con el `PORT` y host del backend.
3. Comprueba CORS y variables de entorno en ambos proyectos.

---

## ✅ Buenas prácticas recomendadas

- No subir archivos `.env` al repositorio.
- Mantener un `.env.example` con variables mínimas.
- Validar formularios en cliente y servidor.
- Homogeneizar estilos y componentes reutilizables.
- Documentar cambios relevantes en cada entrega.

---

## 📚 Contexto académico

Este proyecto forma parte del **Trabajo/Proyecto Final de Máster** y refleja la aplicación práctica de conocimientos en:

- Arquitectura de aplicaciones web
- Desarrollo frontend tipado
- Integración cliente-servidor
- Seguridad básica en flujos de autenticación
- Buenas prácticas de despliegue y mantenimiento

---

## 👤 Autoría

Desarrollado por el grupo de trabajo del Proyecto Final de Máster.

---

