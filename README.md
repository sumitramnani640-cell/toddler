# Savers Grocery Admin Panel

A complete admin panel for Savers Grocery built with Node.js, Express.js, EJS, and MySQL.

## Features

### 🔐 Authentication
- Admin login/logout system
- Session-based authentication
- Password hashing with bcrypt

### 📊 Dashboard
- Overview statistics (products, categories, customers, banners)
- Recent products and customers display
- Quick action buttons

### 🛍️ Product Management
- CRUD operations for products
- Image upload with Multer
- Category association
- Stock management
- Status control (active/inactive)

### 🏷️ Category Management
- CRUD operations for categories
- Slug generation
- Product count display
- Status management

### 🖼️ Banner Management
- CRUD operations for banners
- Image upload functionality
- Status control for frontend display

### 👥 Customer Management
- View all registered customers
- Edit customer information
- Deactivate customers
- Customer statistics

### 🎨 Frontend
- Responsive design with Bootstrap
- Product showcase
- Category display
- Banner carousel

## Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: EJS templating
- **Database**: MySQL with Sequelize ORM
- **Authentication**: Express-session
- **File Upload**: Multer
- **Styling**: AdminLTE + Bootstrap
- **Password Hashing**: bcryptjs

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd savers-grocery-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Create a MySQL database named `savers_grocery`
   - Update database credentials in `.env` file

4. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   Update the `.env` file with your database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=savers_grocery
   DB_USER=root
   DB_PASSWORD=your_password
   SESSION_SECRET=your-secret-key
   PORT=3000
   ```

5. **Run the application**
   ```bash
   npm start
   ```

6. **Access the admin panel**
   - Open your browser and go to `http://localhost:3000/admin`
   - Default admin credentials:
     - Email: `admin@saversgrocery.com`
     - Password: `admin123`

## Project Structure

```
src/
├── app.js                 # Main application file
├── routes/
│   ├── admin.js          # Admin routes
│   └── frontend.js       # Frontend routes
├── controllers/
│   ├── admin/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── bannerController.js
│   │   └── customerController.js
│   └── frontend/
│       └── homeController.js
├── models/
│   ├── Admin.js
│   ├── Product.js
│   ├── Category.js
│   ├── Banner.js
│   ├── User.js
│   └── index.js
├── views/
│   ├── admin/
│   │   ├── login.ejs
│   │   ├── dashboard.ejs
│   │   ├── products/
│   │   ├── categories/
│   │   ├── banners/
│   │   └── customers/
│   ├── layouts/
│   │   └── admin.ejs
│   └── frontend/
│       └── home.ejs
└── seeders/
    ├── adminSeeder.js
    └── index.js
```

## Database Tables

### admins
- `id` (Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)
- `role` (ENUM: admin, super_admin)
- `status` (ENUM: active, inactive)
- `createdAt`, `updatedAt` (Timestamps)

### products
- `id` (Primary Key)
- `name` (VARCHAR)
- `description` (TEXT)
- `price` (DECIMAL)
- `stock` (INTEGER)
- `image` (VARCHAR)
- `category_id` (Foreign Key)
- `status` (ENUM: active, inactive)
- `createdAt`, `updatedAt` (Timestamps)

### categories
- `id` (Primary Key)
- `name` (VARCHAR)
- `slug` (VARCHAR, Unique)
- `description` (TEXT)
- `status` (ENUM: active, inactive)
- `createdAt`, `updatedAt` (Timestamps)

### banners
- `id` (Primary Key)
- `title` (VARCHAR)
- `image` (VARCHAR)
- `status` (ENUM: active, inactive)
- `createdAt`, `updatedAt` (Timestamps)

### users
- `id` (Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `phone` (VARCHAR)
- `password` (VARCHAR, Hashed)
- `status` (ENUM: active, inactive)
- `createdAt`, `updatedAt` (Timestamps)

## API Routes

### Admin Routes (Protected)
- `GET /admin` - Dashboard
- `GET /admin/login` - Login page
- `POST /admin/login` - Login process
- `POST /admin/logout` - Logout

### Product Management
- `GET /admin/products` - List products
- `GET /admin/products/create` - Create form
- `POST /admin/products` - Store product
- `GET /admin/products/:id` - Show product
- `GET /admin/products/:id/edit` - Edit form
- `PUT /admin/products/:id` - Update product
- `DELETE /admin/products/:id` - Delete product

### Category Management
- `GET /admin/categories` - List categories
- `GET /admin/categories/create` - Create form
- `POST /admin/categories` - Store category
- `GET /admin/categories/:id` - Show category
- `GET /admin/categories/:id/edit` - Edit form
- `PUT /admin/categories/:id` - Update category
- `DELETE /admin/categories/:id` - Delete category

### Banner Management
- `GET /admin/banners` - List banners
- `GET /admin/banners/create` - Create form
- `POST /admin/banners` - Store banner
- `GET /admin/banners/:id` - Show banner
- `GET /admin/banners/:id/edit` - Edit form
- `PUT /admin/banners/:id` - Update banner
- `DELETE /admin/banners/:id` - Delete banner

### Customer Management
- `GET /admin/customers` - List customers
- `GET /admin/customers/:id` - Show customer
- `GET /admin/customers/:id/edit` - Edit form
- `PUT /admin/customers/:id` - Update customer
- `DELETE /admin/customers/:id` - Deactivate customer

### Frontend Routes
- `GET /` - Home page

## Features in Detail

### File Upload
- Product and banner images are uploaded to `public/uploads/`
- Supported formats: JPG, PNG, GIF, WebP
- Maximum file size: 5MB
- Automatic file naming with timestamps

### Security Features
- Password hashing with bcrypt
- Session-based authentication
- CSRF protection
- Input validation
- File type validation

### User Experience
- Responsive design
- Flash messages for feedback
- Image previews
- Pagination for large datasets
- Search and filter capabilities

## Development

### Running in Development Mode
```bash
npm run dev
```

### Database Seeding
```bash
node src/seeders/index.js
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email admin@saversgrocery.com or create an issue in the repository.