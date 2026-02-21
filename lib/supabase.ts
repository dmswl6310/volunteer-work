import { createBrowserClient, createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 브라우저(클라이언트 컴포넌트)용
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// 서버(Server Actions, Server Components)용
// next/headers를 동적으로 import하여 클라이언트 번들에서 제외
export async function createServerSupabaseClient() {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // Server Component에서 호출된 경우 무시
                }
            },
        },
    });
}
