<?php
// PHP Auth Service for DesignX Studio Pro
// Place in auth-service/ and run with XAMPP / php -S localhost:8000

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// DB config — edit these
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'designx_db');
define('JWT_SECRET', 'designx_royal_secret_2026');

function db(): PDO {
    static $pdo;
    if (!$pdo) {
        $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4",
            DB_USER, DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
        );
    }
    return $pdo;
}

function json_out(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function make_jwt(array $payload): string {
    $header  = base64url(json_encode(['alg'=>'HS256','typ'=>'JWT']));
    $payload['exp'] = time() + 86400;
    $body    = base64url(json_encode($payload));
    $sig     = base64url(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    return "$header.$body.$sig";
}

function base64url(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function verify_jwt(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $body, $sig] = $parts;
    $expected = base64url(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;
    $payload = json_decode(base64_decode(str_pad(strtr($body,'-_','+/'),strlen($body)%4,'=',STR_PAD_RIGHT)),true);
    if ($payload['exp'] < time()) return null;
    return $payload;
}

$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path   = rtrim($path, '/');
$method = $_SERVER['REQUEST_METHOD'];

// ── ROUTES ────────────────────────────────────────────────────────

// POST /register
if ($path === '/register' && $method === 'POST') {
    $name  = trim($body['name'] ?? '');
    $email = strtolower(trim($body['email'] ?? ''));
    $pass  = $body['password'] ?? '';

    if (!$name || !$email || strlen($pass) < 6)
        json_out(['error' => 'Name, valid email and min 6-char password required'], 400);

    if (!filter_var($email, FILTER_VALIDATE_EMAIL))
        json_out(['error' => 'Invalid email format'], 400);

    try {
        $stmt = db()->prepare('SELECT id FROM users WHERE email=?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) json_out(['error' => 'Email already registered'], 409);

        $hash = password_hash($pass, PASSWORD_BCRYPT, ['cost' => 12]);
        $ins  = db()->prepare('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)');
        $ins->execute([$name, $email, $hash]);
        $userId = db()->lastInsertId();

        // Seed AI credits
        db()->prepare('INSERT INTO ai_credits (user_id,balance) VALUES (?,5)')->execute([$userId]);

        $token = make_jwt(['id'=>$userId,'email'=>$email,'plan'=>'FREE']);
        json_out(['token'=>$token,'user'=>['id'=>$userId,'name'=>$name,'email'=>$email,'plan'=>'FREE']], 201);
    } catch (Exception $e) {
        json_out(['error' => 'Registration failed: '.$e->getMessage()], 500);
    }
}

// POST /login
if ($path === '/login' && $method === 'POST') {
    $email = strtolower(trim($body['email'] ?? ''));
    $pass  = $body['password'] ?? '';

    if (!$email || !$pass) json_out(['error' => 'Email and password required'], 400);

    // Demo bypass
    if ($email === 'demo@designx.pro' && $pass === 'demo123') {
        $token = make_jwt(['id'=>0,'email'=>$email,'plan'=>'FREE']);
        json_out(['token'=>$token,'user'=>['id'=>0,'name'=>'Demo User','email'=>$email,'plan'=>'FREE']]);
    }

    try {
        $stmt = db()->prepare('SELECT id,name,email,password_hash,subscription_type FROM users WHERE email=?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($pass, $user['password_hash']))
            json_out(['error' => 'Invalid credentials'], 401);

        $token = make_jwt(['id'=>$user['id'],'email'=>$user['email'],'plan'=>$user['subscription_type']]);
        unset($user['password_hash']);
        $user['plan'] = $user['subscription_type'];
        json_out(['token'=>$token,'user'=>$user]);
    } catch (Exception $e) {
        json_out(['error' => 'Login failed'], 500);
    }
}

// GET /me
if ($path === '/me' && $method === 'GET') {
    $auth  = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = str_replace('Bearer ', '', $auth);
    $payload = verify_jwt($token);
    if (!$payload) json_out(['error' => 'Unauthorized'], 401);

    try {
        $stmt = db()->prepare('SELECT id,name,email,subscription_type AS plan,created_at FROM users WHERE id=?');
        $stmt->execute([$payload['id']]);
        $user = $stmt->fetch();
        if (!$user) json_out(['error' => 'User not found'], 404);
        json_out(['user' => $user]);
    } catch (Exception $e) {
        json_out(['error' => 'Error'], 500);
    }
}

json_out(['error' => 'Not found', 'path' => $path], 404);
