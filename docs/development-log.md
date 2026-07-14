# FigureHub 開發紀錄

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