# Crucigrama SBOK · Cap. 11 (Revisión y Retrospectiva)

Juego para la actividad práctica de la exposición: crucigrama de 14 palabras con 3 vidas, 10 minutos y ranking en vivo.

- `public/index.html`: el juego (lo abren los compañeros en el celular).
- `public/ranking.html`: la pantalla para proyectar (QR para entrar, podio en vivo, tabla con **todos** los jugadores, promedio del salón y botón **Revelar ganador**). Los jugadores también pueden abrirla desde el celular: ahí ven la tabla completa y su propia fila resaltada.
- `netlify/functions/ranking.mjs`: guarda los puntajes (Netlify Blobs).

## Subirlo a Netlify

> **No usen "arrastrar y soltar" (Netlify Drop).** El juego cargaría, pero el ranking no, porque Drop no publica funciones.

### Opción A: con GitHub (recomendada)
1. Creen un repositorio en GitHub y suban **todo el contenido de esta carpeta**.
2. En [app.netlify.com](https://app.netlify.com): **Add new project → Import an existing project → GitHub** y elijan el repositorio.
3. Dejen los valores que propone Netlify (los toma de `netlify.toml`) y pulsen **Deploy**.

### Opción B: desde la terminal (Node 18 o superior)
```bash
npm install
npx netlify-cli login
npx netlify-cli deploy --prod
```
Cuando pregunte, elijan crear un proyecto nuevo y usen `public` como carpeta de publicación.

## PIN para reiniciar el ranking
Por defecto es `sbok11`. Para cambiarlo, en Netlify vayan a la configuración del proyecto → **Environment variables**, creen `ADMIN_PIN` con su clave y vuelvan a desplegar.

## Cómo usarlo en clase
1. **Antes de la clase:** abran el juego, jueguen una partida de prueba y luego, en `ranking.html` → *Opciones de los expositores*, reinicien el ranking con el PIN.
2. Proyecten `https://SU-SITIO.netlify.app/ranking.html`. Los compañeros escanean el QR, escriben su nombre o el de su equipo y juegan.
3. Cuando se acabe el tiempo, pulsen **🏆 Revelar ganador**.

## Reglas y puntaje
- Cada palabra correcta vale 100 puntos; cada pista le resta 25 a esa palabra (mínimo 25).
- Una respuesta incorrecta quita una vida (si la longitud no coincide, solo avisa y no quita vida).
- Si completan todo: +50 por vida restante + 1 punto por cada 2 segundos sobrantes.
- Para el ranking solo cuenta el **primer intento** de cada celular; las siguientes partidas son de práctica.
- Si recargan la página, la partida sigue donde iba (el tiempo no se reinicia).
- Desempate: gana quien terminó en menos tiempo.

Para cambiar el tiempo o las vidas, editen `CFG` al final de `public/index.html` (`seconds`, `lives`). Si cambian las palabras, actualicen también el total (14) en `ranking.html` y en `netlify/functions/ranking.mjs`.
