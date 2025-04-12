const mongoose = require('mongoose');
const Category = require('../models/category.model');
const Product = require('../models/product.model');
const dbConfig = require('../config/db.config');

// Connect to MongoDB
mongoose.connect(dbConfig.mongoURI, dbConfig.options)
  .then(() => {
    console.log('MongoDB Connected');
    seedDatabase();
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Seed data function
async function seedDatabase() {
  try {
    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    
    console.log('Existing data cleared');
    
    // Create categories
    const categories = await Category.insertMany([
      {
        name: 'Beauty',
        slug: 'beauty',
        description: 'Beauty and personal care products',
        icon: 'fas fa-spa',
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Fashion and apparel products',
        icon: 'fas fa-tshirt',
        displayOrder: 2,
        isActive: true
      },
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronics and gadgets',
        icon: 'fas fa-mobile-alt',
        displayOrder: 3,
        isActive: true
      },
      {
        name: 'Baby & Kids',
        slug: 'baby',
        description: 'Products for babies and kids',
        icon: 'fas fa-baby',
        displayOrder: 4,
        isActive: true
      },
      {
        name: 'Home & Living',
        slug: 'home',
        description: 'Home and living products',
        icon: 'fas fa-home',
        displayOrder: 5,
        isActive: true
      }
    ]);
    
    console.log(`${categories.length} categories created`);
    
    // Create products
    const products = [];
    
    // Beauty products
    for (let i = 1; i <= 10; i++) {
        const baseCommission = 10 + (i % 5);
        const tiktokCommission = Math.round(baseCommission * 0.4 * 10000) / 100;
        const iboominCashback = Math.round(baseCommission * 0.6 * 10000) / 100;
        const totalCommission = tiktokCommission + iboominCashback;
        
        products.push({
          name: `BAISISI F${i} (C${i}) -Thai style bunga matahari batang transparan ${i} pasang bulu mata palsu / Eyelash / lem bulu mata`,
          description: `Bulu mata palsu kualitas premium dengan desain natural yang nyaman dipakai. Cocok untuk penggunaan sehari-hari maupun acara khusus. Beli 1 kotak dapat pinset atau beli 2 kotak dapat lem, pinset, sikat, microbrush, cincin lem.`,
          price: 20 + (i * 5),
          discountPrice: i % 3 === 0 ? (20 + (i * 5)) * 0.8 : 0,
          commission: baseCommission,
          commissionSources: [
            {
              name: 'TikTok Komisi',
              amount: tiktokCommission,
              rate: 10,
              icon: 'fab fa-tiktok'
            },
            {
              name: 'iBooming Cashback',
              amount: iboominCashback,
              rate: 1.66,
              icon: 'fas fa-circle'
            }
          ],
          totalCommission: totalCommission,
          category: categories[0]._id,
          image: `/images/products/beauty${i}.jpg`,
          images: [
            `/images/products/beauty${i}.jpg`,
            `/images/products/beauty${i}_2.jpg`,
            `/images/products/beauty${i}_3.jpg`
          ],
          bonusInfo: [
            {
              title: 'Beli 1 Kotak',
              description: 'FREE Pinset',
              image: '/images/accessories/pinset.jpg'
            },
            {
              title: 'Beli 2 Kotak',
              description: '(model sama/beda) FREE Lem+Pinset+Sikat+microbrush+cincin lem',
              image: '/images/accessories/accessories-kit.jpg'
            }
          ],
          specifications: [
            { label: 'Brand', value: 'BAISISI' },
            { label: 'Model', value: `F${i} (C${i})` },
            { label: 'Type', value: 'Thai style bunga matahari batang transparan' },
            { label: 'Jumlah', value: `${i} pasang bulu mata palsu` }
          ],
          howToUse: [
            'Bersihkan area mata dari makeup',
            'Ukur panjang bulu mata dan potong sesuai kebutuhan',
            'Oleskan lem pada garis bulu mata',
            'Tunggu hingga lem sedikit mengering (sekitar 30 detik)',
            'Pasang bulu mata palsu menggunakan pinset',
            'Tekan perlahan agar menempel dengan baik'
          ],
          affiliateLink: `https://affiliate.example.com/product/beauty${i}`,
          views: 500 + (i * 100),
          isViral: i % 5 === 0,
          isHot: i % 4 === 0,
          isTopRated: i % 3 === 0,
          isFeatured: i % 2 === 0,
          ratings: 3.5 + (i % 2),
          tags: ['beauty', 'bulu mata', 'eyelash', 'makeup']
        });
    }
    
    // Fashion products
    for (let i = 1; i <= 10; i++) {
      products.push({
        name: `Fashion Item ${i}`,
        description: `Trendy fashion item that will make you stand out. Made with high-quality materials and designed for comfort and style.`,
        price: 30 + (i * 8),
        discountPrice: i % 4 === 0 ? (30 + (i * 8)) * 0.75 : 0,
        commission: 12 + (i % 6),
        category: categories[1]._id,
        image: `/images/products/fashion${i}.jpg`,
        affiliateLink: `https://affiliate.example.com/product/fashion${i}`,
        views: 700 + (i * 120),
        isViral: i % 4 === 0,
        isHot: i % 5 === 0,
        isTopRated: i % 2 === 0,
        isFeatured: i % 3 === 0,
        ratings: 4.0 + (i % 2 * 0.5),
        tags: ['fashion', 'clothing', 'style']
      });
    }
    
    // Electronics products
    for (let i = 1; i <= 10; i++) {
      products.push({
        name: `Electronics Gadget ${i}`,
        description: `High-tech electronics gadget with the latest features. Perfect for tech enthusiasts who want the best performance and quality.`,
        price: 50 + (i * 15),
        discountPrice: i % 3 === 0 ? (50 + (i * 15)) * 0.85 : 0,
        commission: 8 + (i % 7),
        category: categories[2]._id,
        image: `/images/products/electronics${i}.jpg`,
        affiliateLink: `https://affiliate.example.com/product/electronics${i}`,
        views: 1000 + (i * 150),
        isViral: i % 3 === 0,
        isHot: i % 2 === 0,
        isTopRated: i % 4 === 0,
        isFeatured: i % 5 === 0,
        ratings: 3.8 + (i % 3 * 0.4),
        tags: ['electronics', 'gadgets', 'tech']
      });
    }
    
    // Baby & Kids products
    for (let i = 1; i <= 10; i++) {
      products.push({
        name: `Baby & Kids Product ${i}`,
        description: `Safe and high-quality product for babies and kids. Designed with child safety in mind and made from eco-friendly materials.`,
        price: 15 + (i * 6),
        discountPrice: i % 2 === 0 ? (15 + (i * 6)) * 0.8 : 0,
        commission: 15 + (i % 5),
        category: categories[3]._id,
        image: `/images/products/baby${i}.jpg`,
        affiliateLink: `https://affiliate.example.com/product/baby${i}`,
        views: 600 + (i * 80),
        isViral: i % 2 === 0,
        isHot: i % 3 === 0,
        isTopRated: i % 5 === 0,
        isFeatured: i % 4 === 0,
        ratings: 4.2 + (i % 2 * 0.3),
        tags: ['baby', 'kids', 'children']
      });
    }
    
    // Home & Living products
    for (let i = 1; i <= 10; i++) {
      products.push({
        name: `Home & Living Item ${i}`,
        description: `Elegant home and living product that enhances your living space. Combines functionality with beautiful design for the modern home.`,
        price: 25 + (i * 10),
        discountPrice: i % 3 === 0 ? (25 + (i * 10)) * 0.7 : 0,
        commission: 10 + (i % 8),
        category: categories[4]._id,
        image: `/images/products/home${i}.jpg`,
        affiliateLink: `https://affiliate.example.com/product/home${i}`,
        views: 800 + (i * 100),
        isViral: i % 5 === 0,
        isHot: i % 4 === 0,
        isTopRated: i % 3 === 0,
        isFeatured: i % 2 === 0,
        ratings: 4.0 + (i % 3 * 0.3),
        tags: ['home', 'living', 'decoration']
      });
    }
    
    // Insert products
    await Product.insertMany(products);
    console.log(`${products.length} products created`);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}