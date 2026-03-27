import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const sql = neon(process.env.DATABASE_URL);

async function main() {
  // Create table
  await sql`
    CREATE TABLE IF NOT EXISTS "preorders" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" varchar(500) NOT NULL,
      "date" date NOT NULL,
      "price" integer,
      "source" varchar(100),
      "arrived" boolean DEFAULT false NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    )
  `;
  console.log("✅ preorders table created");

  // Insert data
  const data = [
    { name: "尼爾 2B", date: "2025-06-30", source: "台灣模型店預購", arrived: true },
    { name: "BIBI BUTTONS", date: "2025-12-31", source: null, arrived: true },
    { name: "GSC 2B", date: "2026-01-31", source: "淘寶預購", arrived: true },
    { name: "queqs 壞兔子", date: "2026-05-31", source: "淘寶預購", arrived: false },
    { name: "大漫匠 1/6 漫展贩售日 亚纪 兔女郎 人偶 不可动手办", date: "2026-03-31", source: "淘寶預購", arrived: true },
    { name: "BearPanda 有鳳來儀 1/6 旗袍", date: "2025-06-30", source: "社團轉單", arrived: true },
    { name: "PURE OEKAKIZUKI 旗袍少女 中华娘 黑色 手办", date: "2026-04-30", source: null, arrived: false },
    { name: "鹤屋通贩 Luminous Box Myabit原创角色 米亚 Mia 手办 预定", date: "2026-03-09", source: "淘寶預購", arrived: true },
    { name: "预售 Native Rocket boy 送货兔女郎 葵 1/6手办 KUMA模玩", date: "2026-04-30", source: "淘寶預購", arrived: false },
    { name: "【蚊子模玩】定金 剑星 伊芙 Timo 工作室 手办GK女雕像", date: "2025-12-31", source: "淘寶預購", arrived: false },
    { name: "預購26年4月 Native BINDing 黑獸 被白濁沾污的高傲聖女 塞蕾斯汀 白精靈女王 1/6 (MR JOE HOBBY)", date: "2026-04-30", source: "台灣模型店預購", arrived: false },
    { name: "預購26年6月 SIKI ANIM Sueスーエ 原畫 香檳與玫瑰兔女郎 1/6 一般版", date: "2026-06-30", source: "台灣模型店預購", arrived: false },
    { name: "https://shopping.gamania.com/CHAMPION/Goods/Detail/P12283375469", date: "2026-06-30", source: "台灣模型店預購", arrived: false },
    { name: "Vibrastar みちきんぐ原畫 紫音 Passion Pink 1/6", date: "2026-10-31", source: "台灣模型店預購", arrived: false },
    { name: "https://shopping.gamania.com/CHAMPION/Goods/Detail/P13282773710", date: "2026-05-31", source: "台灣模型店預購", arrived: false },
    { name: "https://shopping.gamania.com/CHAMPION/Goods/Detail/P12282947731", date: "2026-02-28", source: "台灣模型店預購", arrived: false },
    { name: "https://shopping.gamania.com/CHAMPION/Goods/Detail/P13283281141", date: "2026-05-31", source: "台灣模型店預購", arrived: false },
    { name: "https://shopping.gamania.com/a5713476/Goods/Detail/P15282178946", date: "2027-01-31", source: "台灣模型店預購", arrived: false },
    { name: "VERTEX 精灵村 第十三村人 第13村民 泽菲娅 手办", date: "2026-06-30", source: "淘寶預購", arrived: false },
    { name: "https://shopping.gamania.com/CHAMPION/Goods/Detail/P04291645395", date: "2026-08-31", source: "台灣模型店預購", arrived: false },
    { name: "Wonderful Works 泳装姐姐 米拉 日落版", date: "2026-06-30", source: "淘寶預購", arrived: false },
    { name: "https://shopping.gamania.com/CHAMPION/Goods/Detail/P04293332313", date: "2027-02-28", source: "台灣模型店預購", arrived: false },
    { name: "轉蛋玩具館 預約 27年4月 GSC 碧藍航線 天城 玉座落鸞Ver. 1/7 免訂金", date: "2027-04-30", source: "台灣模型店預購", arrived: false },
    { name: "https://www.ruten.com.tw/item/show?22610204379938", date: "2026-12-31", source: "台灣模型店預購", arrived: false },
  ];

  for (const item of data) {
    await sql`
      INSERT INTO preorders (name, date, source, arrived)
      VALUES (${item.name}, ${item.date}, ${item.source}, ${item.arrived})
    `;
  }

  console.log(`✅ Inserted ${data.length} preorder records`);

  // Verify
  const count = await sql`SELECT count(*) FROM preorders`;
  console.log(`📊 Total records in preorders: ${count[0].count}`);
}

main().catch(console.error);
