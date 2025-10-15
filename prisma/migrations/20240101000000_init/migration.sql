-- Migration initiale pour Letsdoo
-- Cette migration a été générée manuellement pour l'exemple
CREATE TYPE "Role" AS ENUM ('CLIENT','CREATOR','ADMIN');
CREATE TYPE "ProductType" AS ENUM ('MODULE','TEMPLATE','SCRIPT');
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT','REVIEW','PUBLISHED');
CREATE TYPE "OrderStatus" AS ENUM ('PAID','REFUND','FAILED');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'CLIENT',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Product" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "type" "ProductType" NOT NULL,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "descriptionMD" TEXT NOT NULL,
  "priceCents" INTEGER NOT NULL DEFAULT 0,
  "compatibility" JSONB NOT NULL,
  "tags" TEXT[] NOT NULL,
  "authorId" TEXT NOT NULL,
  "coverUrl" TEXT,
  "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Version" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "changelogMD" TEXT NOT NULL,
  "zipUrl" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Category" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE
);

CREATE TABLE "ProductCategory" (
  "productId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  PRIMARY KEY ("productId", "categoryId")
);

CREATE TABLE "Order" (
  "id" TEXT PRIMARY KEY,
  "buyerId" TEXT NOT NULL,
  "totalCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "status" "OrderStatus" NOT NULL DEFAULT 'PAID',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "OrderItem" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "unitPriceCents" INTEGER NOT NULL,
  "qty" INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE "Review" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "review_unique" UNIQUE ("productId","userId")
);

CREATE TABLE "Favorite" (
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  PRIMARY KEY ("userId","productId")
);

ALTER TABLE "Product" ADD CONSTRAINT "Product_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Version" ADD CONSTRAINT "Version_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE;
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE;
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE;
