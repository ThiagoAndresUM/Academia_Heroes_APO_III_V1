# Algoritmos y Programación III · Academia de Héroes del Código · V5

Recurso educativo web gamificado para el curso **Algoritmos y Programación III**, integrado con el enfoque de **Diseño Tecnopedagógico**.

## Experiencia V5
- Navegación responsive y HUD persistente.
- Registro inicial del estudiante y selección de avatar desde la página de inicio.
- Avatares 3D procedurales con Three.js, animación, iluminación y accesorios equipables.
- Accesorios desbloqueados por progreso de XP y visibles sobre el avatar activo.
- Cuatro tipos de microjuegos por unidad: quiz, ruleta de decisiones, caja sorpresa y cartas de memoria.
- Las misiones no se habilitan hasta completar los cuatro juegos requeridos.
- Unidad II se desbloquea al completar la misión de Unidad I.
- Unidad III se desbloquea al completar la misión de Unidad II.
- Videos de YouTube incrustados y reproducibles dentro de la página.
- Audio multiformato mediante voces españolas disponibles en el navegador y efectos de interacción locales.
- Ventana emergente de autor y contactos del proyecto.
- Banner procesado para eliminar el filo blanco original.
- Progreso almacenado en `localStorage` en este navegador.

## Arquitectura
- `index.html`: inicio, registro y selección de avatar.
- `pages/dashboard.html`: HUD, mapa, inventario e insignias.
- `pages/unidad1.html`: POO.
- `pages/unidad2.html`: GUI.
- `pages/unidad3.html`: persistencia e integración.
- `js/core/app.js`: estado, progreso, XP, misiones, inventario y audio.
- `js/games/gamekit.js`: motor reutilizable de microjuegos.
- `js/visual/avatar3d.js`: avatar 3D animado y accesorios.
- `css/styles.css`: sistema visual responsive.

## Audio
La V5 evita utilizar como audio principal la narración sintética robótica anterior. Las narraciones se generan mediante `SpeechSynthesis` y seleccionan voces españolas instaladas en el sistema; la calidad depende de las voces disponibles en el navegador/equipo. Para producción institucional se recomienda sustituirlas por archivos de voz profesional grabados o TTS premium.

## Videos
Los videos de POO se reproducen mediante `iframe` de YouTube dentro de `Unidad I`.

## Persistencia
Es una implementación front-end local: cada estudiante conserva su avance en el almacenamiento local del navegador. Para una implementación institucional multiusuario se requiere backend, autenticación y base de datos.


## V5 · Correcciones de funcionalidad
- Avatar 3D con fallback CSS 3D cuando Three.js/CDN no está disponible.
- Avatares seleccionables desde la pantalla inicial y desde el registro.
- Accesorios acumulables y equipables simultáneamente; se reflejan en el avatar.
- Caja sorpresa con reintento sin recargar.
- Quiz con temporizador y reintento corregido.
- Navegación bloqueada realmente cuando una unidad no está desbloqueada.
- Validación de referencias locales y sintaxis JavaScript.

## V6 — Capa profesional de interacción
- Three.js para avatares 3D procedurales estilo guerrero de estrategia en tiempo real, con armadura, espada, escudo, capa y accesorios equipables.
- Driver.js para el paseo tutorial inicial y botón de repetición.
- GSAP para microanimaciones de entrada de tarjetas, misiones y HUD.
- GameKit modular con seis retos por unidad: quiz, ruleta, caja sorpresa, memoria, constructor de secuencia y batalla de conceptos.
- Progresión bloqueada hasta completar los seis juegos requeridos por misión.
- Chat colaborativo local sincronizado entre pestañas mediante BroadcastChannel/localStorage (para colaboración multiusuario real se requiere backend).
- Leaderboard por XP, incorporando al jugador actual.
- YouTube IFrame embeds y reproductor HTML5 local como respaldo.
- Banners recortados para eliminar filos blancos y CSS de presentación sin borde visible.

## V9 · Motor de juego funcional
- Ruta obligatoria por unidad: Cartas → Quiz → Constructor → Ruleta → Caja sorpresa → Batalla.
- Cada desafío se desbloquea al superar el anterior.
- Las recompensas se otorgan una sola vez y los accesorios nuevos se equipan automáticamente.
- Videos educativos locales en `assets/video/` con reproductor HTML5; no dependen de YouTube.
- Tres guerreros 3D diferenciados: Codex, Lógica y Proyecto.
- `Mi batalla` muestra el avatar activo y los accesorios equipados.
- Si Three.js no está disponible, existe un fallback visual 2D para evitar una pantalla vacía.
