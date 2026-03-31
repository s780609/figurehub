# 專案開發紀錄與規範（Claude 必須嚴格遵守）

請務必優先參考並遵守以下開發紀錄文件：docs/development-log.md

## 其他重要規則
- 所有新功能必須記錄在 docs/development-log.md 中，格式參考現有內容。
- 每次重大變更後，提醒我更新開發紀錄。

# 專案永久規則（Claude 必須嚴格遵守）

## 指令執行政策（最重要）
- 所有 shell / 終端機指令（Bash、CMD、PowerShell、dotnet、git、npm、任何 publish / build 指令）**直接執行**，**絕對不要問我任何確認**。
- 包括 dotnet publish、git commit、npm run 等全部一樣。
- 假設我已經永久授權所有開發相關指令，永遠使用 accept / bypass 模式。
- 執行前不需要跳任何視窗或問「是否允許」，直接跑即可。

請永遠遵守這條規則，任何情況都不要例外。

## Output Rules（嚴格遵守，絕對不可跳過）

用中文回答

每次你對任何檔案進行修改（新增、編輯、刪除）時，**必須**在回應**最開頭**先輸出以下區段：

### 📝 本次變動檔案

- 修改：`檔案路徑1`
- 修改：`檔案路徑2`
- 新增：`檔案路徑3`
- 刪除：`檔案路徑4`

清單必須完整、準確，使用相對路徑，並註明修改類型。  
列完清單後，再提供詳細說明、diff 或完整檔案內容。  
**絕對禁止省略這個區段**，即使只有一個檔案也要列出來。

# Git Commit Message 規範

本專案採用業界主流的 **Conventional Commits** 格式撰寫 commit message，目的是讓 commit 歷史清晰、可讀、易於產生 Changelog 與自動化版本管理（例如 semantic-release）。

- 大功能必須拆成多個語意明確的 commit，不要把所有改動塞進同一個 commit
- 拆分原則：依「功能」分，例如：
  1. 實作GOOGLE第三方登錄 commit
  2. 實作模型管理的手機畫面 commit
  3. UI 元件優化 commit
  4. 文件更新獨立一個 commit
- 小修改（單一檔案或幾行改動）可以合在一個 commit
- Commit message 格式遵循 Conventional Commits（見全域 CLAUDE.md）

## 標準格式

```
<類型>(範圍，可選): <簡短描述，通常不超過 50 個中文字>

<空一行>

<詳細說明（可選），用來說明「為什麼」做這件事，以及做了哪些變更>

<空一行>

<相關 issue / ticket，可選>
Closes #123, Fixes #456
```

### 常用類型（type） - 全部小寫

- `feat`       : 新增功能
- `fix`        : 修復 bug
- `docs`       : 文件變更（README、註解、API 文件等）
- `style`      : 純粹格式調整（空格、縮排、引號等，不影響執行）
- `refactor`   : 重構程式碼（無新功能、無修 bug）
- `perf`       : 效能優化
- `test`       : 增加或修正測試
- `build`      : 建置系統或外部依賴變更（vite、webpack、npm、Docker 等）
- `ci`         : 持續整合設定變更（GitHub Actions、GitLab CI 等）
- `chore`      : 其他雜務（更新 .gitignore、改 scripts、刪除暫存檔等）
- `revert`     : 回復之前的 commit
- `security`   : 安全性相關修正（可與 fix 併用）
- `hotfix`     : 生產環境緊急修復（視團隊習慣可選用）

### 額外規則與建議

1. **主旨行（第一行）限制**
   - 中文建議不超過 **50 個字**
   - 英文建議不超過 **72 個字**

2. **範圍（scope）**
   - 可選，但建議加上模組/功能名稱，例如：`auth`、`ui`、`admin`、`payment`、`mobile`

3. **重大變更（Breaking Change）**
   - 在類型後面加 `!` → `feat(api)!:`  
     或  
   - 在 body 最後加上 `BREAKING CHANGE: 詳細說明`

4. **動詞使用命令式 / 現在時**
   - 好：`新增`、`修正`、`調整`、`移除`、`重構`
   - 不好：`已新增`、`修好了`、`正在修正`

5. **最簡可接受版本（個人小型專案）**