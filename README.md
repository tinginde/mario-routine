# 🍄 Mario Routine - 馬力歐晚間任務

## 本地測試

```bash
npm install

# 先在本地跑一個 PostgreSQL，或者填入 Zeabur 的連線字串
export DATABASE_URL=postgresql://user:password@localhost:5432/mario

node server.js
# 打開 http://localhost:3000
```

## Deploy 到 Zeabur

### 步驟 1：新增 PostgreSQL service
1. Zeabur Dashboard → 你的 Project → Add Service
2. 選 **Marketplace** → 搜尋 **PostgreSQL** → Deploy
3. 點進 PostgreSQL service → **Instructions** 頁籤
4. 複製 **Internal** 的 `CONNECTION_STRING`（給 Node.js 用）

### 步驟 2：Deploy Node.js service
1. Add Service → **Git** → 選你的 repo
2. Zeabur 會自動偵測 Node.js

### 步驟 3：設定環境變數
Node.js service → **Variables** 頁籤 → 新增：
```
DATABASE_URL = <貼上剛才複製的 PostgreSQL Internal Connection String>
```

### 步驟 4：設定 Domain
Node.js service → **Networking** → Generate Domain

完成！打開 domain 就可以用了 🎉

## 檔案結構

```
mario-routine/
├── server.js        # Express API
├── db.js            # PostgreSQL 連線 + 建表
├── package.json
├── zbpack.json      # Zeabur 設定
└── public/
    └── index.html   # 前端（馬力歐主題）
```

## API 端點

| Method | Path | 說明 |
|--------|------|------|
| GET | `/api/checkin?date=YYYY-MM-DD` | 取得某天的打卡狀態 |
| PUT | `/api/checkin` | 更新今天的狀態 |
| GET | `/api/checkins/week?start=YYYY-MM-DD` | 取得本週進度 |
| GET | `/api/streak` | 取得連續天數 |
