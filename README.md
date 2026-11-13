# your future

เว็บจำลองอนาคตก่อนกู้เงิน คุยกับที่ปรึกษา AI ตัว 3D ด้วยเสียง (Gemini Live) ครบ 30 เรื่อง แล้วดูผลกับวิดีโออนาคต

## ไฟล์
- `public/index.html` หน้าเว็บทั้งหมด
- `src/worker.js` + `wrangler.jsonc` ใช้ตอนรันเป็น Cloudflare Worker
- `functions/api/token.js` สร้างบัตรผ่านชั่วคราวให้เบราว์เซอร์คุยกับ Gemini Live โดยไม่เห็น key จริง
- `functions/api/analyze.js` ใช้ตอนกด "ประเมินละเอียดด้วย AI" ในหน้าผล

## ตั้งค่าบน Cloudflare (ทำครั้งเดียว)
1. Workers & Pages → Create → Connect to Git → เลือก repo `your-future`
2. Project name: `your-future`, Build command: เว้นว่าง, Deploy command: `npx wrangler deploy` (ถ้าตั้งเป็น Pages ให้ Build output directory: `public`)
3. Settings → Variables and Secrets → Add → Type: Secret, Name: `GEMINI_API_KEY`, Value: key จาก Google AI Studio
4. Deployments → Retry deployment

## ปรับแต่ง
- เปลี่ยนเสียง: แก้ `VOICE_NAME` ใน `public/index.html` (เช่น `Charon`, `Orus`, `Sadaltager`)
- เปลี่ยนโมเดล: แก้ `LIVE_MODELS` (เว็บจะลองตามลำดับ ตัวไหนใช้ไม่ได้จะข้ามไปตัวถัดไป)
