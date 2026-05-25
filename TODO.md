# Salon App — Хийх ажлуудын жагсаалт

## ✅ Саяхан хийсэн зүйлс

### SearchLocation → HomeScreen холболт
- `appStore.js` үүсгэж `selectedCity` state хадгалав
- SearchLocationScreen дахь `handleSelect` хотыг store-д хадгалдаг болсон
- HomeScreen store-оос хот уншдаг болсон

### HomeScreen SalonCard
- "Дэлгэрэнгүй" товчийг хасав — бүх card дарагдахад ажилладаг
- Rating доор review count харагдах болсон (жишээ: 4.7 (312))
- Promo "Захиалах" товч SearchLocation руу navigate хийдэг болсон

### CheckoutScreen засах
- "1000 km" hardcode хасав
- "Хэн ч байж болно" stylist-г сонгоход алдаа гарахгүй болсон (validation засав)

### ProfileScreen цэвэрлэх
- Захиалгын давхардсан хэсгийг хасав (BookingsScreen tab байгаа учир)
- Profile menu items нэмэв (Профайл засах, Мэдэгдэл, гэх мэт)

### Favorites бүрэн хэрэгжүүлэх
- Server: `favorites` table migrate-д нэмэв
- Server: `favoriteController.js` үүсгэв (get/add/remove/check)
- Server: `/api/favorites` routes нэмэв (auth middleware-тэй)
- Client: SalonDetailScreen дахь ❤️ товч API-тай ажилладаг болсон
- Client: FavoritesScreen-г бүрэн хэрэгжүүлэв (жагсаалт, салон руу navigate)

---

## 🔴 Огт ажиллахгүй байгаа зүйлс (Critical)

### 1. OTP — бодит баталгаажуулалт байхгүй
- `OTPScreen` нь хэрэглэгч 4 оронтой дурын тоо оруулбал нэвтрүүлдэг
- Сервер дээр OTP үүсгэх/илгээх/шалгах logic байхгүй
- **Хийх:** Mock OTP `1234` шалгах — эсвэл email+password flow руу шилжих

---

## 🟠 Хэсэгчилсэн / Ажилладаг ч дутуу (Incomplete)

### 2. ReceiptScreen — QR болон Download ажиллахгүй
- QR placeholder зөвхөн "QR" текст
- "Download Receipt" товч юу ч хийдэггүй
- **Хийх:** `expo-sharing` + `react-native-view-shot` эсвэл `react-native-qrcode-svg`

### 3. HomeScreen — категорийн шүүлтүүр зөвхөн UI
- `selectedCategory` API руу дамждаггүй
- **Хийх:** Server-д `category` param нэмэх, services JOIN хийх

### 4. HomeScreen — Мэдэгдлийн товч декоратив
- Notification bell дарахад юу ч болдоггүй
- **Хийх:** Notification дэлгэц нэмэх эсвэл товчийг хасах

---

## 🟡 Сервер талын дутуу зүйлс (Backend)

### 5. Category шүүлтүүр endpoint байхгүй
- `salonController.getAllSalons` зөвхөн `city`-р шүүдэг
- **Хийх:** `?category=haircut` param нэмж services JOIN хийх

### 6. Profile засах endpoint байхгүй
- `PATCH /api/auth/me` — нэр, утас засах

---

## 🔵 Жижиг UX асуудлууд (Minor)

| Файл | Асуудал |
|------|---------|
| `SearchLocationScreen.js` | Зөвхөн 2 hardcode хот, бодит хайлт байхгүй |
| `OTPScreen.js` | "Дахин илгээх" ажиллахгүй |
| `PaymentScreen.js` | Apple Pay / Google Pay зөвхөн UI |
| `BookingsScreen.js` | Confirmed захиалгыг цуцлах боломжгүй |

---

## ✅ Ажилладаг зүйлс (хөндөхгүй)

- Register / Login (email + password)
- Салоны жагсаалт (хотоор шүүнэ), дэлгэрэнгүй харах
- Стилист сонгох ("Хэн ч байж болно" зөв ажиллана)
- Огноо, цаг сонгох
- Checkout хураангуй (distance хасагдсан)
- Карт хадгалах + Payment flow
- Захиалга үүсгэх (DB-д бичдэг)
- Захиалга цуцлах (pending → cancelled)
- Receipt харах
- Bottom tab navigation
- Auth state persistence (AsyncStorage)
- SearchLocation → HomeScreen хотын мэдээлэл дамжуулах ✅
- Favorites (❤️ товч + жагсаалт) ✅
- ProfileScreen цэвэр (захиалга давхардалгүй) ✅

---

## Дараагийн санал болгох дараалал

1. **OTP mock fix** (15 мин) — `1234` эсвэл any-4-digit шалгах
2. **Category шүүлтүүр** (1 цаг) — server JOIN + client
3. **Receipt QR + Download** (1-2 цаг) — expo-sharing
4. **Profile засах** (1-2 цаг) — PATCH endpoint + UI form
