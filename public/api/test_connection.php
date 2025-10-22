<?php
require_once __DIR__ . '/config.php';
// Endpoint desativado em produção.
respond(410, ['ok' => false, 'message' => 'Endpoint de teste desativado']);
