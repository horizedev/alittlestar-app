# A Little Star

讓家庭成員共同記錄孩子每日服藥、情緒、飲食、睡眠及覆診事項的繁體中文網頁應用程式。

## 本機開發

```bash
npm install
cp .env.example .env.local
npm run dev
```

在 `.env.local` 填入 Supabase 專案網址及 publishable key。Publishable key 可安全用於前端；切勿把 secret key 或 service role key 放進 Vite 環境變數。

## 電郵登入設定

應用程式使用 Supabase 的免密碼電郵登入連結。請在 Supabase Dashboard 的 Authentication → URL Configuration 設定：

   - Site URL：`https://alittlestar-app.vercel.app`
   - Redirect URLs：`http://localhost:5173/**`
   - Redirect URLs：`https://alittlestar-app.vercel.app/**`

正式對外使用前，建議在 Authentication → Email 設定自訂 SMTP，避免受測試郵件配額限制。

## 資料庫

`supabase/migrations` 包含孩子、共同管理成員、每日記錄、覆診筆記及一次性邀請的 schema。所有公開資料表均啟用 Row Level Security；QR 邀請只儲存雜湊、限用一次並於 24 小時後失效。

## 驗證

```bash
npm run typecheck
npm run build
```
