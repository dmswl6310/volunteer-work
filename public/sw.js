const CACHE_NAME = 'together-v1';

// 정적 자산만 제한적으로 캐싱
const PRECACHE_URLS = [];

function shouldHandleRequest(requestUrl, request) {
  if (request.method !== 'GET') return false;
  if (requestUrl.origin !== self.location.origin) return false;
  if (requestUrl.pathname.startsWith('/api/')) return false;
  if (requestUrl.pathname.startsWith('/auth/')) return false;
  if (requestUrl.pathname.startsWith('/admin')) return false;
  if (request.mode === 'navigate') return false;

  return ['style', 'script', 'image', 'font'].includes(request.destination);
}

// Service Worker 설치 시 기본 리소스 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// 이전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 네트워크 우선, 실패 시 캐시 (Network First)
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 인증/페이지 HTML은 건드리지 않고 정적 자산만 캐싱
  if (!shouldHandleRequest(requestUrl, event.request)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status >= 400) {
          return response;
        }

        // 성공 시 캐시에 저장
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(async () => {
        // 오프라인 시 캐시에서 서빙
        const cachedResponse = await caches.match(event.request);

        if (cachedResponse) {
          return cachedResponse;
        }

        return new Response('Offline', {
          status: 503,
          statusText: 'Offline',
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        });
      })
  );
});
