// src/controllers/admin/categoryController.js
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { Category, Product } = require("../../models");
const { Op } = require("sequelize");

/*UPLOAD FOLDERS*/
const categoryDir = path.join(process.cwd(), "public", "uploads", "categories");
const bannerDir = path.join(process.cwd(), "public", "uploads", "banner_image");

if (!fs.existsSync(categoryDir)) fs.mkdirSync(categoryDir, { recursive: true });
if (!fs.existsSync(bannerDir)) fs.mkdirSync(bannerDir, { recursive: true });

/* ---------------------------------------------
   MULTER STORAGE (choose destination by fieldname)
--------------------------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "banner_image") cb(null, bannerDir);
    else cb(null, categoryDir);
  },
  filename: (req, file, cb) => {
    const prefix = file.fieldname === "banner_image" ? "banner-" : "image-";
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, prefix + unique + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /^image\/(jpeg|jpg|png|gif|webp)$/;
  if (allowed.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only image files allowed (JPG, PNG, WEBP, GIF)"));
};

// accept up to one file each for 'image' and 'banner_image'
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).fields([
  { name: "image", maxCount: 1 },
  { name: "banner_image", maxCount: 1 }
]);

/* ---------------------------------------------
   UTILITIES
--------------------------------------------- */
function deleteFile(publicPath) {
  if (!publicPath) return;

  try {
    // Remove query string if any, and remove host if full URL provided
    const cleaned = publicPath.split("?")[0].replace(/^https?:\/\/[^/]+/, "");
    const rel = cleaned.replace(/^\/+/, ""); // remove leading slash(es)
    const full = path.join(process.cwd(), "public", rel);

    if (fs.existsSync(full)) {
      fs.unlinkSync(full);
      console.log("Deleted file:", full);
    } else {
      console.warn("File to delete not found:", full);
    }
  } catch (e) {
    console.error("deleteFile error:", e);
  }
}

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ---------------------------------------------
   CONTROLLER
