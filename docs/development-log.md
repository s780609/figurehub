# FigureHub 開發紀錄

## 2026-10-02

### feat(home): 首頁模型詳情頁獨立為 /figure/[id]

**變更檔案**
- `src/app/figure/[id]/page.tsx`（新增）
- `src/components/FigureDetail.tsx`（新增）
- `src/app/u/[slug]/figure/[id]/page.tsx`
- `src/components/HomeFigureList.tsx`
- `src/data/figures.ts`

**內容**
- 首頁的表格與卡片改連到新的 `/figure/<id>`，返回連結為「回到首頁」，不再出現「回到 XXX 的收藏」。
- 詳情頁內容抽成共用元件 `FigureDetail`，賣場詳情頁（`/u/<slug>/figure/<id>`）與首頁詳情頁共用，差別只在返回連結。
- 新頁面的 canonical 與 og:url 指回賣場網址，避免重複內容；sitemap 不變。
- 新增 `getUserById()`。

### feat(home): 首頁新增卡片檢視、無限捲動與成交價格排序

**變更檔案**
- `src/components/HomeFigureList.tsx`（新增）
- `src/app/page.tsx`
- `src/data/figures.ts`
- `src/lib/actions.ts`

**內容**
- 首頁成交紀錄可在「表格 / 卡片」之間切換；卡片樣式比照個人賣場的 `FigureCard`（首張照片、狀況、盒況、銷售方式），金額顯示成交價格並附賣家名稱。
- 檢視偏好存在 `localStorage`（`home-view`）；未設定時手機寬度預設卡片、其餘預設表格。
- 無限捲動：每批 24 筆，捲到底部附近時以 `IntersectionObserver` 觸發 server action `loadSoldFigures()` 載入下一批，兩種檢視共用。
- 表格「成交價格」欄標題可點擊排序（低到高 → 高到低 → 取消）；排序在資料庫端以 `coalesce(deal_price, price)` 進行，切換時從第一批重新載入。
- `getSoldFigures()` 改為分頁版本，回傳 `{ items, hasMore }` 並附帶首張照片。

### feat(admin): 模型與預購模型編輯改為彈出式 Modal

**變更檔案**
- `src/components/Modal.tsx`（新增）
- `src/app/admin/@modal/default.tsx`（新增）
- `src/app/admin/@modal/page.tsx`（新增）
- `src/app/admin/@modal/[...catchAll]/page.tsx`（新增）
- `src/app/admin/@modal/(.)figures/[id]/edit/page.tsx`（新增）
- `src/app/admin/@modal/(.)preorders/[id]/edit/page.tsx`（新增）
- `src/app/admin/layout.tsx`

**內容**
- 以 Next.js Parallel Routes + Intercepting Routes 實作：從列表點「編輯」時，編輯表單以大型 Modal（最寬 `max-w-4xl`、最高 92vh、內容可捲動）疊在列表上，網址仍會變成 `/admin/.../edit`。
- 關閉方式：右上角 ×、點背景遮罩、按 Esc（皆為回上一頁）；儲存成功後 server action 導回列表，Modal 自動關閉。
- 直接開啟或重新整理編輯網址時，仍顯示原本的整頁編輯頁。
- `@modal/page.tsx` 與 `[...catchAll]/page.tsx` 回傳 `null`，確保導回列表或其他後台頁面時 Modal 會關閉。

### fix(layout): 左上角 FigureHub 連結固定回首頁

**變更檔案**
- `src/app/layout.tsx`

**內容**
- Logo 連結原本登入後會導到自己的賣場（`/u/<slug>`），改為一律連到首頁 `/`。

### feat(admin): 預購模型列表預設依到貨狀態排序

**變更檔案**
- `src/components/AdminPreorderList.tsx`

**內容**
- 預購模型列表預設以「到貨狀態」遞增排序，未到貨排在上面、已到貨在下面；同狀態內維持原本的建立順序。
- 仍可點欄位標題切換其他排序。

### feat(admin): 預購模型可複製到模型列表

**變更檔案**
- `src/components/AdminPreorderList.tsx`
- `src/components/FigureForm.tsx`
- `src/app/admin/figures/new/page.tsx`

**內容**
- 預購模型的表格與卡片操作區新增「複製」按鈕，連到 `/admin/figures/new?fromPreorder=<id>`。
- 新增模型頁會讀取該筆預購資料（限本人所有），將名稱與價格預填進表單，其餘欄位由使用者確認後送出。
- `FigureForm` 新增 `initial` 預填參數；預購資料本身不會被修改或刪除。
- 表格右側固定欄寬由 156px 調整為 216px 以容納第三顆按鈕。

### refactor(admin): 移除訂單管理模組

**變更檔案**
- `src/app/admin/orders/page.tsx`（刪除）
- `src/components/AdminOrderList.tsx`（刪除）
- `src/data/orders.ts`（刪除）
- `src/app/admin/layout.tsx`
- `src/lib/actions.ts`

**內容**
- 移除後台「訂單管理」頁面、列表元件、`getAllOrders()` 與 `updateOrderStatus()`，並拿掉後台導覽列的入口。
- `orders` 資料表與綠界金流（`/api/ecpay/*`）維持不動，付款流程仍會寫入訂單。

### feat(home): 首頁改為二手模型資訊（成交價格一覽）

**變更檔案**
- `src/app/page.tsx`
- `src/data/figures.ts`

**內容**
- 首頁標題改為「二手模型資訊」，由賣場列表改為列出所有賣家「已售出」模型的成交價格表格。
- 成交價格以 `dealPrice` 為準，無則用原價（與後台總售出金額計算一致）。
- 模型名稱連到模型詳情頁，賣家名稱連到該賣家賣場。
- 新增 `getSoldFigures()`；`getAllSellers()` 仍供 sitemap 使用，予以保留。

### feat(figure): 競標模型詳情頁顯示起標價與最後成交金額

**變更檔案**
- `src/app/u/[slug]/figure/[id]/page.tsx`

**內容**
- 銷售方式為「競標」時，金額改為顯示「起標價」與「最後成交金額」；尚無成交價格時顯示「尚未成交」。
- 銷售方式為「出售」時維持原本的價格顯示。

## 2026-07-24

### fix(admin): 保留預購表格到貨狀態欄並固定在操作欄左側

**變更檔案**
- `src/components/AdminPreorderList.tsx`

**內容**
- 預購模型表格將「到貨狀態」欄位加回可見區，與「操作」欄一起固定在右側。
- 設定右側兩欄固定寬度與層級，避免操作欄覆蓋到貨狀態欄。

### fix(admin): 預購模型表格補上可見的編輯與刪除操作欄

**變更檔案**
- `src/components/AdminPreorderList.tsx`

**內容**
- 預購模型「表格模式」的操作欄改為靠右固定（sticky），避免在窄視窗或水平捲動時看不到編輯/刪除按鈕。
- 操作欄每列背景依奇偶列維持一致，避免固定欄位造成視覺斷層。

## 2026-07-14

### feat(admin): 模型列表售出統計

**變更檔案**
- `src/app/admin/page.tsx`

**內容**
- 後台模型列表頁（`/admin`）頂部統計區，在「總售出金額」旁新增售出狀態數量：
  - 已售出（紅色）
  - 準備中（黃色）
  - 未售出（綠色）
- 總售出金額仍只計算 `soldStatus === "已售出"` 的模型，以成交價格（無則用原價）加總
- 配色與列表售出狀態徽章一致（`AdminFigureList` 的 `SoldStatusBadge`）