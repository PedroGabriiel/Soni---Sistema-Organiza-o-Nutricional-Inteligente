<?php
require_once __DIR__ . '/config.php';
// Endpoint de debug desativado.
respond(410, ['ok' => false, 'message' => 'Endpoint de debug desativado']);
