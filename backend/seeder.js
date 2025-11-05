const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Default product image
const defaultImage = {
  url: 'https://res.cloudinary.com/dtpf2xqqb/image/upload/v1762378007/product-image-placeholder_fnwxw1.jpg',
  public_id: 'product-image-placeholder',
};

// Demo Users
const users = [
  {
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
    isVerified: true,
    isApproved: true,
  },
  {
    name: 'John Electronics',
    email: 'vendor1@demo.com',
    password: 'vendor123',
    role: 'vendor',
    shopName: 'TechHub Electronics',
    shopDescription: 'Your one-stop shop for cutting-edge electronics and gadgets. We offer the latest technology at competitive prices.',
    isApproved: true,
    isVerified: true,
    vendorRating: 4.8,
  },
  {
    name: 'Sarah Fashion',
    email: 'vendor2@demo.com',
    password: 'vendor123',
    role: 'vendor',
    shopName: 'StyleCraft Fashion',
    shopDescription: 'Premium fashion and accessories for the modern lifestyle. Curated collections from around the world.',
    isApproved: true,
    isVerified: true,
    vendorRating: 4.6,
  },
  {
    name: 'Mike HomeGoods',
    email: 'vendor3@demo.com',
    password: 'vendor123',
    role: 'vendor',
    shopName: 'HomeComfort Store',
    shopDescription: 'Quality home and garden products to make your house a home. From furniture to decor.',
    isApproved: true,
    isVerified: true,
    vendorRating: 4.7,
  },
  {
    name: 'Emma Sports',
    email: 'vendor4@demo.com',
    password: 'vendor123',
    role: 'vendor',
    shopName: 'ActiveLife Sports',
    shopDescription: 'Professional sports equipment and fitness gear. Get fit, stay active!',
    isApproved: true,
    isVerified: true,
    vendorRating: 4.9,
  },
  {
    name: 'David Books',
    email: 'vendor5@demo.com',
    password: 'vendor123',
    role: 'vendor',
    shopName: 'BookHaven',
    shopDescription: 'A treasure trove of books from classics to bestsellers. Feed your mind.',
    isApproved: true,
    isVerified: true,
    vendorRating: 4.5,
  },
  {
    name: 'Lisa Health',
    email: 'vendor6@demo.com',
    password: 'vendor123',
    role: 'vendor',
    shopName: 'WellnessHub',
    shopDescription: 'Natural health products and supplements for a better you.',
    isApproved: true,
    isVerified: true,
    vendorRating: 4.8,
  },
  {
    name: 'Customer One',
    email: 'customer1@demo.com',
    password: 'customer123',
    role: 'customer',
    phone: '+1 (555) 123-4567',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
  },
  {
    name: 'Customer Two',
    email: 'customer2@demo.com',
    password: 'customer123',
    role: 'customer',
    phone: '+1 (555) 234-5678',
    address: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
    },
  },
  {
    name: 'Customer Three',
    email: 'customer3@demo.com',
    password: 'customer123',
    role: 'customer',
    phone: '+1 (555) 345-6789',
    address: {
      street: '789 Pine Road',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA',
    },
  },
  {
    name: 'Alice Johnson',
    email: 'customer4@demo.com',
    password: 'customer123',
    role: 'customer',
  },
  {
    name: 'Bob Smith',
    email: 'customer5@demo.com',
    password: 'customer123',
    role: 'customer',
  },
];

