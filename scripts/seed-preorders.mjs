import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const sql = neon(process.env.DATABASE_URL);

async function main() {
  // Create table
  await sql`
    CREATE TABLE IF NOT EXISTS "preorder_figures" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
      "name" varchar(255) NOT NULL,
      "release_date" varchar(10) NOT NULL,
      "price" integer NOT NULL,
      "arrived" boolean DEFAULT false NOT NULL,
      "store" varchar(255) NOT NULL,
      "platform" varchar(255) NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    )
  `;
  console.log("✅ preorder_figures table created");

  // Get user id
  const users = await sql`SELECT id FROM users LIMIT 1`;
  if (users.length === 0) {
    console.error("❌ No user found in users table");
    return;
  }
  const userId = users[0].id;
  console.log(`👤 Using userId: ${userId}`);

  // Clear existing data
  await sql`DELETE FROM preorder_figures`;

  // Insert data
  // source mapping: "台灣模型店預購" → store="模型店", platform="台灣"
  //                  "淘寶預購"       → store="淘寶",   platform="淘寶"
  //                  "社團轉單"       → store="社團",   platform="社團轉單"
  //                  null             → store="未知",   platform="未知"
  const data = [
    { name: "尼爾 2B", releaseDate: "2025-06-30", price: 0, store: "台灣模型店", platform: "預購", arrived: true },
    { name: "BIBI BUTTONS", releaseDate: "2025-12-31", price: 0, store: "未知", platform: "未知", arrived: true },
    { name: "GSC 2B", releaseDate: "2026-01-31", price: 0, store: "淘寶", platform: "預購", arrived: true },
    { name: "queqs 壞兔子", releaseDate: "2026-05-31", price: 0, store: "淘寶", platform: "預購", arrived: false },
    { name: "大漫匠 1/6 漫展贩售日 亚纪 兔女郎 人偶 不可动手办", releaseDate: "2026-03-31", price: 0, store: "淘寶", platform: "預購", arrived: true },
    { name: "BearPanda 有鳳來儀 1/6 旗袍", releaseDate: "2025-06-30", price: 0, store: "社團", platform: "轉單", arrived: true },
    { name: "PURE OEKAKIZUKI 旗袍少女 中华娘 黑色 手办", releaseDate: "2026-04-30", price: 0, store: "未知", platform: "未知", arrived: false },
    { name: "鹤屋通贩 Luminous Box Myabit原创角色 米亚 Mia 手办 预定", releaseDate: "2026-03-09", price: 0, store: "淘寶", platform: "預購", arrived: true },
    { name: "预售 Native Rocket boy 送货兔女郎 葵 1/6手办 KUMA模玩", releaseDate: "2026-04-30", price: 0, store: "淘寶", platform: "預購", arrived: false },
    { name: "【蚊子模玩】定金 剑星 伊芙 Timo 工作室 手办GK女雕像", releaseDate: "2025-12-31", price: 0, store: "淘寶", platform: "預購", arrived: false },
    { name: "預購26年4月 Native BINDing 黑獸 被白濁沾污的高傲聖女 塞蕾斯汀 白精靈女王 1/6 (MR JOE HOBBY)", releaseDate: "2026-04-30", price: 0, store: "台灣模型店", platform: "預購", arrived: false },
    { name: "預購26年6月 SIKI ANIM Sueスーエ 原畫 香檳與玫瑰兔女郎 1/6 一般版", releaseDate: "2026-06-30", price: 0, store: "台灣模型店", platform: "預購", arrived: false },
    { name: "SSR FIGURE 椿春雨 原畫 硬式水著女子 紺乃青&白羊丸子 1/6", releaseDate: "2026-06-30", price: 0, store: "台灣模型店", platform: "預購", arrived: false },
    { name: "Vibrastar みちきんぐ原畫 紫音 Passion Pink 1/6", releaseDate: "2026-10-31", price: 0, store: "台灣模型店", platform: "預購", arrived: false },
    { name: "Native Rocket Boy 辻中美穗 逆兔女郎Ver 1/6", releaseDate: "2026-05-31", price: 0, store: "台灣模型店", platform: "預購", arrived: false },
    { name: "Native Pink Cat 魔太郎 原畫 賭場兔女郎 1/6", releaseDate: "2026-02-28", price: 0, store: "台灣模型店", platform: "預購", arrived: false },
    { name: "Kiwi Toys 캐난감 CeNanGam 原畫 旗袍喵 1/6 一般版", releaseDate: "2026-05-31", price: 0, store: "台灣模型店", platform: "預購", arrived: false },
    { name: "代理版 FLARE 劍星 Stellar Blade 伊芙", releaseDate: "2027-01-31", price: 0, store: "台灣模型店", platform: "預購", arrived: false },
    { name: "VERTEX 精灵村 第十三村人 第13村民 泽菲娅 手办", releaseDate: "2026-06-30", price: 0, store: "淘寶", platform: "預購", arrived: false },
    { name: "Hobby sakura CheLA77原畫 毛衣兔女郎 1/6 一般版 PU完成品", releaseDate: "2026-08-31", price: 0, store: "台灣模型店", platform: "預購", arrived: false },
    { name: "Wonderful Works 泳装姐姐 米拉 日落版", releaseDate: "2026-06-30", price: 0, store: "淘寶", platform: "預購", arrived: false },
    { name: "GSC 勝利女神：妮姬 NIKKE D：殺手妻子 - 秘密派對清潔工 1/7", releaseDate: "2027-02-28", price: 0, store: "台灣模型店", platform: "預購", arrived: false },
    { name: "轉蛋玩具館 預約 27年4月 GSC 碧藍航線 天城 玉座落鸞Ver. 1/7 免訂金", releaseDate: "2027-04-30", price: 0, store: "台灣模型店", platform: "預購", arrived: false },
    { name: "MIMOSA DISH 原畫 YAMATO 1/7 豪華版", releaseDate: "2026-12-31", price: 0, store: "台灣模型店", platform: "預購", arrived: false },
  ];

  for (const item of data) {
    await sql`
      INSERT INTO preorder_figures (user_id, name, release_date, price, arrived, store, platform)
      VALUES (${userId}, ${item.name}, ${item.releaseDate}, ${item.price}, ${item.arrived}, ${item.store}, ${item.platform})
    `;
  }

  console.log(`✅ Inserted ${data.length} preorder records`);

  // Drop old table
  await sql`DROP TABLE IF EXISTS preorders`;
  console.log("🗑️ Dropped old preorders table");

  // Verify
  const count = await sql`SELECT count(*) FROM preorder_figures`;
  console.log(`📊 Total records in preorder_figures: ${count[0].count}`);
}

main().catch(console.error);