--------------------------------------------- */
const categoryController = {
  index: async (req, res) => {
    try {
      const categories = await Category.findAll({
        include: [{ model: Product, as: "products", attributes: ["id"] }],
        order: [["createdAt", "DESC"]],
      });

      res.render("admin/categories/index", {
        title: "Categories - Admin",
        categories,
      });
    } catch (error) {
      console.error("Index error:", error);
      req.flash("error_msg", "Error loading categories");
      res.redirect("/admin/dashboard");
    }
  },

  create: (req, res) => {
    res.render("admin/categories/create", { title: "Add Category" });
  },

  /* ---------------------------------------------
     STORE CATEGORY (handle two uploads)
  --------------------------------------------- */
  store: (req, res) => {
    upload(req, res, async function (err) {
      if (err) {
        console.error("Upload Error:", err);
        req.flash("error_msg", err.message);
        return res.redirect("/admin/categories/create");
      }

      try {
        const { name, description, status } = req.body;

        if (!name || name.trim() === "") {
          req.flash("error_msg", "Category name is required");
          return res.redirect("/admin/categories/create");
        }

        let slug = slugify(req.body.slug || name);

        const exists = await Category.findOne({ where: { slug } });
        if (exists) {
          req.flash("error_msg", "Slug already exists");
          return res.redirect("/admin/categories/create");
        }

        // build file paths if uploaded
        const imageFile =
          req.files && req.files.image && req.files.image[0]
            ? `/uploads/categories/${req.files.image[0].filename}`
            : null;

        const bannerFile =
          req.files && req.files.banner_image && req.files.banner_image[0]
            ? `/uploads/banner_image/${req.files.banner_image[0].filename}`
            : null;

        await Category.create({
          name,
          slug,
          description: description || null,
          status: status || "active",
          image: imageFile,
          banner_image: bannerFile,
        });

        req.flash("success_msg", "Category created successfully");
        res.redirect("/admin/categories");
      } catch (error) {
        console.error("Store Error:", error);
        req.flash("error_msg", "Error creating category");
        res.redirect("/admin/categories/create");
      }
    });
  },

  /* ---------------------------------------------
     SHOW CATEGORY
  --------------------------------------------- */
  show: async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id, {
        include: [{ model: Product, as: "products", attributes: ["id", "name", "price"] }],
      });

      if (!category) {
        req.flash("error_msg", "Category not found");
        return res.redirect("/admin/categories");
      }

      res.render("admin/categories/show", {
        title: `View ${category.name}`,
        category,
      });
    } catch (error) {
      console.error("Show error:", error);
      req.flash("error_msg", "Error loading category");
      res.redirect("/admin/categories");
    }
  },

  /* ---------------------------------------------
     EDIT CATEGORY
  --------------------------------------------- */
  edit: async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category) {
        req.flash("error_msg", "Category not found");
        return res.redirect("/admin/categories");
      }

      res.render("admin/categories/edit", {
        title: `Edit ${category.name}`,
        category,
      });
    } catch (error) {
      console.error("Edit error:", error);
      req.flash("error_msg", "Error loading edit page");
      res.redirect("/admin/categories");
    }
  },

  /* ---------------------------------------------
     UPDATE CATEGORY (handle two uploads)
  --------------------------------------------- */
  update: (req, res) => {
    upload(req, res, async function (err) {
      if (err) {
        console.error("Upload error (update):", err);
        req.flash("error_msg", err.message);
        return res.redirect(`/admin/categories/${req.params.id}/edit`);
      }

      try {
        console.log("Update files:", req.files);
        console.log("Update body:", req.body);

        const category = await Category.findByPk(req.params.id);
        if (!category) {
          req.flash("error_msg", "Category not found");
          return res.redirect("/admin/categories");
        }

        const { name, description, status } = req.body;

        let slug = slugify(req.body.slug || name);
        const exists = await Category.findOne({
          where: { slug, id: { [Op.ne]: category.id } },
        });

        if (exists) {
          req.flash("error_msg", "Slug already exists");
          return res.redirect(`/admin/categories/${category.id}/edit`);
        }

        // handle regular image (stored in /uploads/categories)
        if (req.files && req.files.image && req.files.image[0]) {
          if (category.image) deleteFile(category.image);
          category.image = `/uploads/categories/${req.files.image[0].filename}`;
        }

        // handle banner image (stored in /uploads/banner_image)
        if (req.files && req.files.banner_image && req.files.banner_image[0]) {
          if (category.banner_image) deleteFile(category.banner_image);
          category.banner_image = `/uploads/banner_image/${req.files.banner_image[0].filename}`;
        }

        // update other fields
        category.name = name || category.name;
        category.slug = slug;
        category.description = typeof description !== "undefined" ? description : category.description;
        category.status = status || category.status;

        await category.save();

        req.flash("success_msg", "Category updated successfully");
        res.redirect("/admin/categories");
      } catch (error) {
        console.error("Update error:", error);
        req.flash("error_msg", "Error updating category");
        res.redirect(`/admin/categories/${req.params.id}/edit`);
      }
    });
  },

  /* ---------------------------------------------
     DELETE CATEGORY
  --------------------------------------------- */
  destroy: async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category) {
        req.flash("error_msg", "Category not found");
        return res.redirect("/admin/categories");
      }

      const count = await Product.count({ where: { category_id: category.id } });
      if (count > 0) {
        req.flash("error_msg", "Cannot delete category with products");
        return res.redirect("/admin/categories");
      }

      if (category.image) deleteFile(category.image);
      if (category.banner_image) deleteFile(category.banner_image);

      await category.destroy();

      req.flash("success_msg", "Category deleted successfully");
      res.redirect("/admin/categories");
    } catch (error) {
      console.error("Delete error:", error);
      req.flash("error_msg", "Error deleting");
      res.redirect("/admin/categories");
    }
  },
};

module.exports = categoryController;
