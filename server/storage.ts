import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  shops, type Shop, type InsertShop,
  wishlist, type Wishlist, type InsertWishlist,
  offers, type Offer, type InsertOffer,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// Fix type issues with session store
declare module 'express-session' {
  interface SessionStore {
    all?: any;
    clear?: any;
    length?: any;
    touch?: any;
  }
}

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product operations
  getProducts(category?: string): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsBySellerId(sellerId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Shop operations
  getShops(category?: string): Promise<Shop[]>;
  getShopById(id: number): Promise<Shop | undefined>;
  getShopsByOwnerId(ownerId: number): Promise<Shop[]>;
  createShop(shop: InsertShop): Promise<Shop>;
  updateShop(id: number, shop: Partial<InsertShop>): Promise<Shop | undefined>;

  // Wishlist operations
  getWishlistByUserId(userId: number): Promise<(Wishlist & { product: Product })[]>;
  addToWishlist(wishlistItem: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(id: number): Promise<boolean>;

  // Offer operations
  getOffers(): Promise<Offer[]>;
  getOffersByShopId(shopId: number): Promise<Offer[]>;
  createOffer(offer: InsertOffer): Promise<Offer>;

  // Order operations
  getOrdersByUserId(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrderById(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private shops: Map<number, Shop>;
  private wishlists: Map<number, Wishlist>;
  private offers: Map<number, Offer>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  
  sessionStore: session.SessionStore;
  private userIdCounter: number;
  private productIdCounter: number;
  private shopIdCounter: number;
  private wishlistIdCounter: number;
  private offerIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.shops = new Map();
    this.wishlists = new Map();
    this.offers = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    this.userIdCounter = 1;
    this.productIdCounter = 1;
    this.shopIdCounter = 1;
    this.wishlistIdCounter = 1;
    this.offerIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;

    // Initialize with some seed data for demo
    this.seedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getProducts(category?: string): Promise<Product[]> {
    let products = Array.from(this.products.values());
    if (category) {
      products = products.filter(product => product.category === category);
    }
    return products;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsBySellerId(sellerId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.sellerId === sellerId
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const now = new Date();
    const product: Product = { ...insertProduct, id, createdAt: now };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Shop methods
  async getShops(category?: string): Promise<Shop[]> {
    let shops = Array.from(this.shops.values());
    if (category) {
      shops = shops.filter(shop => shop.category === category);
    }
    return shops;
  }

  async getShopById(id: number): Promise<Shop | undefined> {
    return this.shops.get(id);
  }

  async getShopsByOwnerId(ownerId: number): Promise<Shop[]> {
    return Array.from(this.shops.values()).filter(
      (shop) => shop.ownerId === ownerId
    );
  }

  async createShop(insertShop: InsertShop): Promise<Shop> {
    const id = this.shopIdCounter++;
    const now = new Date();
    const shop: Shop = { ...insertShop, id, createdAt: now };
    this.shops.set(id, shop);
    return shop;
  }

  async updateShop(id: number, updates: Partial<InsertShop>): Promise<Shop | undefined> {
    const shop = this.shops.get(id);
    if (!shop) return undefined;

    const updatedShop = { ...shop, ...updates };
    this.shops.set(id, updatedShop);
    return updatedShop;
  }

  // Wishlist methods
  async getWishlistByUserId(userId: number): Promise<(Wishlist & { product: Product })[]> {
    const wishlistItems = Array.from(this.wishlists.values()).filter(
      (item) => item.userId === userId
    );

    return wishlistItems.map(item => {
      const product = this.products.get(item.productId);
      if (!product) {
        throw new Error(`Product not found for wishlist item: ${item.id}`);
      }
      return { ...item, product };
    });
  }

  async addToWishlist(insertWishlistItem: InsertWishlist): Promise<Wishlist> {
    const id = this.wishlistIdCounter++;
    const now = new Date();
    const wishlistItem: Wishlist = { ...insertWishlistItem, id, createdAt: now };
    this.wishlists.set(id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(id: number): Promise<boolean> {
    return this.wishlists.delete(id);
  }

  // Offer methods
  async getOffers(): Promise<Offer[]> {
    return Array.from(this.offers.values());
  }

  async getOffersByShopId(shopId: number): Promise<Offer[]> {
    return Array.from(this.offers.values()).filter(
      (offer) => offer.shopId === shopId
    );
  }

  async createOffer(insertOffer: InsertOffer): Promise<Offer> {
    const id = this.offerIdCounter++;
    const now = new Date();
    const offer: Offer = { ...insertOffer, id, createdAt: now };
    this.offers.set(id, offer);
    return offer;
  }

  // Order methods
  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }

  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    const order: Order = { ...insertOrder, id, createdAt: now };
    this.orders.set(id, order);

    // Create order items
    for (const item of items) {
      const itemId = this.orderItemIdCounter++;
      const orderItem: OrderItem = { ...item, id, orderId: id, createdAt: now };
      this.orderItems.set(itemId, orderItem);
    }

    return order;
  }

  async getOrderById(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const items = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id)
      .map(item => {
        const product = this.products.get(item.productId);
        if (!product) {
          throw new Error(`Product not found for order item: ${item.id}`);
        }
        return { ...item, product };
      });

    return { ...order, items };
  }

  // Seed some data for development
  private seedData() {
    // Create test users
    const hashedPassword = "$2a$10$eCUQyqOCxKA.Bm2q.JYtneJjD5NG2.vZdYi3WAjTYcXLyuR9LJX6W.bcfca5099b77778712"; // 'password123'
    
    // Buyer user
    const buyer: User = {
      id: this.userIdCounter++,
      username: "buyer",
      password: hashedPassword,
      fullName: "Regular Buyer",
      email: "buyer@example.com",
      isSeller: false,
      createdAt: new Date()
    };
    this.users.set(buyer.id, buyer);
    
    // Seller user
    const seller: User = {
      id: this.userIdCounter++,
      username: "seller",
      password: hashedPassword,
      fullName: "Local Seller",
      email: "seller@example.com",
      isSeller: true,
      createdAt: new Date()
    };
    this.users.set(seller.id, seller);
    
    // Create shops
    const bakeryShop: Shop = {
      id: this.shopIdCounter++,
      name: "Sarah's Bakery",
      ownerId: seller.id,
      description: "Fresh artisan bread, pastries and cakes baked daily with organic ingredients.",
      category: "Bakery",
      address: "123 Baker Street, Anytown, ST 12345",
      phone: "(555) 123-4567",
      email: "info@sarahsbakery.com",
      hours: "Mon-Fri: 7am-7pm, Sat-Sun: 8am-5pm",
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
      bannerUrl: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f",
      rating: 4.8,
      location: "40.7128,-74.0060",
      createdAt: new Date()
    };
    this.shops.set(bakeryShop.id, bakeryShop);
    
    const grocerShop: Shop = {
      id: this.shopIdCounter++,
      name: "Green Grocer",
      ownerId: seller.id,
      description: "Locally sourced organic produce, artisanal foods, and sustainable goods.",
      category: "Groceries",
      address: "456 Main Street, Anytown, ST 12345",
      phone: "(555) 234-5678",
      email: "info@greengrocer.com",
      hours: "Mon-Sat: 8am-8pm, Sun: 9am-6pm",
      imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e",
      bannerUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9",
      rating: 4.6,
      location: "40.7150,-74.0080",
      createdAt: new Date()
    };
    this.shops.set(grocerShop.id, grocerShop);
    
    // Create products
    const products = [
      {
        name: "Artisan Sourdough Bread",
        description: "Our signature sourdough bread made with a 100-year-old starter. Perfectly crusty outside and soft inside.",
        price: 699, // $6.99
        sellerId: seller.id,
        category: "Bakery",
        imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff",
        stock: 12
      },
      {
        name: "Chocolate Croissants (3-pack)",
        description: "Buttery, flaky croissants filled with rich chocolate. Perfect for breakfast or an afternoon treat.",
        price: 849, // $8.49
        sellerId: seller.id,
        category: "Bakery",
        imageUrl: "https://images.unsplash.com/photo-1600175074449-611d2a8dde29",
        stock: 8
      },
      {
        name: "Organic Wild Flower Honey",
        description: "Pure, raw honey from local wildflowers. Supports local beekeepers and has a complex, delicious flavor.",
        price: 1099, // $10.99
        sellerId: seller.id,
        category: "Groceries",
        imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150",
        stock: 15
      },
      {
        name: "Organic Apple Basket",
        description: "A mix of seasonal organic apples grown locally. Perfect for snacking, baking, or making homemade apple sauce.",
        price: 599, // $5.99
        sellerId: seller.id,
        category: "Groceries",
        imageUrl: "https://images.unsplash.com/photo-1569870499705-504209102861",
        stock: 20
      },
      {
        name: "Handmade Lavender Soap",
        description: "All-natural handmade soap with lavender essential oil. Gentle on skin and beautifully aromatic.",
        price: 599, // $5.99
        sellerId: seller.id,
        category: "Gifts",
        imageUrl: "https://images.unsplash.com/photo-1584727638096-042c45049ebe",
        stock: 10
      }
    ];
    
    for (const productData of products) {
      const product: Product = {
        ...productData,
        id: this.productIdCounter++,
        createdAt: new Date()
      };
      this.products.set(product.id, product);
    }
    
    // Create offers
    const offers = [
      {
        title: "Buy 2 Get 1 Free",
        description: "On all baked goods. Valid this Saturday and Sunday only.",
        type: "Weekend Special",
        shopId: bakeryShop.id
      },
      {
        title: "15% Off Your First Order",
        description: "Use code WELCOME15 at checkout for new customers only.",
        type: "New Customer",
        shopId: bakeryShop.id
      },
      {
        title: "Free Delivery on Orders Over $25",
        description: "For local addresses within 5 miles of our store.",
        type: "Delivery",
        shopId: grocerShop.id
      }
    ];
    
    for (const offerData of offers) {
      const offer: Offer = {
        ...offerData,
        id: this.offerIdCounter++,
        createdAt: new Date()
      };
      this.offers.set(offer.id, offer);
    }
  }
}

export const storage = new MemStorage();
