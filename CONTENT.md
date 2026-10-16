# Contenido del portfolio — Valentín Lanús

## Posicionamiento
Freelance + búsqueda de empleo. Tono seguro y técnico, enfocado en problemas resueltos
y decisiones de arquitectura. NO usar "Senior" ni inventar años de experiencia.

## Hero
Valentín Lanús
Full Stack Developer · desarrollo asistido por IA
Construyo productos web y mobile de punta a punta, del backend a la interfaz,
con la IA como herramienta y no como piloto automático.

## Sobre mí
Soy desarrollador full stack y mobile. Diseño y construyo aplicaciones completas: APIs, bases de datos, autenticación, interfaces web y apps nativas para Android.

Uso Claude Code en mi flujo de trabajo para acelerar lo repetitivo, como boilerplate y primeras versiones. La arquitectura, la lógica de negocio y las decisiones técnicas las defino yo, y reviso todo el código que entra al proyecto.

Me enfoco en código mantenible, arquitecturas claras y software que funcione en producción, no solo en la demo.

Trabajo de forma remota con clientes y equipos; abierto a freelance y full-time.

## Proyectos (en este orden)

### 1. Lotecito — En producción
PWA offline-first para una empresa de servicios agrícolas. Reemplaza el registro en papel
y WhatsApp: el sembrador carga cada lote desde el celular sin señal y el dueño lo revisa,
corrige y exporta a Excel desde la oficina.
- Problema: el dato nace en el campo sin cobertura y se usa en la oficina para liquidar.
  Perder o duplicar una carga = hectáreas mal cobradas.
- Decisiones clave: offline-first desde el día uno (no un "modo offline" agregado);
  las cargas se guardan sin depender de red ni de sesión y se sincronizan solas;
  envíos idempotentes para que un corte de señal no duplique hectáreas;
  auditoría de cada corrección y borrado; exportación a Excel lista para liquidar.
- UX pensada para usuarios no técnicos, al sol y con poco tiempo.
- Stack: React · Vite · PWA · Supabase · Vercel
- Estado: en producción, 24 migraciones de base de datos.

### 2. Focusly — Planificador de estudio inteligente
Web app que genera planes de estudio personalizados según materias, fechas de examen
y disponibilidad.
- Algoritmo propio de generación de planes, auth con JWT, fechas a prueba de zonas horarias.
- Stack: Vite · Node · PostgreSQL · JWT
- Desarrollo full-stack en equipo de 4.

### 3. PhotoFinder — App Android nativa
Buscar, explorar y guardar fotos en alta calidad consumiendo la API de Unsplash.
- Arquitectura MVVM con repositorios, caché local con Room, login con Google.
- Stack: Kotlin · Jetpack Compose · MVVM · Retrofit · Room · Firebase Auth

## Pendiente (dejar placeholders)
Capturas, links a repos/demos, contactos (mail, WhatsApp, GitHub ValentinLanus (https://github.com/ValentinLanus), LinkedIn).

## Referencias visuales
- https://www.mariavasilyeva.com/ → tomar el uso de las animaciones de scroll
- https://brittanychiang.com/ → estructura, claridad, dark minimal
- https://tamalsen.dev/ → estética dev oscura
Estilo: oscuro minimalista. Inspirarse, NO copiar layouts ni assets.
