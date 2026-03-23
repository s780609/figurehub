export type FigureCondition = "全新未拆" | "拆擺";

export interface FigureMedia {
  type: "image" | "video";
  url: string; // Google Drive 共用連結
}

export interface Figure {
  id: string;
  name: string;
  price: number;
  condition: FigureCondition;
  thumbnail: string; // Google Drive 共用連結（主圖）
  media: FigureMedia[]; // 更多照片與影片
  description?: string;
}

// 範例資料 — 之後會從 Neon DB 讀取
export const figures: Figure[] = [
  {
    id: "1",
    name: "初音未來 1/7 賽車娘 2024ver.",
    price: 3200,
    condition: "拆擺",
    thumbnail: "https://placehold.co/400x500/6366f1/white?text=Figure+1",
    media: [
      { type: "image", url: "https://placehold.co/800x600/6366f1/white?text=Photo+1" },
      { type: "image", url: "https://placehold.co/800x600/6366f1/white?text=Photo+2" },
    ],
    description: "拆擺展示約半年，無菸環境，狀態良好，盒裝完整。",
  },
  {
    id: "2",
    name: "鬼滅之刃 竈門炭治郎 ARTFX J",
    price: 2800,
    condition: "全新未拆",
    thumbnail: "https://placehold.co/400x500/22c55e/white?text=Figure+2",
    media: [
      { type: "image", url: "https://placehold.co/800x600/22c55e/white?text=Photo+1" },
    ],
    description: "日版正品，全新未拆封，適合收藏。",
  },
  {
    id: "3",
    name: "間諜家家酒 安妮亞 Nendoroid",
    price: 1200,
    condition: "拆擺",
    thumbnail: "https://placehold.co/400x500/f59e0b/white?text=Figure+3",
    media: [
      { type: "image", url: "https://placehold.co/800x600/f59e0b/white?text=Photo+1" },
      { type: "image", url: "https://placehold.co/800x600/f59e0b/white?text=Photo+2" },
      { type: "video", url: "https://placehold.co/800x600/f59e0b/white?text=Video" },
    ],
    description: "拆擺展示，配件齊全，表情零件完整。",
  },
  {
    id: "4",
    name: "七龍珠 孫悟空 自在極意功 S.H.Figuarts",
    price: 4500,
    condition: "全新未拆",
    thumbnail: "https://placehold.co/400x500/818cf8/white?text=Figure+4",
    media: [
      { type: "image", url: "https://placehold.co/800x600/818cf8/white?text=Photo+1" },
    ],
    description: "限定版，日版全新未拆。",
  },
  {
    id: "5",
    name: "進擊的巨人 里維兵長 1/8",
    price: 2600,
    condition: "拆擺",
    thumbnail: "https://placehold.co/400x500/ef4444/white?text=Figure+5",
    media: [
      { type: "image", url: "https://placehold.co/800x600/ef4444/white?text=Photo+1" },
      { type: "image", url: "https://placehold.co/800x600/ef4444/white?text=Photo+2" },
    ],
    description: "拆擺約一年，展示櫃保存，底座完好。",
  },
  {
    id: "6",
    name: "咒術迴戰 五條悟 DX Figure",
    price: 1800,
    condition: "拆擺",
    thumbnail: "https://placehold.co/400x500/3b82f6/white?text=Figure+6",
    media: [
      { type: "image", url: "https://placehold.co/800x600/3b82f6/white?text=Photo+1" },
    ],
    description: "景品，拆擺展示，無盒。",
  },
];
