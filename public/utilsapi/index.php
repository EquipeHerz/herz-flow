<?php

function applyCors() {
  if (!isset($_SERVER['HTTP_ORIGIN'])) return;
  header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
  header('Vary: Origin');
  header('Access-Control-Allow-Credentials: true');
  header('Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

function getForwardHeaders() {
  $out = [];
  $allow = ['content-type', 'authorization', 'cookie', 'accept'];
  foreach ($_SERVER as $key => $value) {
    if (strpos($key, 'HTTP_') !== 0) continue;
    $h = strtolower(str_replace('_', '-', substr($key, 5)));
    if (!in_array($h, $allow, true)) continue;
    $out[] = $h . ': ' . $value;
  }
  return $out;
}

applyCors();
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
  http_response_code(204);
  exit;
}

$backendBase = getenv('SISTEMA_UTILS_BACK_URL');
if (!$backendBase) $backendBase = 'http://72.60.142.80:9589';
$backendBase = rtrim($backendBase, '/');

$path = isset($_GET['path']) ? $_GET['path'] : '';
$qs = isset($_SERVER['QUERY_STRING']) ? $_SERVER['QUERY_STRING'] : '';
$targetUrl = $backendBase . '/' . ltrim($path, '/');
if ($qs) $targetUrl .= '?' . $qs;

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$body = file_get_contents('php://input');

$responseHeaders = [];
$ch = curl_init($targetUrl);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 25);
curl_setopt($ch, CURLOPT_HTTPHEADER, getForwardHeaders());
curl_setopt($ch, CURLOPT_HEADERFUNCTION, function ($curl, $headerLine) use (&$responseHeaders) {
  $len = strlen($headerLine);
  $headerLine = trim($headerLine);
  if ($headerLine === '' || strpos($headerLine, ':') === false) return $len;
  [$name, $value] = array_map('trim', explode(':', $headerLine, 2));
  $nameLower = strtolower($name);
  if (!isset($responseHeaders[$nameLower])) $responseHeaders[$nameLower] = [];
  $responseHeaders[$nameLower][] = $value;
  return $len;
});

if ($method !== 'GET' && $method !== 'HEAD') {
  curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

$respBody = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($respBody === false) {
  http_response_code(502);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode([
    'message' => 'Falha ao encaminhar requisição para o backend utils.',
    'error' => curl_error($ch),
  ]);
  curl_close($ch);
  exit;
}
curl_close($ch);

http_response_code($status ?: 200);
if (isset($responseHeaders['content-type'][0])) {
  header('Content-Type: ' . $responseHeaders['content-type'][0]);
}
if (isset($responseHeaders['set-cookie'])) {
  foreach ($responseHeaders['set-cookie'] as $cookie) {
    header('Set-Cookie: ' . $cookie, false);
  }
}
echo $respBody;

