import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign, verify } from 'hono/jwt';

type Bindings = {
    DB: D1Database;
    BUCKET: R2Bucket;
    JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/*', cors());

app.get('/', (c) => c.text('Hello Cloudflare Workers!'));

// List bugs
app.get('/api/bugs', async (c) => {
    const { results } = await c.env.DB.prepare(`
        SELECT b.*, p.name as product_name, p.icon_color as product_color, u.name as reporter_name 
        FROM bugs b
        LEFT JOIN products p ON b.product_id = p.id
        LEFT JOIN users u ON b.reporter_id = u.id
        ORDER BY b.created_at DESC
    `).all();
    return c.json(results);
});

// Get individual report detail
app.get('/api/reports/:id', async (c) => {
    const id = c.req.param('id');
    const report = await c.env.DB.prepare(`
        SELECT b.*, p.name as product_name, p.icon_color as product_color, p.image_url as product_image,
               u.name as reporter_name, u.avatar_url as reporter_avatar, u.role as reporter_role
        FROM bugs b
        LEFT JOIN products p ON b.product_id = p.id
        LEFT JOIN users u ON b.reporter_id = u.id
        WHERE b.id = ?
    `)
        .bind(id)
        .first();

    if (!report) return c.json({ error: 'Report not found' }, 404);
    return c.json(report);
});

// Get report timeline (Comments + Status Changes)
app.get('/api/reports/:id/timeline', async (c) => {
    const id = c.req.param('id');
    const { results } = await c.env.DB.prepare(`
        SELECT id, bug_id, user_id, content, NULL as old_status, NULL as new_status, 'comment' as type, created_at
        FROM comments WHERE bug_id = ?
        UNION ALL
        SELECT id, bug_id, user_id, NULL as content, old_status, new_status, 'status_change' as type, created_at
        FROM status_changes WHERE bug_id = ?
        ORDER BY created_at ASC
    `)
        .bind(id, id)
        .all();
    return c.json(results);
});

// Get report attachments
app.get('/api/reports/:id/attachments', async (c) => {
    const id = c.req.param('id');
    const { results } = await c.env.DB.prepare('SELECT * FROM attachments WHERE bug_id = ?')
        .bind(id)
        .all();
    return c.json(results);
});

// List products
app.get('/api/products', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    return c.json(results);
});

// Create product
app.post('/api/products', async (c) => {
    const { name, description, owner_id, icon_color } = await c.req.json();
    const { success } = await c.env.DB.prepare(
        'INSERT INTO products (name, description, owner_id, icon_color) VALUES (?, ?, ?, ?)'
    )
        .bind(name, description, owner_id, icon_color)
        .run();
    return c.json({ success });
});

// List users
app.get('/api/users', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
    return c.json(results);
});

// Create user
app.post('/api/users', async (c) => {
    const { name, email, role, avatar_url } = await c.req.json();
    const { success } = await c.env.DB.prepare(
        'INSERT INTO users (name, email, role, avatar_url) VALUES (?, ?, ?, ?)'
    )
        .bind(name, email, role, avatar_url)
        .run();
    return c.json({ success });
});

// Create bug
app.post('/api/bugs', async (c) => {
    const data = await c.req.json();
    const { success } = await c.env.DB.prepare(`
        INSERT INTO bugs (title, description, issue_type, severity, status, version, device, platform, steps, actual_result, expected_result, tags, product_id, reporter_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
        .bind(
            data.title, data.description, data.issue_type, data.severity, data.status || 'Open',
            data.version, data.device, data.platform, data.steps, data.actual_result,
            data.expected_result, JSON.stringify(data.tags || []), data.product_id, data.reporter_id
        )
        .run();

    return c.json({ success });
});

// Upload file to R2 with metadata and constraints
app.post('/api/reports/:id/upload', async (c) => {
    const bug_id = c.req.param('id');
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) return c.json({ error: 'No file provided' }, 400);

    // Constraints check
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) return c.json({ error: 'File too large (> 10MB)' }, 400);

    const forbiddenTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (forbiddenTypes.includes(file.type) || file.type.startsWith('video/')) {
        return c.json({ error: 'Video files are not allowed' }, 400);
    }

    const r2_key = `attachments/${bug_id}/${Date.now()}_${file.name}`;
    const body = await file.arrayBuffer();

    // Upload to R2
    await c.env.BUCKET.put(r2_key, body, {
        httpMetadata: { contentType: file.type }
    });

    // Save metadata to DB
    const { success } = await c.env.DB.prepare(
        'INSERT INTO attachments (bug_id, file_name, file_size, file_type, r2_key) VALUES (?, ?, ?, ?, ?)'
    )
        .bind(bug_id, file.name, file.size, file.type, r2_key)
        .run();

    return c.json({ success, key: r2_key });
});

// Serve files from R2
app.get('/api/files/*', async (c) => {
    const key = c.req.path.replace('/api/files/', '');
    const object = await c.env.BUCKET.get(key);
    if (!object) return c.notFound();

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    return new Response(object.body, { headers });
});

// --- AUTH HELPER FUNCTIONS ---
async function hashPassword(password: string, salt: string) {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const saltData = encoder.encode(salt);

    const key = await crypto.subtle.importKey(
        'raw',
        passwordData,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: saltData,
            iterations: 100000,
            hash: 'SHA-256',
        },
        key,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    const exportedKey = await crypto.subtle.exportKey('raw', derivedKey);
    return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
}

// --- AUTH ENDPOINTS ---

app.post('/api/auth/register', async (c) => {
    const { name, email, password } = await c.req.json();
    if (!name || !email || !password) return c.json({ error: 'Missing fields' }, 400);

    const salt = crypto.randomUUID();
    const password_hash = await hashPassword(password, salt);

    try {
        const { success } = await c.env.DB.prepare(
            'INSERT INTO users (name, email, password_hash, salt) VALUES (?, ?, ?, ?)'
        )
            .bind(name, email, password_hash, salt)
            .run();

        return c.json({ success });
    } catch (e: any) {
        if (e.message.includes('UNIQUE constraint failed')) {
            return c.json({ error: 'Email already exists' }, 400);
        }
        return c.json({ error: e.message }, 500);
    }
});

app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json();
    const user: any = await c.env.DB.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1')
        .bind(email)
        .first();

    if (!user || !user.password_hash) {
        return c.json({ error: 'Invalid credentials' }, 401);
    }

    const hash = await hashPassword(password, user.salt);
    if (hash !== user.password_hash) {
        return c.json({ error: 'Invalid credentials' }, 401);
    }

    const payload = {
        id: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
    };

    const token = await sign(payload, c.env.JWT_SECRET || 'dev-secret', 'HS256');
    return c.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url } });
});

app.get('/api/auth/me', async (c) => {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return c.json({ error: 'Unauthorized' }, 401);

    try {
        const payload = await verify(token, c.env.JWT_SECRET || 'dev-secret', 'HS256');
        const user: any = await c.env.DB.prepare('SELECT id, name, email, role, avatar_url FROM users WHERE id = ?')
            .bind(payload.id)
            .first();
        return c.json(user);
    } catch (e) {
        return c.json({ error: 'Invalid token' }, 401);
    }
});

app.post('/api/user/profile', async (c) => {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return c.json({ error: 'Unauthorized' }, 401);

    try {
        const payload: any = await verify(token, c.env.JWT_SECRET || 'dev-secret', 'HS256');
        const { name, avatar_url } = await c.req.json();

        await c.env.DB.prepare('UPDATE users SET name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url) WHERE id = ?')
            .bind(name ?? null, avatar_url ?? null, payload.id)
            .run();

        return c.json({ success: true });
    } catch (e: any) {
        if (e.name === 'JwtTokenInvalid' || e.name === 'JwtTokenExpired' || e.name === 'JwtTokenNotBefore') {
            return c.json({ error: 'Unauthorized' }, 401);
        }
        return c.json({ error: e.message || 'Failed to update profile' }, 500);
    }
});

app.post('/api/user/avatar', async (c) => {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return c.json({ error: 'Unauthorized' }, 401);

    try {
        const payload: any = await verify(token, c.env.JWT_SECRET || 'dev-secret', 'HS256');
        const formData = await c.req.formData();
        const file = formData.get('file') as File;

        if (!file) return c.json({ error: 'No file' }, 400);

        const r2_key = `avatars/${payload.id}/${Date.now()}_${file.name}`;
        await c.env.BUCKET.put(r2_key, await file.arrayBuffer(), {
            httpMetadata: { contentType: file.type }
        });

        const avatar_url = `/api/files/${r2_key}`;
        await c.env.DB.prepare('UPDATE users SET avatar_url = ? WHERE id = ?')
            .bind(avatar_url, payload.id)
            .run();

        return c.json({ success: true, avatar_url });
    } catch (e: any) {
        if (e.name === 'JwtTokenInvalid' || e.name === 'JwtTokenExpired' || e.name === 'JwtTokenNotBefore') {
            return c.json({ error: 'Unauthorized' }, 401);
        }
        return c.json({ error: e.message || 'Failed to upload avatar' }, 500);
    }
});

export default app;
