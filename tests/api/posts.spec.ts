import { test, expect, APIRequestContext } from '@playwright/test';

/**
 * API Test Suite: JSONPlaceholder REST API
 * https://jsonplaceholder.typicode.com
 *
 * Demonstrates:
 *  - REST API testing without a browser (lightweight, fast)
 *  - Validating response status codes, headers, and body schema
 *  - CRUD operation coverage (GET, POST, PUT, DELETE)
 *  - Response time assertions
 *  - Negative testing (404s, bad payloads)
 *  - Shared request context setup in beforeAll
 *
 * In a real engagement this suite would target your application's
 * own API — this public API is used here so the portfolio runs
 * without any backend setup.
 */

const BASE_URL = 'https://jsonplaceholder.typicode.com';

// Type definitions — SDETs should model response shapes explicitly
interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

test.describe('API Tests – Posts Resource', () => {
  let request: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    request = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  });

  test.afterAll(async () => {
    await request.dispose();
  });

  // ─── GET ─────────────────────────────────────────────────────────────────────

  test('GET /posts – should return 100 posts', async () => {
    const start = Date.now();
    const response = await request.get('/posts');
    const elapsed = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const posts: Post[] = await response.json();
    expect(posts).toHaveLength(100);

    // Response time assertion — important in regulated/financial environments
    expect(elapsed).toBeLessThan(3000);
  });

  test('GET /posts/:id – should return a specific post with correct schema', async () => {
    const response = await request.get('/posts/1');
    expect(response.status()).toBe(200);

    const post: Post = await response.json();

    // Schema validation — every field present and the right type
    expect(typeof post.userId).toBe('number');
    expect(typeof post.id).toBe('number');
    expect(typeof post.title).toBe('string');
    expect(typeof post.body).toBe('string');
    expect(post.id).toBe(1);
    expect(post.title.length).toBeGreaterThan(0);
  });

  test('GET /posts/:id – should return 404 for non-existent post', async () => {
    const response = await request.get('/posts/99999');
    expect(response.status()).toBe(404);
  });

  test('GET /posts?userId=1 – should filter posts by userId', async () => {
    const response = await request.get('/posts?userId=1');
    expect(response.status()).toBe(200);

    const posts: Post[] = await response.json();
    expect(posts.length).toBeGreaterThan(0);

    // All returned posts should belong to userId=1
    posts.forEach(post => {
      expect(post.userId).toBe(1);
    });
  });

  // ─── POST ────────────────────────────────────────────────────────────────────

  test('POST /posts – should create a new post and return 201', async () => {
    const newPost = {
      title: 'Automated Test Post',
      body: 'Created by SDET portfolio test suite.',
      userId: 1,
    };

    const response = await request.post('/posts', { data: newPost });
    expect(response.status()).toBe(201);

    const created: Post = await response.json();
    expect(created.title).toBe(newPost.title);
    expect(created.body).toBe(newPost.body);
    expect(created.userId).toBe(newPost.userId);
    expect(created.id).toBeDefined(); // server assigned an ID
  });

  test('POST /posts – should handle missing required fields gracefully', async () => {
    // JSONPlaceholder is permissive, but in a real app you'd assert 400/422 here
    const response = await request.post('/posts', { data: {} });
    // Assert we at least get a response (not a 500 server crash)
    expect([200, 201, 400, 422]).toContain(response.status());
  });

  // ─── PUT ─────────────────────────────────────────────────────────────────────

  test('PUT /posts/:id – should update an existing post', async () => {
    const updated = {
      id: 1,
      title: 'Updated Title',
      body: 'Updated body content.',
      userId: 1,
    };

    const response = await request.put('/posts/1', { data: updated });
    expect(response.status()).toBe(200);

    const result: Post = await response.json();
    expect(result.title).toBe(updated.title);
    expect(result.body).toBe(updated.body);
  });

  // ─── DELETE ──────────────────────────────────────────────────────────────────

  test('DELETE /posts/:id – should return 200 on successful delete', async () => {
    const response = await request.delete('/posts/1');
    expect(response.status()).toBe(200);
  });
});

// ─── RELATIONAL DATA VALIDATION ──────────────────────────────────────────────
// This section mimics the kind of data integrity checks a financial systems
// SDET would run — verifying relationships between entities hold up.

test.describe('API Tests – Data Integrity (Comments → Posts)', () => {
  let request: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    request = await playwright.request.newContext({ baseURL: BASE_URL });
  });

  test.afterAll(async () => await request.dispose());

  test('every comment should reference a valid postId', async () => {
    const [postsRes, commentsRes] = await Promise.all([
      request.get('/posts'),
      request.get('/comments'),
    ]);

    const posts: Post[] = await postsRes.json();
    const comments: Comment[] = await commentsRes.json();

    const postIds = new Set(posts.map(p => p.id));

    // Every comment must point to a real post — orphaned references = data bug
    const orphanedComments = comments.filter(c => !postIds.has(c.postId));
    expect(orphanedComments).toHaveLength(0);
  });

  test('all comment email fields should be valid email format', async () => {
    const response = await request.get('/comments');
    const comments: Comment[] = await response.json();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = comments.filter(c => !emailRegex.test(c.email));
    expect(invalidEmails).toHaveLength(0);
  });
});