// Demo Products - Electronics
const electronicsProducts = [
  {
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with active noise cancellation. Enjoy crystal-clear audio with 30-hour battery life. Perfect for music lovers and professionals.',
    price: 299.99,
    comparePrice: 399.99,
    category: 'Electronics',
    stock: 50,
    tags: ['audio', 'wireless', 'noise-cancelling', 'bluetooth'],
    specifications: {
      'Battery Life': '30 hours',
      'Bluetooth Version': '5.0',
      'Weight': '250g',
      'Color': 'Black',
    },
  },
  {
    name: 'Smart Watch Pro',
    description: 'Advanced fitness tracking smartwatch with heart rate monitor, GPS, and sleep tracking. Stay connected with notifications and calls on your wrist.',
    price: 249.99,
    comparePrice: 349.99,
    category: 'Electronics',
    stock: 75,
    tags: ['smartwatch', 'fitness', 'health', 'wearable'],
    specifications: {
      'Display': '1.4 inch AMOLED',
      'Water Resistance': '5ATM',
      'Battery': '7 days',
    },
  },
  {
    name: '4K Ultra HD Webcam',
    description: 'Professional-grade webcam for streaming and video calls. Features auto-focus, low-light correction, and dual microphones for superior audio quality.',
    price: 149.99,
    comparePrice: 199.99,
    category: 'Electronics',
    stock: 40,
    tags: ['webcam', '4k', 'streaming', 'video'],
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Waterproof portable speaker with 360-degree sound. Perfect for outdoor adventures with 24-hour battery life and rugged design.',
    price: 79.99,
    comparePrice: 129.99,
    category: 'Electronics',
    stock: 100,
    tags: ['speaker', 'bluetooth', 'portable', 'waterproof'],
  },
  {
    name: 'Wireless Gaming Mouse',
    description: 'High-precision gaming mouse with customizable RGB lighting and 16000 DPI sensor. Designed for competitive gaming with programmable buttons.',
    price: 89.99,
    category: 'Electronics',
    stock: 60,
    tags: ['gaming', 'mouse', 'wireless', 'rgb'],
  },
  {
    name: 'USB-C Hub Multi-Port Adapter',
    description: '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and power delivery. Essential accessory for modern laptops.',
    price: 49.99,
    category: 'Electronics',
    stock: 120,
    tags: ['usb-c', 'hub', 'adapter', 'accessories'],
  },
  {
    name: 'Mechanical Keyboard RGB',
    description: 'Premium mechanical keyboard with Cherry MX switches and customizable RGB backlighting. Built for gamers and typists who demand the best.',
    price: 159.99,
    comparePrice: 199.99,
    category: 'Electronics',
    stock: 45,
    tags: ['keyboard', 'mechanical', 'gaming', 'rgb'],
  },
  {
    name: 'Wireless Charging Pad',
    description: 'Fast wireless charging station compatible with all Qi-enabled devices. Sleek design with LED indicator and over-charge protection.',
    price: 34.99,
    category: 'Electronics',
    stock: 150,
    tags: ['wireless', 'charging', 'qi', 'fast-charge'],
  },
];

// Demo Products - Fashion
const fashionProducts = [
  {
    name: 'Premium Leather Jacket',
    description: 'Genuine leather jacket with modern fit. Handcrafted with attention to detail, featuring premium zippers and interior lining. A timeless wardrobe essential.',
    price: 299.99,
    comparePrice: 499.99,
    category: 'Fashion',
    stock: 30,
    tags: ['jacket', 'leather', 'outerwear', 'premium'],
  },
  {
    name: 'Designer Sunglasses',
    description: 'UV400 protection polarized sunglasses with metal frame. Combines style and eye protection with scratch-resistant lenses.',
    price: 129.99,
    comparePrice: 199.99,
    category: 'Fashion',
    stock: 80,
    tags: ['sunglasses', 'eyewear', 'accessories', 'uv-protection'],
  },
  {
    name: 'Casual Denim Jeans',
    description: 'Comfortable slim-fit jeans made from premium denim. Perfect stretch for all-day comfort with classic 5-pocket design.',
    price: 79.99,
    category: 'Fashion',
    stock: 100,
    tags: ['jeans', 'denim', 'casual', 'pants'],
  },
  {
    name: 'Elegant Silk Scarf',
    description: 'Luxurious 100% silk scarf with artistic print. Versatile accessory that adds sophistication to any outfit.',
    price: 59.99,
    comparePrice: 89.99,
    category: 'Fashion',
    stock: 60,
    tags: ['scarf', 'silk', 'accessories', 'luxury'],
  },
  {
    name: 'Classic Leather Belt',
    description: 'Genuine leather belt with reversible design. Features premium buckle and comes in black and brown.',
    price: 49.99,
    category: 'Fashion',
    stock: 90,
    tags: ['belt', 'leather', 'accessories', 'classic'],
  },
  {
    name: 'Cotton Polo Shirt',
    description: 'Premium cotton polo shirt in various colors. Breathable fabric with modern fit, perfect for casual and smart-casual occasions.',
    price: 39.99,
    category: 'Fashion',
    stock: 120,
    tags: ['polo', 'shirt', 'cotton', 'casual'],
  },
  {
    name: 'Canvas Sneakers',
    description: 'Comfortable canvas sneakers with rubber sole. Classic design that pairs well with any casual outfit.',
    price: 69.99,
    category: 'Fashion',
    stock: 85,
    tags: ['sneakers', 'shoes', 'canvas', 'casual'],
  },
  {
    name: 'Wool Blend Winter Coat',
    description: 'Warm wool blend coat perfect for cold weather. Features front button closure and side pockets. Available in multiple colors.',
    price: 199.99,
    comparePrice: 299.99,
    category: 'Fashion',
    stock: 40,
    tags: ['coat', 'winter', 'wool', 'outerwear'],
  },
];

