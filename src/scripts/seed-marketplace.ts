import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import connectToDatabase from '../lib/mongodb';
import { Vendor } from '../models/Vendor';
import { Vehicle } from '../models/Vehicle';
import { Destination } from '../models/Destination';
import { User } from '../models/User';

const CITIES = [
  { name: 'Rishikesh', slug: 'rishikesh', state: 'Uttarakhand' },
  { name: 'Mussoorie', slug: 'mussoorie', state: 'Uttarakhand' },
  { name: 'Dehradun', slug: 'dehradun', state: 'Uttarakhand' },
  { name: 'Haridwar', slug: 'haridwar', state: 'Uttarakhand' },
  { name: 'Nainital', slug: 'nainital', state: 'Uttarakhand' },
  { name: 'Haldwani', slug: 'haldwani', state: 'Uttarakhand' },
];

const VEHICLE_TEMPLATES = [
  { brand: 'Royal Enfield', model: 'Himalayan 450', category: 'MOTORCYCLE', price: 1200, deposit: 2000, img: 'himalayan.jpg' },
  { brand: 'Royal Enfield', model: 'Classic 350', category: 'MOTORCYCLE', price: 950, deposit: 1500, img: 'classic350.jpg' },
  { brand: 'Hero', model: 'Xpulse 200T', category: 'MOTORCYCLE', price: 800, deposit: 1000, img: 'xpulse.jpg' },
  { brand: 'Honda', model: 'Activa 6G', category: 'SCOOTER', price: 450, deposit: 1000, img: 'activa6g.jpg' },
  { brand: 'TVS', model: 'Jupiter 125', category: 'SCOOTER', price: 460, deposit: 1000, img: 'jupiter.jpg' },
  { brand: 'Suzuki', model: 'Access 125', category: 'SCOOTER', price: 480, deposit: 1000, img: 'access.jpg' },
  { brand: 'Ather', model: '450X EV', category: 'EV', price: 550, deposit: 1000, img: 'ather.jpg' },
  { brand: 'Mahindra', model: 'Thar 4x4', category: 'CAR', price: 3500, deposit: 5000, img: 'thar.jpg' },
  { brand: 'Hyundai', model: 'Creta SX', category: 'CAR', price: 2400, deposit: 3000, img: 'creta.jpg' },
  { brand: 'Maruti', model: 'Brezza ZXi', category: 'CAR', price: 1800, deposit: 2000, img: 'brezza.jpg' },
];

export async function seedMarketplaceData() {
  console.log('======================================================================');
  console.log('  RideSetu — Marketplace Inventory Seeding Script (60+ Vendors, 300+ Vehicles)');
  console.log('======================================================================\n');

  await connectToDatabase();

  // 1. Ensure Destinations exist
  const destinationMap = new Map<string, mongoose.Types.ObjectId>();
  for (const city of CITIES) {
    let dest = await Destination.findOne({ slug: city.slug });
    if (!dest) {
      dest = await Destination.create({
        name: city.name,
        slug: city.slug,
        state: city.state,
        description: `Explore ${city.name} with verified rental scooters, Himalayan bikes, and self-drive SUVs.`,
        isActive: true,
      });
    }
    destinationMap.set(city.slug, dest._id);
  }

  // 2. Ensure at least 10 vendors per city (60 total)
  let vendorCount = 0;
  let vehicleCount = 0;

  for (const city of CITIES) {
    const destId = destinationMap.get(city.slug)!;

    for (let i = 1; i <= 10; i++) {
      const email = `partner_${city.slug}_${i}@ridesetu-demo.in`;
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          name: `${city.name} Mobility Hub #${i}`,
          email,
          phone: `98765${Math.floor(10000 + Math.random() * 90000)}`,
          role: 'VENDOR',
          passwordHash: '$2a$10$demoPasswordHashForMarketplaceSeedingOnly2026',
          kycStatus: 'VERIFIED',
        });
      }

      let vendor = await Vendor.findOne({ userId: user._id });
      if (!vendor) {
        vendor = await Vendor.create({
          userId: user._id,
          businessName: `${city.name} ${i === 1 ? 'Prime' : i === 2 ? 'Himalayan' : 'Speed'} Riders #${i}`,
          ownerName: `Devendra ${city.name} Host`,
          phone: user.phone,
          email: user.email,
          city: city.name,
          address: `Hub ${i}, Main Road, ${city.name}, Uttarakhand`,
          verificationStatus: 'VERIFIED',
          isVerified: true,
          rating: parseFloat((4.5 + Math.random() * 0.49).toFixed(1)),
          totalReviews: 24 + i * 5,
        });
      }
      vendorCount++;

      // Seed 5 vehicles per vendor
      for (let vIdx = 0; vIdx < 5; vIdx++) {
        const tmpl = VEHICLE_TEMPLATES[(i + vIdx) % VEHICLE_TEMPLATES.length];
        const regNo = `UK${(i % 12 + 1).toString().padStart(2, '0')} ${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + (vIdx % 26))} ${1000 + i * 10 + vIdx}`;

        const existingVehicle = await Vehicle.findOne({ registrationNumber: regNo });
        if (!existingVehicle) {
          await Vehicle.create({
            vendorId: vendor._id,
            destinationId: destId,
            brand: tmpl.brand,
            model: tmpl.model,
            variant: 'BS6 Phase 2',
            category: tmpl.category as any,
            year: 2024,
            color: 'Himalayan Granite',
            registrationNumber: regNo,
            odometer: 4200 + vIdx * 1500,
            fuelType: tmpl.category === 'EV' ? 'ELECTRIC' : 'PETROL',
            transmission: tmpl.category === 'SCOOTER' || tmpl.category === 'EV' ? 'AUTOMATIC' : 'MANUAL',
            status: 'APPROVED',
            pricePerDay: tmpl.price,
            pricePerHour: Math.round(tmpl.price / 10),
            securityDeposit: tmpl.deposit,
            securityDepositEnabled: true,
            securityDepositAmount: tmpl.deposit,
            kmLimitPerDay: 150,
            excessKmCharge: 4,
            isAvailable: true,
            isVerified: true,
            deliveryAvailable: true,
            helmetIncluded: true,
            roadsideAssistance: true,
            images: [
              `/images/vehicles/${tmpl.img}`,
              `/images/vehicles/side_${tmpl.img}`,
            ],
            photos: {
              front: `/images/vehicles/${tmpl.img}`,
              rear: `/images/vehicles/rear_${tmpl.img}`,
              left: `/images/vehicles/side_${tmpl.img}`,
              right: `/images/vehicles/side_${tmpl.img}`,
              dashboard: `/images/vehicles/dash_${tmpl.img}`,
              odometer: `/images/vehicles/meter_${tmpl.img}`,
            },
            specifications: {
              seatingCapacity: tmpl.category === 'CAR' ? 5 : 2,
              engineCc: tmpl.category === 'CAR' ? 1500 : tmpl.category === 'MOTORCYCLE' ? 350 : 125,
            },
            rating: parseFloat((4.6 + Math.random() * 0.39).toFixed(1)),
            totalBookings: 12 + vIdx * 4,
            totalReviews: 8 + vIdx * 2,
            badges: ['VERIFIED PARTNER', 'TOP RATED', 'FAST RESPONSE'],
          });
        }
        vehicleCount++;
      }
    }
  }

  console.log(`✅ [SEED SUCCESS] Verified database contains ${vendorCount} Vendors and ${vehicleCount} Vehicles across 6 Cities.`);
}

if (require.main === module) {
  seedMarketplaceData().then(() => process.exit(0)).catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
