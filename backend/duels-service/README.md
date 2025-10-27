# duels-service

## Environment variables

- `DUELS_FAIL_ON_EMPTY_ROUND` (default: `false`): cuando está en `true` el orquestador cierra la sala con error si una ronda termina sin ninguna respuesta registrada. Con el valor por defecto simplemente reintenta la ronda una vez.