// Demo Products - Home & Garden
const homeProducts = [
  {
    name: 'Ergonomic Office Chair',
    description: 'Professional office chair with lumbar support and adjustable height. Breathable mesh back and cushioned seat for all-day comfort.',
    price: 249.99,
    comparePrice: 349.99,
    category: 'Home & Garden',
    stock: 35,
    tags: ['chair', 'office', 'furniture', 'ergonomic'],
  },
  {
    name: 'Modern Table Lamp',
    description: 'Elegant LED table lamp with touch control and adjustable brightness. Energy-efficient with contemporary design.',
    price: 59.99,
    category: 'Home & Garden',
    stock: 70,
    tags: ['lamp', 'lighting', 'led', 'modern'],
  },
  {
    name: 'Ceramic Dinnerware Set',
    description: '16-piece ceramic dinnerware set for 4. Includes dinner plates, salad plates, bowls, and mugs. Microwave and dishwasher safe.',
    price: 89.99,
    comparePrice: 129.99,
    category: 'Home & Garden',
    stock: 50,
    tags: ['dinnerware', 'ceramic', 'kitchenware', 'dishes'],
  },
  {
    name: 'Artificial Indoor Plant',
    description: 'Lifelike artificial plant in decorative pot. No maintenance required, perfect for adding greenery to any room.',
    price: 34.99,
    category: 'Home & Garden',
    stock: 100,
    tags: ['plant', 'artificial', 'decoration', 'indoor'],
  },
  {
    name: 'Memory Foam Pillow Set',
    description: 'Set of 2 premium memory foam pillows with cooling gel. Provides optimal neck support for a better night\'s sleep.',
    price: 69.99,
    comparePrice: 99.99,
    category: 'Home & Garden',
    stock: 80,
    tags: ['pillow', 'memory-foam', 'bedding', 'sleep'],
  },
  {
    name: 'Stainless Steel Cookware Set',
    description: '10-piece professional stainless steel cookware set. Includes pots, pans, and lids. Compatible with all cooktops.',
    price: 199.99,
    comparePrice: 299.99,
    category: 'Home & Garden',
    stock: 40,
    tags: ['cookware', 'stainless-steel', 'kitchen', 'pots'],
  },
  {
    name: 'Wall-Mounted Shelf Set',
    description: 'Set of 3 floating shelves made from quality wood. Easy to install, perfect for displaying books, photos, and decorations.',
    price: 44.99,
    category: 'Home & Garden',
    stock: 65,
    tags: ['shelves', 'storage', 'wall-mount', 'decor'],
  },
  {
    name: 'Garden Tool Set',
    description: 'Complete 10-piece garden tool set with carrying bag. Includes trowel, pruner, rake, and more for all your gardening needs.',
    price: 79.99,
    category: 'Home & Garden',
    stock: 55,
    tags: ['garden', 'tools', 'outdoor', 'gardening'],
  },
];

