/**
 * 等資料庫就緒（第一次啟動要跑 initdb，需要幾秒）
 * npm start 的最後一步，等到能連線才把終端機還給你
 */
import 'dotenv/config'
import { Client } from 'pg'

const cfg = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USERNAME || 'student',
  password: process.env.DB_PASSWORD || 'student666',
  database: process.env.DB_DATABASE || 'livefit',
}

async function main() {
  process.stdout.write('等資料庫就緒')
  let okStreak = 0
  for (let i = 0; i < 40; i++) {
    const c = new Client(cfg)
    try {
      await c.connect()
      await c.query('SELECT 1')
      await c.end()
      okStreak++
      // PG 第一次初始化會「先開門再重啟一次」——連續兩次成功才算真的就緒
      if (okStreak >= 2) {
        console.log(' ✅')
        return
      }
      await new Promise((r) => setTimeout(r, 1500))
    } catch {
      okStreak = 0
      await c.end().catch(() => {})
      process.stdout.write('.')
      await new Promise((r) => setTimeout(r, 2000))
    }
  }
  console.error('\n⛔ 等了 60 秒資料庫還沒就緒 — 跑 docker compose logs postgres 看看發生什麼事')
  process.exit(1)
}

main()
