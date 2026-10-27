# Origen

Copia sin cambios de `next-steps` de [anthropics/claude-plugins-community](https://github.com/anthropics/claude-plugins-community/tree/06ec7b6/next-steps),
commit `06ec7b6`, autor Thariq Shihipar, licencia MIT (declarada en su `plugin.json`; el repositorio de origen es Apache 2.0).

Se incluye para que los dos mods del estándar de TI de Conaltura se instalen desde un solo marketplace
(`claude-kit-conaltura`). Se revisó antes de incluirlo (ADR-0026 de la wiki de TI): no toca herramientas; al terminar
cada turno hace una consulta corta al modelo con `$.model.fork` y sugiere prompts que la persona confirma.
Para actualizarlo: revisar el commit nuevo con la misma regla y copiar la carpeta.