// Demo Products - Sports
const sportsProducts = [
  {
    name: 'Yoga Mat with Carrying Strap',
    description: 'Non-slip yoga mat with extra cushioning. Eco-friendly material, perfect for yoga, pilates, and floor exercises.',
    price: 39.99,
    category: 'Sports',
    stock: 90,
    tags: ['yoga', 'mat', 'exercise', 'fitness'],
  },
  {
    name: 'Adjustable Dumbbell Set',
    description: 'Space-saving adjustable dumbbells with weight range from 5-50 lbs. Perfect for home gym workouts.',
    price: 299.99,
    comparePrice: 399.99,
    category: 'Sports',
    stock: 30,
    tags: ['dumbbells', 'weights', 'fitness', 'strength'],
  },
  {
    name: 'Professional Jump Rope',
    description: 'Speed jump rope with ball bearings for smooth rotation. Adjustable length with comfortable handles.',
    price: 19.99,
    category: 'Sports',
    stock: 120,
    tags: ['jump-rope', 'cardio', 'fitness', 'exercise'],
  },
  {
    name: 'Resistance Bands Set',
    description: 'Set of 5 resistance bands with different resistance levels. Includes door anchor and carrying pouch.',
    price: 29.99,
    category: 'Sports',
    stock: 100,
    tags: ['resistance-bands', 'exercise', 'fitness', 'training'],
  },
  {
    name: 'Sports Water Bottle',
    description: '32oz stainless steel water bottle with insulation. Keeps drinks cold for 24 hours, hot for 12 hours.',
    price: 24.99,
    category: 'Sports',
    stock: 150,
    tags: ['water-bottle', 'hydration', 'sports', 'insulated'],
  },
  {
    name: 'Running Armband Phone Holder',
    description: 'Adjustable armband for smartphones. Sweat-resistant with touchscreen-compatible window.',
    price: 14.99,
    category: 'Sports',
    stock: 110,
    tags: ['armband', 'phone-holder', 'running', 'accessories'],
  },
  {
    name: 'Foam Roller for Muscle Recovery',
    description: 'High-density foam roller for deep tissue massage. Helps reduce muscle soreness and improve flexibility.',
    price: 34.99,
    category: 'Sports',
    stock: 75,
    tags: ['foam-roller', 'recovery', 'massage', 'fitness'],
  },
  {
    name: 'Basketball Official Size',
    description: 'Professional-grade basketball with superior grip. Suitable for indoor and outdoor play.',
    price: 29.99,
    category: 'Sports',
    stock: 85,
    tags: ['basketball', 'ball', 'sports', 'outdoor'],
  },
];

// Demo Products - Books
const booksProducts = [
  {
    name: 'The Complete Guide to Web Development',
    description: 'Comprehensive guide covering HTML, CSS, JavaScript, and modern frameworks. Perfect for beginners and intermediate developers.',
    price: 49.99,
    comparePrice: 69.99,
    category: 'Books',
    stock: 60,
    tags: ['programming', 'web-development', 'education', 'technology'],
  },
  {
    name: 'Mindfulness and Meditation',
    description: 'Practical guide to mindfulness and meditation techniques. Learn to reduce stress and improve mental clarity.',
    price: 24.99,
    category: 'Books',
    stock: 80,
    tags: ['self-help', 'meditation', 'wellness', 'mindfulness'],
  },
  {
    name: 'The Art of Photography',
    description: 'Master photography techniques from composition to post-processing. Includes stunning visual examples.',
    price: 39.99,
    category: 'Books',
    stock: 50,
    tags: ['photography', 'art', 'education', 'creative'],
  },
  {
    name: 'Business Strategy Essentials',
    description: 'Essential strategies for building and growing successful businesses. Real-world case studies included.',
    price: 34.99,
    category: 'Books',
    stock: 70,
    tags: ['business', 'strategy', 'management', 'entrepreneurship'],
  },
  {
    name: 'Healthy Cooking Made Easy',
    description: '100+ delicious healthy recipes with nutritional information. Perfect for busy professionals and families.',
    price: 29.99,
    category: 'Books',
    stock: 90,
    tags: ['cookbook', 'healthy', 'recipes', 'cooking'],
  },
  {
    name: 'Mystery Novel Collection',
    description: 'Bestselling mystery novel that will keep you guessing until the last page. Perfect for thriller enthusiasts.',
    price: 19.99,
    category: 'Books',
    stock: 100,
    tags: ['fiction', 'mystery', 'thriller', 'novel'],
  },
  {
    name: 'Personal Finance Handbook',
    description: 'Complete guide to managing personal finances, investing, and building wealth. Practical advice for all income levels.',
    price: 27.99,
    category: 'Books',
    stock: 75,
    tags: ['finance', 'money', 'investing', 'personal-development'],
  },
  {
    name: 'World History Atlas',
    description: 'Comprehensive atlas covering world history from ancient civilizations to modern times. Beautifully illustrated.',
    price: 44.99,
    comparePrice: 59.99,
    category: 'Books',
    stock: 45,
    tags: ['history', 'atlas', 'education', 'reference'],
  },
];

