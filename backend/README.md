<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## 🚀 SIAKAD Enterprise SaaS Backend

Tugas UAS RPL 1 - Service Backend berbasis **Laravel 12.x** dengan Arsitektur **Single Database Multi-Tenant**.

### 🛠️ Fitur Arsitektur & Database Backend
- **Global Auth Lookup**: Autentikasi terpusat (`global_users`) dengan lookup multi-sekolah (`global_user_schools`).
- **Multi-Tenant Isolation**: Laravel `SchoolScope` menyuntikkan `school_id` secara otomatis di semua query operasional.
- **Platform Admin Level**: Hierarki Super Admin platform (`platform_admins`) dengan level `super_admin`, `admin`, `support`, `billing`, `readonly`, serta impersonasi tenant.
- **Master Reference Tables**: Reference data (`master_religions`, `master_education_levels`, `master_status_kepegawaians`, `master_jenis_cutis`, `master_marital_statuses`, `master_school_types`, `master_blood_types`) dengan `school_id` nullable untuk shared platform default & custom override.
- **Fleksibilitas Internasional (i18n)**: Kolom `national_ids` & `address_details` berbasis `JSON` pada `gurus` dan `siswas`.
- **SaaS Billing & Subscriptions**: Sistem kupon diskon (`saas_coupons`, `saas_coupon_usages`), invoice dengan PPN/tax (`tax_rate`), dan snapshot penggunaan.
- **Sub-sistem LMS & Notifikasi**: Tabel LMS (`lms_courses`, `lms_quizzes`, dll), SaaS notification engine (`saas_notifications`), system audit logs, & backup tenant (`tenant_backups`).

---

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
