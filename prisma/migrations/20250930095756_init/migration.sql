-- CreateEnum
CREATE TYPE "public"."Level" AS ENUM ('UG', 'PG');

-- CreateEnum
CREATE TYPE "public"."DeliveryMode" AS ENUM ('online', 'offline', 'hybrid');

-- CreateTable
CREATE TABLE "public"."departments" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."courses" (
    "course_id" VARCHAR(20) NOT NULL,
    "course_name" VARCHAR(255) NOT NULL,
    "department_id" INTEGER NOT NULL,
    "level" "public"."Level" NOT NULL,
    "delivery_mode" "public"."DeliveryMode" NOT NULL,
    "credits" SMALLINT NOT NULL,
    "duration_weeks" SMALLINT NOT NULL,
    "rating" DECIMAL(2,1) NOT NULL,
    "tuition_fee_inr" DECIMAL(10,2) NOT NULL,
    "year_offered" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("course_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "public"."departments"("name");

-- CreateIndex
CREATE INDEX "courses_department_id_idx" ON "public"."courses"("department_id");

-- CreateIndex
CREATE INDEX "courses_level_idx" ON "public"."courses"("level");

-- CreateIndex
CREATE INDEX "courses_tuition_fee_inr_idx" ON "public"."courses"("tuition_fee_inr");

-- CreateIndex
CREATE INDEX "courses_rating_idx" ON "public"."courses"("rating");

-- CreateIndex
CREATE INDEX "courses_delivery_mode_idx" ON "public"."courses"("delivery_mode");

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
