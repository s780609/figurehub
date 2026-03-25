# 專案規則

## Git Commit 規範

- 大功能必須拆成多個語意明確的 commit，不要把所有改動塞進同一個 commit
- 拆分原則：依「功能」分，例如：
  1. 實作GOOGLE第三方登錄 commit
  2. 實作模型管理的手機畫面 commit
  3. UI 元件優化 commit
  4. 文件更新獨立一個 commit
- 小修改（單一檔案或幾行改動）可以合在一個 commit
- Commit message 格式遵循 Conventional Commits（見全域 CLAUDE.md）
