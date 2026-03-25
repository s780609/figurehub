# FigureHub - 二手模型管理與刊登平台

多人共用的二手 PVC 模型銷售管理系統，透過 Google 帳號登入，每個使用者擁有獨立的模型管理後台和前台展示頁面。

因為模型很多是 R18，在 FB 社團貼文不時被擋，每次都要手動貼 Google 雲端連結，還容易貼錯。FB 貼文也不好整理，一次 PO 多個模型更是麻煩。所以做了這個專案，把模型資料集中管理，自動產生刊登文章，也順便記錄賣了多少、每支價格多少。

## 功能

### 前台（公開頁面）
- `/` 首頁：展示所有使用者的模型
- `/u/<slug>` 使用者頁面：展示特定使用者的模型收藏
- 模型列表支援依「售出狀態」和「銷售方式」篩選
- 篩選條件同步至 URL query string，方便分享特定篩選結果
- 模型詳細頁：照片、影片、狀態標籤、銷售方式、結標時間
- Open Graph meta tags，FB 分享可顯示預覽圖片
- 右上角使用者選單（登入/登出/模型管理）
- 聯絡資訊下拉選單（LINE ID、GitHub Repo、常用 PVC 社團連結）

### 後台（Google 帳號登入）
- Google 第三方登入，首次登入自動建立帳號
- 模型 CRUD 管理（名稱、價格、狀態、盒況、交易方式、銷售方式、結標時間）
- 模型列表支援表格/卡片切換，手機自動選擇卡片模式
- Google Drive 資料夾整合：貼上共用連結自動抓取照片與影片
- 媒體管理：支援手動新增、排序（上移/下移/設為首張）、刪除
- **刊登文章產生器**：
  - 售出文 / 競標文 兩種模式
  - 依銷售方式自動預選模型
  - 自動產生編號、價格、交易方式、結標時間等欄位
  - 參考網址自動帶入篩選參數
  - 一鍵複製，直接貼到 FB 社團

### 模型欄位
| 欄位 | 說明 |
|------|------|
| 名稱 | 模型名稱 |
| 價格 | NT$ |
| 成交價格 | 出售模式自動同步價格，競標模式手動填寫 |
| 狀態 | 全新未拆 / 拆擺 |
| 盒況 | 佳 / 普通 / 差 / 無盒 |
| 交易方式 | 賣貨便 / 郵寄 / 黑貓 |
| 銷售方式 | 出售 / 競標 |
| 售出狀態 | 未售出 / 準備中 / 已售出 |
| 結標時間 | 競標專用，預設明天晚上 22:00 |
| 說明 | 自由文字 |
| 媒體 | Google Drive 照片 / 影片 |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Neon (Serverless PostgreSQL)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS 4
- **Auth**: NextAuth.js v5 (Auth.js) + Google OAuth
- **Analytics**: Vercel Analytics
- **Deployment**: Vercel

## 環境變數

```env
# Database
DATABASE_URL=postgresql://...

# Google OAuth (NextAuth)
AUTH_SECRET=your-auth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Drive API
GOOGLE_API_KEY=your-google-api-key

# Site
NEXT_PUBLIC_SITE_URL=https://figurehub.xyz
```

## 開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 推送 schema 到資料庫
npm run db:push

# 開啟 Drizzle Studio（資料庫 GUI）
npm run db:studio

# 建置
npm run build
```

## 專案結構

```
src/
├── app/
│   ├── page.tsx                    # 首頁（所有模型列表）
│   ├── layout.tsx                  # 全站 Layout（含 UserMenu）
│   ├── figure/[id]/                # 模型詳細頁
│   ├── u/[slug]/                   # 使用者前台頁面
│   │   ├── page.tsx                # 使用者模型列表
│   │   └── figure/[id]/            # 使用者模型詳細頁
│   ├── admin/                      # 後台管理
│   │   ├── page.tsx                # 模型管理（表格/卡片）
│   │   ├── generate/               # 文章產生器
│   │   ├── figures/new/            # 新增模型
│   │   ├── figures/[id]/edit/      # 編輯模型
│   │   └── login/                  # Google 登入頁
│   └── api/
│       ├── auth/[...nextauth]/     # NextAuth API route
│       └── drive/                  # Google Drive API proxy
├── components/
│   ├── AdminFigureList.tsx         # 後台模型列表（表格/卡片切換）
│   ├── FigureCard.tsx              # 模型卡片
│   ├── FigureForm.tsx              # 模型表單（新增/編輯/媒體排序）
│   ├── FigureList.tsx              # 前台模型列表（含篩選器）
│   ├── ArticleGenerator.tsx        # 文章產生器
│   ├── GroupDropdown.tsx           # 聯絡資訊下拉選單
│   └── UserMenu.tsx                # 使用者頭像下拉選單
├── data/
│   └── figures.ts                  # 資料查詢函式與型別定義
└── lib/
    ├── schema.ts                   # Drizzle schema（users + figures + media）
    ├── db.ts                       # 資料庫連線
    ├── actions.ts                  # Server Actions（CRUD + 認領模型）
    ├── auth.ts                     # NextAuth 設定 + Google Provider
    └── gdrive.ts                   # Google Drive 整合
```
