# Proposal: Bookstore Management System

## Summary
ສ້າງລະບົບຈັດການຮ້ານຂາຍປຶ້ມ (Bookstore Management System) ທີ່ຄຸ້ມຄອງວົງຈອນທຸລະກິດຄົບຖ້ວນ: ຈັດການຂໍ້ມູນຫຼັກ → ລົງທະບຽນ → ສັ່ງຊື້ → ນຳເຂົ້າ → ຂາຍ → ຈອງ → ລາຍງານ.

## Motivation
ຮ້ານຂາຍປຶ້ມຕ້ອງການລະບົບກາງເພື່ອ:
- ຄຸ້ມຄອງຂໍ້ມູນປຶ້ມ, ລູກຄ້າ, ຜູ້ສະໜອງ ແລະ ພະນັກງານ ໃນບ່ອນດຽວ
- ຕິດຕາມສະຕັອກໃຫ້ຖືກຕ້ອງ ໂດຍແຍກ "ການສັ່ງຊື້" ກັບ "ການນຳເຂົ້າຂອງຈິງ"
- ຮອງຮັບການຂາຍ ແລະ ການຈອງປຶ້ມ ພ້ອມເງິນມັດຈຳ
- ສ້າງລາຍງານສຳລັບການຕັດສິນໃຈ

## Scope (Capabilities)
1. **master-data** — ຈັດການພະນັກງານ, ໝວດໝູ່, ປະເພດ, ປຶ້ມ, ລູກຄ້າ, ຜູ້ສະໜອງ
2. **registration** — ລົງທະບຽນລູກຄ້າ ພ້ອມຢືນຢັນ OTP
3. **purchasing** — ສັ່ງຊື້ປຶ້ມຈາກຜູ້ສະໜອງ
4. **importing** — ນຳເຂົ້າປຶ້ມຕາມໃບສັ່ງຊື້
5. **selling** — ຂາຍປຶ້ມ ແລະ ຊຳລະເງິນ
6. **reservation** — ສັ່ງຈອງປຶ້ມ ພ້ອມເງິນມັດຈຳ
7. **reporting** — ລາຍງານ 6 ປະເພດ

## Out of Scope
- ການເຊື່ອມຕໍ່ລະບົບຊຳລະເງິນພາຍນອກ (payment gateway)
- ການຈັດສົ່ງ / logistics
- e-commerce frontend ສຳລັບລູກຄ້າ

## Tech Stack
- Backend: NestJS (TypeScript) + Prisma ORM — `back/`
- Frontend: Vue 3 (Vite, Pinia, Vue Router) — `front/`
- Database: MySQL / PostgreSQL
- Auth: JWT + RolesGuard (admin/staff); OTP for registration