// Demo Products - Health
const healthProducts = [
  {
    name: 'Premium Multivitamin Complex',
    description: 'Complete daily multivitamin with essential vitamins and minerals. Supports immune system and overall health.',
    price: 34.99,
    category: 'Health',
    stock: 100,
    tags: ['vitamins', 'supplements', 'health', 'wellness'],
  },
  {
    name: 'Organic Protein Powder',
    description: 'Plant-based protein powder with 25g protein per serving. Non-GMO, gluten-free, available in vanilla and chocolate.',
    price: 49.99,
    comparePrice: 64.99,
    category: 'Health',
    stock: 80,
    tags: ['protein', 'supplements', 'fitness', 'organic'],
  },
  {
    name: 'Essential Oil Diffuser',
    description: 'Ultrasonic aromatherapy diffuser with LED lights. Creates a relaxing atmosphere while purifying the air.',
    price: 39.99,
    category: 'Health',
    stock: 70,
    tags: ['diffuser', 'aromatherapy', 'wellness', 'essential-oils'],
  },
  {
    name: 'Digital Blood Pressure Monitor',
    description: 'Automatic blood pressure monitor with large display. Tracks and stores readings for health monitoring.',
    price: 59.99,
    category: 'Health',
    stock: 50,
    tags: ['blood-pressure', 'monitor', 'health', 'medical'],
  },
  {
    name: 'Herbal Tea Variety Pack',
    description: 'Collection of 6 organic herbal teas. Includes chamomile, peppermint, green tea, and more. Caffeine-free options available.',
    price: 24.99,
    category: 'Health',
    stock: 120,
    tags: ['tea', 'herbal', 'organic', 'wellness'],
  },
  {
    name: 'Collagen Supplement Capsules',
    description: 'Hydrolyzed collagen for skin, hair, and joint health. 90 capsules, 30-day supply.',
    price: 44.99,
    category: 'Health',
    stock: 90,
    tags: ['collagen', 'supplements', 'beauty', 'health'],
  },
  {
    name: 'Massage Gun for Deep Tissue',
    description: 'Percussion massage gun with 5 speed levels and multiple attachments. Relieves muscle tension and soreness.',
    price: 129.99,
    comparePrice: 179.99,
    category: 'Health',
    stock: 40,
    tags: ['massage', 'recovery', 'wellness', 'muscle'],
  },
  {
    name: 'Sleep Aid Supplement',
    description: 'Natural sleep support with melatonin, magnesium, and herbal extracts. Non-habit forming formula.',
    price: 29.99,
    category: 'Health',
    stock: 100,
    tags: ['sleep', 'supplements', 'wellness', 'natural'],
  },
];

// Demo Products - Automotive
const automotiveProducts = [
  {
    name: 'Car Phone Mount Holder',
    description: 'Universal car phone mount with strong suction. 360-degree rotation for optimal viewing angle.',
    price: 19.99,
    category: 'Automotive',
    stock: 130,
    tags: ['car', 'phone-mount', 'accessories', 'holder'],
  },
  {
    name: 'Portable Car Vacuum Cleaner',
    description: 'Powerful handheld vacuum for car interiors. Includes multiple attachments and 16ft power cord.',
    price: 49.99,
    category: 'Automotive',
    stock: 60,
    tags: ['vacuum', 'car-cleaning', 'automotive', 'portable'],
  },
  {
    name: 'LED Headlight Bulbs',
    description: 'Ultra-bright LED headlight conversion kit. Easy installation with 50,000-hour lifespan.',
    price: 79.99,
    comparePrice: 99.99,
    category: 'Automotive',
    stock: 45,
    tags: ['led', 'headlights', 'car-parts', 'lighting'],
  },
  {
    name: 'Dash Cam with Night Vision',
    description: 'Full HD dash camera with loop recording and G-sensor. Includes 32GB SD card.',
    price: 89.99,
    category: 'Automotive',
    stock: 55,
    tags: ['dashcam', 'camera', 'safety', 'automotive'],
  },
  {
    name: 'Emergency Car Kit',
    description: 'Complete roadside emergency kit with jumper cables, flashlight, first aid supplies, and more.',
    price: 39.99,
    category: 'Automotive',
    stock: 70,
    tags: ['emergency', 'safety', 'car-kit', 'roadside'],
  },
  {
    name: 'Car Air Freshener Set',
    description: 'Premium car air fresheners in multiple scents. Long-lasting fragrance, pack of 6.',
    price: 14.99,
    category: 'Automotive',
    stock: 150,
    tags: ['air-freshener', 'car-accessories', 'fragrance', 'automotive'],
  },
];

