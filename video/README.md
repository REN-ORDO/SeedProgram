# Semillero · video (Remotion)

Piezas animadas para redes con el manual Semillero (crema + navy + teal).

```bash
cd video && npm install
npm run studio        # preview interactivo
npm run render        # 9:16 → out/saber-hacer.mp4
npm run render:feed   # 4:5  → out/saber-hacer-feed.mp4
npm run still         # póster PNG del frame final
```

- `src/tokens.ts` — paleta oficial y fuentes (locales en `public/fonts`).
- `src/components/` — piezas reutilizables: papel, polaroid, cinta, doodles, blobs, brush, papel rasgado.
- `src/SaberHacer.tsx` — Video 1 · SABER ≠ SABER HACER (9:16 + 4:5).
- `src/EscanerPotencial.tsx` — Video 2 · Escáner de potencial (4:5 + 9:16). Antes/después placeholder en `components/ChaosBoard.tsx`.

**Fotos:** `Polaroid` muestra un placeholder. Para usar fotos reales, ponlas en `public/photos/` y reemplaza el bloque interno por `<Img src={staticFile("photos/...")} />`.

En entornos sin Chrome propio: `--browser-executable=<ruta headless_shell> --chrome-mode=headless-shell`.
