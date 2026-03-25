import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.sub || !profile?.email) return false;

      // 查找或建立使用者
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.googleId, profile.sub))
        .limit(1);

      if (existing.length === 0) {
        // 用 email 前綴當預設 slug，若重複則加上隨機後綴
        const baseSlug = profile.email.split("@")[0].replace(/[^a-zA-Z0-9-_]/g, "");
        let slug = baseSlug;
        const slugCheck = await db.select().from(users).where(eq(users.slug, slug)).limit(1);
        if (slugCheck.length > 0) {
          slug = `${baseSlug}-${Date.now().toString(36)}`;
        }

        await db.insert(users).values({
          googleId: profile.sub,
          email: profile.email,
          name: (profile.name as string) ?? profile.email,
          avatarUrl: (profile.picture as string) ?? null,
          slug,
        });
      } else {
        // 更新名稱和頭像
        await db
          .update(users)
          .set({
            name: (profile.name as string) ?? existing[0].name,
            avatarUrl: (profile.picture as string) ?? existing[0].avatarUrl,
          })
          .where(eq(users.googleId, profile.sub));
      }

      return true;
    },

    async jwt({ token, profile }) {
      if (profile?.sub) {
        // 登入時把 DB user id 存入 token
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.googleId, profile.sub))
          .limit(1);
        if (user) {
          token.userId = user.id;
          token.slug = user.slug;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).slug = token.slug;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
});

/** 取得目前登入使用者的 DB user ID，未登入回傳 null */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return (session?.user?.id as string) ?? null;
}

/** 取得目前登入使用者的 slug，未登入回傳 null */
export async function getCurrentUserSlug(): Promise<string | null> {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((session?.user as any)?.slug as string) ?? null;
}