// Demo Products - Other/Toys
const otherProducts = [
  {
    name: 'Educational Building Blocks Set',
    description: '200-piece building blocks set for creative play. Safe, non-toxic materials suitable for ages 3+.',
    price: 34.99,
    category: 'Toys',
    stock: 80,
    tags: ['toys', 'educational', 'building-blocks', 'kids'],
  },
  {
    name: 'Remote Control Car',
    description: 'High-speed RC car with rechargeable battery. Durable design perfect for indoor and outdoor racing.',
    price: 59.99,
    category: 'Toys',
    stock: 65,
    tags: ['rc-car', 'toys', 'remote-control', 'kids'],
  },
  {
    name: 'Art Supplies Kit',
    description: 'Complete art set with colored pencils, markers, crayons, and sketch pad. Perfect for young artists.',
    price: 29.99,
    category: 'Toys',
    stock: 90,
    tags: ['art', 'supplies', 'drawing', 'kids'],
  },
  {
    name: 'Board Game Family Pack',
    description: 'Classic strategy board game for 2-6 players. Fun for the whole family, ages 8+.',
    price: 39.99,
    category: 'Toys',
    stock: 70,
    tags: ['board-game', 'family', 'entertainment', 'games'],
  },
  {
    name: 'Puzzle 1000 Pieces',
    description: 'Challenging jigsaw puzzle with beautiful landscape image. Great for relaxation and mental exercise.',
    price: 24.99,
    category: 'Other',
    stock: 85,
    tags: ['puzzle', 'jigsaw', 'entertainment', 'hobby'],
  },
  {
    name: 'Portable Picnic Blanket',
    description: 'Waterproof picnic blanket with carrying handle. Folds compactly, perfect for outdoor activities.',
    price: 29.99,
    category: 'Other',
    stock: 95,
    tags: ['picnic', 'blanket', 'outdoor', 'camping'],
  },
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});

    // Hash passwords for users
    console.log('Creating users...');
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ ${createdUsers.length} users created`);

    // Get vendor IDs
    const vendors = createdUsers.filter((user) => user.role === 'vendor');
    const customers = createdUsers.filter((user) => user.role === 'customer');

    // Assign products to vendors
    console.log('Creating products...');
    const allProducts = [
      ...electronicsProducts,
      ...fashionProducts,
      ...homeProducts,
      ...sportsProducts,
      ...booksProducts,
      ...healthProducts,
      ...automotiveProducts,
      ...otherProducts,
    ];

    const productsWithVendors = allProducts.map((product, index) => {
      const vendorIndex = index % vendors.length;
      return {
        ...product,
        vendor: vendors[vendorIndex]._id,
        images: [defaultImage],
        rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3-5
        numReviews: Math.floor(Math.random() * 50) + 5, // Random reviews 5-55
        sold: Math.floor(Math.random() * 100), // Random sold count
      };
    });

    const createdProducts = await Product.insertMany(productsWithVendors);
    console.log(`✅ ${createdProducts.length} products created`);

    // Create reviews
    console.log('Creating reviews...');
    const reviewsToCreate = [];
    
    for (let i = 0; i < 200; i++) {
      const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      
      reviewsToCreate.push({
        product: randomProduct._id,
        user: randomCustomer._id,
        rating: Math.floor(Math.random() * 3) + 3, // Rating between 3-5
comment: getRandomReview(),
});
}

const createdReviews = await Review.insertMany(reviewsToCreate);
console.log(`✅ ${createdReviews.length} reviews created`);

// Update product ratings based on reviews
console.log('Updating product ratings...');
for (const product of createdProducts) {
  const productReviews = createdReviews.filter(
    (review) => review.product.toString() === product._id.toString()
  );
  
  if (productReviews.length > 0) {
    const avgRating =
      productReviews.reduce((acc, review) => acc + review.rating, 0) /
      productReviews.length;
    
    await Product.findByIdAndUpdate(product._id, {
      rating: avgRating.toFixed(1),
      numReviews: productReviews.length,
    });
  }
}

// Create orders
console.log('Creating orders...');
const ordersToCreate = [];
const orderStatuses = ['pending', 'processing', 'shipped', 'delivered'];

for (let i = 0; i < 50; i++) {
  const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
  const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
  const orderItems = [];
  
  for (let j = 0; j < numItems; j++) {
    const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    
    orderItems.push({
      product: randomProduct._id,
      vendor: randomProduct.vendor,
      name: randomProduct.name,
      quantity,
      image: randomProduct.images[0].url,
      price: randomProduct.price,
    });
  }
  
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const taxPrice = itemsPrice * 0.1;
  const shippingPrice = 10;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;
  
  const randomStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
  const isPaid = randomStatus !== 'pending';
  
  ordersToCreate.push({
    user: randomCustomer._id,
    orderItems,
    shippingAddress: randomCustomer.address || {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    paymentMethod: 'stripe',
    paymentResult: isPaid ? {
      id: `pi_${Math.random().toString(36).substr(2, 9)}`,
      status: 'succeeded',
      update_time: new Date().toISOString(),
      email_address: randomCustomer.email,
    } : {},
    itemsPrice: itemsPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
    isPaid,
    paidAt: isPaid ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
    status: randomStatus,
    isDelivered: randomStatus === 'delivered',
    deliveredAt: randomStatus === 'delivered' 
      ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000) 
      : null,
    createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Last 60 days
  });
}

const createdOrders = await Order.insertMany(ordersToCreate);
console.log(`✅ ${createdOrders.length} orders created`);

console.log('\n🎉 Database seeded successfully!');
console.log('\n📊 Summary:');
console.log(`   Users: ${createdUsers.length}`);
console.log(`   - Admins: 1`);
console.log(`   - Vendors: ${vendors.length}`);
console.log(`   - Customers: ${customers.length}`);
console.log(`   Products: ${createdProducts.length}`);
console.log(`   Reviews: ${createdReviews.length}`);
console.log(`   Orders: ${createdOrders.length}`);

console.log('\n🔑 Login Credentials:');
console.log('   Admin: admin@demo.com / admin123');
console.log('   Vendor: vendor1@demo.com / vendor123');
console.log('   Customer: customer1@demo.com / customer123');

process.exit(0);
} catch (error) {
console.error('❌ Error seeding database:', error);
process.exit(1);
}
};
// Helper function to generate random reviews
function getRandomReview() {
const reviews = [
'Excellent product! Exactly as described and arrived quickly.',
'Great quality for the price. Very satisfied with my purchase.',
'Good product but took longer to arrive than expected.',
'Amazing! Would definitely recommend to others.',
'Decent product, does what its supposed to do.',
'Love it! Better than I expected from the pictures.',
'Good value for money. Happy with the quality.',
'Works perfectly! No complaints at all.',
'Nice product but packaging could be better.',
'Fantastic! Exceeded my expectations in every way.',
'Very pleased with this purchase. Will buy again.',
'Product is okay, nothing special but functional.',
'Impressed with the quality and fast shipping.',
'Exactly what I needed. Highly recommend!',
'Good product overall. Minor issues but manageable.',
'Outstanding quality! Worth every penny.',
'Perfect! Just what I was looking for.',
'Satisfied with the purchase. Good customer service too.',
'Nice addition to my collection. Very happy!',
'Works as advertised. No issues so far.',
'Great find! The quality is impressive.',
'Good product but wish it came in more colors.',
'Excellent! Fast delivery and great packaging.',
'Very good quality. Looks exactly like the pictures.',
'Happy with this purchase. Recommend to everyone!',
'Solid product. Does the job well.',
'Love the design and functionality!',
'Good purchase. Met all my expectations.',
'Fantastic product! Will definitely buy from this seller again.',
'Pretty good overall. A few minor flaws but still satisfied.',
];
return reviews[Math.floor(Math.random() * reviews.length)];
}
// Run the seeder
seedDatabase();