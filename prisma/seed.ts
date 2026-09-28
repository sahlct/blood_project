import { PrismaClient, UserStatus, AvailabilityStatus, VerificationStatus, RequestUrgency, BloodRequestStatus, EventStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Blood Donation Platform Seeding...");

  // 1. System Permissions
  const permissionsList = [
    { name: "users.view", displayName: "View Users", category: "Users", description: "View registered user list" },
    { name: "users.create", displayName: "Create Users", category: "Users", description: "Create staff and admins" },
    { name: "users.update", displayName: "Update Users", category: "Users", description: "Update user accounts" },
    { name: "users.delete", displayName: "Delete Users", category: "Users", description: "Soft delete user accounts" },
    { name: "users.manage", displayName: "Manage Users", category: "Users", description: "Full user management" },

    { name: "donors.view", displayName: "View Donors", category: "Donors", description: "View donor profiles" },
    { name: "donors.create", displayName: "Create Donors", category: "Donors", description: "Manually add donors" },
    { name: "donors.update", displayName: "Update Donors", category: "Donors", description: "Review and verify donors" },
    { name: "donors.delete", displayName: "Delete Donors", category: "Donors", description: "Remove donor profiles" },

    { name: "donations.view", displayName: "View Donations", category: "Donations", description: "View donation history" },
    { name: "donations.create", displayName: "Record Donation", category: "Donations", description: "Record new donation" },
    { name: "donations.update", displayName: "Update Donation", category: "Donations", description: "Edit donation record" },
    { name: "donations.delete", displayName: "Delete Donation", category: "Donations", description: "Cancel donation record" },

    { name: "roles.view", displayName: "View Roles", category: "Roles", description: "View RBAC roles" },
    { name: "roles.create", displayName: "Create Roles", category: "Roles", description: "Create new roles" },
    { name: "roles.update", displayName: "Update Roles", category: "Roles", description: "Edit roles & permissions" },
    { name: "roles.delete", displayName: "Delete Roles", category: "Roles", description: "Delete custom roles" },
    { name: "permissions.view", displayName: "View Permissions", category: "Roles", description: "View permission master" },

    { name: "blood_requests.manage", displayName: "Manage Blood Requests", category: "Requests", description: "Moderate blood requests" },
    { name: "events.manage", displayName: "Manage Camps/Events", category: "Events", description: "Create and organize camps" },

    { name: "settings.view", displayName: "View Settings", category: "Settings", description: "View system configurations" },
    { name: "settings.update", displayName: "Update Settings", category: "Settings", description: "Edit system configurations" },
    { name: "reports.view", displayName: "View Reports", category: "Reports", description: "View analytical reports and stats" },
    { name: "audit_logs.view", displayName: "View Audit Logs", category: "Audit", description: "View security audit trail" },
    { name: "content.manage", displayName: "Manage Content", category: "Content", description: "Edit CMS pages and FAQs" },
  ];

  console.log("Upserting permissions...");
  const createdPermissions = [];
  for (const perm of permissionsList) {
    const p = await prisma.permission.upsert({
      where: { name: perm.name },
      update: { displayName: perm.displayName, category: perm.category, description: perm.description },
      create: perm,
    });
    createdPermissions.push(p);
  }

  // 2. Roles
  console.log("Upserting roles...");
  const superAdminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: { displayName: "Super Administrator", description: "Full system access with all privileges" },
    create: { name: "SUPER_ADMIN", displayName: "Super Administrator", description: "Full system access with all privileges", isSystem: true },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: { displayName: "Administrator", description: "Operations and management access" },
    create: { name: "ADMIN", displayName: "Administrator", description: "Operations and management access", isSystem: true },
  });

  const moderatorRole = await prisma.role.upsert({
    where: { name: "MODERATOR" },
    update: { displayName: "Moderator", description: "Content, donor reviews and blood request moderation" },
    create: { name: "MODERATOR", displayName: "Moderator", description: "Content, donor reviews and blood request moderation", isSystem: true },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: "STAFF" },
    update: { displayName: "Hospital/Camp Staff", description: "Record donations and view donor availability" },
    create: { name: "STAFF", displayName: "Hospital/Camp Staff", description: "Record donations and view donor availability", isSystem: true },
  });

  // 3. Map All Permissions to SUPER_ADMIN & ADMIN
  console.log("Mapping role permissions...");
  for (const perm of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: perm.id },
    });

    // Admin has most permissions except role management
    if (!perm.name.startsWith("roles.delete")) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: adminRole.id, permissionId: perm.id },
      });
    }

    // Moderator permissions
    if (["donors.view", "donors.update", "blood_requests.manage", "events.manage", "content.manage"].includes(perm.name)) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: moderatorRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: moderatorRole.id, permissionId: perm.id },
      });
    }

    // Staff permissions
    if (["donors.view", "donations.create", "donations.view"].includes(perm.name)) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: staffRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: staffRole.id, permissionId: perm.id },
      });
    }
  }

  // 4. Initial Super Admin User (credentials strictly from environment variables)
  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "admin@bloodlife.org").toLowerCase().trim();
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin123!Secure";
  const passwordHash = await bcrypt.hash(superAdminPassword, 12);

  console.log(`Upserting Super Admin user: ${superAdminEmail}...`);
  const superAdminUser = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: { name: "Super Administrator", status: UserStatus.ACTIVE },
    create: {
      email: superAdminEmail,
      name: "Super Administrator",
      passwordHash,
      status: UserStatus.ACTIVE,
      phone: "+91 98765 00000",
      emailVerified: new Date(),
    },
  });

  // Assign Super Admin Role
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdminUser.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: superAdminUser.id, roleId: superAdminRole.id, assignedBy: "SYSTEM_SEEDER" },
  });

  // 5. Blood Groups Master Data
  console.log("Upserting blood groups...");
  const bloodGroupsData = [
    { group: "A+", rhFactor: "POSITIVE", antigen: "A", canDonateTo: '["A+", "AB+"]', canReceiveFrom: '["A+", "A-", "O+", "O-"]', description: "Second most common blood group." },
    { group: "A-", rhFactor: "NEGATIVE", antigen: "A", canDonateTo: '["A+", "A-", "AB+", "AB-"]', canReceiveFrom: '["A-", "O-"]', description: "Universal platelets donor." },
    { group: "B+", rhFactor: "POSITIVE", antigen: "B", canDonateTo: '["B+", "AB+"]', canReceiveFrom: '["B+", "B-", "O+", "O-"]', description: "High demand in many regional populations." },
    { group: "B-", rhFactor: "NEGATIVE", antigen: "B", canDonateTo: '["B+", "B-", "AB+", "AB-"]', canReceiveFrom: '["B-", "O-"]', description: "Rare blood type, crucial for emergency reserves." },
    { group: "AB+", rhFactor: "POSITIVE", antigen: "AB", canDonateTo: '["AB+"]', canReceiveFrom: '["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]', description: "Universal plasma donor and universal red cell recipient." },
    { group: "AB-", rhFactor: "NEGATIVE", antigen: "AB", canDonateTo: '["AB+", "AB-"]', canReceiveFrom: '["A-", "B-", "AB-", "O-"]', description: "Rarest blood group among the major ABO systems." },
    { group: "O+", rhFactor: "POSITIVE", antigen: "O", canDonateTo: '["O+", "A+", "B+", "AB+"]', canReceiveFrom: '["O+", "O-"]', description: "Most common blood group globally, needed daily for transfusions." },
    { group: "O-", rhFactor: "NEGATIVE", antigen: "O", canDonateTo: '["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]', canReceiveFrom: '["O-"]', description: "Universal Red Cell Donor: Emergency gold standard when patient blood group is unknown." },
  ];

  const bloodGroupMap: Record<string, string> = {};
  for (const bg of bloodGroupsData) {
    const created = await prisma.bloodGroup.upsert({
      where: { group: bg.group },
      update: { canDonateTo: bg.canDonateTo, canReceiveFrom: bg.canReceiveFrom, description: bg.description },
      create: bg,
    });
    bloodGroupMap[bg.group] = created.id;
  }

  // 6. Geographic Master Data (Country -> State -> Districts -> Cities)
  console.log("Upserting geographic master data...");
  const country = await prisma.country.upsert({
    where: { code: "IN" },
    update: { name: "India", phoneCode: "+91" },
    create: { code: "IN", name: "India", phoneCode: "+91" },
  });

  const state = await prisma.state.upsert({
    where: { countryId_code: { countryId: country.id, code: "KL" } },
    update: { name: "Kerala" },
    create: { countryId: country.id, code: "KL", name: "Kerala" },
  });

  const keralaDistricts = [
    { name: "Thiruvananthapuram", code: "TVM", cities: ["Thiruvananthapuram City", "Neyyattinkara", "Attingal", "Nedumangad"] },
    { name: "Kollam", code: "KLM", cities: ["Kollam City", "Karunagappalli", "Paravur", "Punalur"] },
    { name: "Pathanamthitta", code: "PTA", cities: ["Pathanamthitta City", "Thiruvalla", "Adoor", "Ranni"] },
    { name: "Alappuzha", code: "ALP", cities: ["Alappuzha City", "Cherthala", "Kayamkulam", "Mavelikkara"] },
    { name: "Kottayam", code: "KTM", cities: ["Kottayam City", "Changanassery", "Pala", "Vaikom"] },
    { name: "Idukki", code: "IDK", cities: ["Thodupuzha", "Munnar", "Kattappana", "Adimali"] },
    { name: "Ernakulam", code: "EKM", cities: ["Kochi", "Aluva", "Angamaly", "Perumbavoor", "Kakkanad"] },
    { name: "Thrissur", code: "TSR", cities: ["Thrissur City", "Chalakudy", "Kodungallur", "Guruvayur"] },
    { name: "Palakkad", code: "PKD", cities: ["Palakkad City", "Ottapalam", "Chittur", "Mannarkkad"] },
    { name: "Malappuram", code: "MLP", cities: ["Malappuram City", "Manjeri", "Perinthalmanna", "Tirur"] },
    { name: "Kozhikode", code: "KKD", cities: ["Kozhikode City", "Vadakara", "Koyilandy", "Feroke"] },
    { name: "Wayanad", code: "WYD", cities: ["Kalpetta", "Sulthan Bathery", "Mananthavady"] },
    { name: "Kannur", code: "KNR", cities: ["Kannur City", "Thalassery", "Payyanur", "Taliparamba"] },
    { name: "Kasaragod", code: "KSD", cities: ["Kasaragod City", "Kanhangad", "Nileshwaram"] },
  ];

  const districtMap: Record<string, string> = {};
  const cityMap: Record<string, string> = {};

  for (const d of keralaDistricts) {
    const dist = await prisma.district.upsert({
      where: { stateId_name: { stateId: state.id, name: d.name } },
      update: { code: d.code },
      create: { stateId: state.id, name: d.name, code: d.code },
    });
    districtMap[d.name] = dist.id;

    for (const c of d.cities) {
      const city = await prisma.city.findFirst({
        where: { districtId: dist.id, name: c },
      });
      if (!city) {
        const createdCity = await prisma.city.create({
          data: { districtId: dist.id, name: c },
        });
        cityMap[c] = createdCity.id;
      } else {
        cityMap[c] = city.id;
      }
    }
  }

  // 7. Application Settings
  console.log("Upserting application settings...");
  const settings = [
    { key: "SITE_NAME", value: "BloodLife Network", group: "GENERAL", description: "Portal brand name", isPublic: true },
    { key: "SITE_TAGLINE", value: "Every Drop Can Save a Life", group: "GENERAL", description: "Homepage tagline", isPublic: true },
    { key: "MIN_DONATION_INTERVAL_DAYS", value: "90", group: "ELIGIBILITY", description: "Configurable minimum days required between blood donations", isPublic: true },
    { key: "CONTACT_EMAIL", value: "support@bloodlife.org", group: "GENERAL", description: "Official support email", isPublic: true },
    { key: "CONTACT_PHONE", value: "+91 98765 43210", group: "GENERAL", description: "Official helpline phone", isPublic: true },
    { key: "REQUIRE_DONOR_VERIFICATION", value: "true", group: "SECURITY", description: "Require admin approval before public directory visibility", isPublic: false },
    { key: "PUBLIC_DONOR_VISIBILITY", value: "true", group: "SECURITY", description: "Allow consented donors to appear in search directory", isPublic: true },
  ];

  for (const s of settings) {
    await prisma.applicationSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, group: s.group, description: s.description, isPublic: s.isPublic },
      create: s,
    });
  }

  // 8. Donation Centers
  console.log("Upserting donation centers...");
  const centers = [
    {
      name: "Ernakulam General Hospital Blood Bank",
      districtName: "Ernakulam",
      address: "Hospital Road, Marine Drive, Kochi",
      phone: "+91 484 2361251",
      email: "bloodbank.ekm@kerala.gov.in",
      operatingHours: "24 Hours (Emergency) | 8:00 AM - 5:00 PM (Donations)",
    },
    {
      name: "Government Medical College Blood Center",
      districtName: "Thiruvananthapuram",
      address: "Medical College PO, Thiruvananthapuram",
      phone: "+91 471 2528300",
      email: "bloodcenter.tvm@kerala.gov.in",
      operatingHours: "24 Hours Open",
    },
    {
      name: "Kozhikode Medical College Blood Bank",
      districtName: "Kozhikode",
      address: "Medical College Junction, Kozhikode",
      phone: "+91 495 2350216",
      email: "bloodbank.kkd@kerala.gov.in",
      operatingHours: "24 Hours Open",
    },
  ];

  for (const c of centers) {
    const distId = districtMap[c.districtName];
    if (distId) {
      const existing = await prisma.donationCenter.findFirst({ where: { name: c.name, districtId: distId } });
      if (!existing) {
        await prisma.donationCenter.create({
          data: {
            name: c.name,
            districtId: distId,
            address: c.address,
            phone: c.phone,
            email: c.email,
            operatingHours: c.operatingHours,
          },
        });
      }
    }
  }

  // 9. Sample Verified Donors for Testing Directory and Search
  console.log("Upserting sample verified donors...");
  const sampleDonors = [
    {
      name: "Rahul Sharma",
      email: "rahul.donor@example.com",
      phone: "+91 98460 11223",
      bloodGroup: "O+",
      districtName: "Ernakulam",
      locality: "Kakkanad",
      availability: AvailabilityStatus.AVAILABLE,
      lastDonationDaysAgo: 120, // Eligible
    },
    {
      name: "Anjali Menon",
      email: "anjali.menon@example.com",
      phone: "+91 94470 22334",
      bloodGroup: "A+",
      districtName: "Ernakulam",
      locality: "Aluva",
      availability: AvailabilityStatus.AVAILABLE,
      lastDonationDaysAgo: 30, // Not yet eligible
    },
    {
      name: "Mohammed Fasil",
      email: "fasil.m@example.com",
      phone: "+91 97450 33445",
      bloodGroup: "B+",
      districtName: "Kozhikode",
      locality: "Feroke",
      availability: AvailabilityStatus.AVAILABLE,
      lastDonationDaysAgo: 100, // Eligible
    },
    {
      name: "Sneha Nair",
      email: "sneha.nair@example.com",
      phone: "+91 98470 44556",
      bloodGroup: "O-",
      districtName: "Thiruvananthapuram",
      locality: "Neyyattinkara",
      availability: AvailabilityStatus.AVAILABLE,
      lastDonationDaysAgo: null, // First time donor -> Eligible
    },
    {
      name: "Thomas Mathew",
      email: "thomas.mathew@example.com",
      phone: "+91 94460 55667",
      bloodGroup: "AB+",
      districtName: "Kottayam",
      locality: "Pala",
      availability: AvailabilityStatus.TEMPORARILY_UNAVAILABLE,
      lastDonationDaysAgo: 95,
    },
    {
      name: "Deepa Varma",
      email: "deepa.varma@example.com",
      phone: "+91 98450 66778",
      bloodGroup: "AB-",
      districtName: "Thrissur",
      locality: "Chalakudy",
      availability: AvailabilityStatus.AVAILABLE,
      lastDonationDaysAgo: 140, // Eligible
    },
    {
      name: "Arun Kumar",
      email: "arun.k@example.com",
      phone: "+91 94950 77889",
      bloodGroup: "A-",
      districtName: "Palakkad",
      locality: "Ottapalam",
      availability: AvailabilityStatus.AVAILABLE,
      lastDonationDaysAgo: null, // Eligible
    },
  ];

  const defaultUserPassword = await bcrypt.hash("Donor123!Secure", 12);

  for (const sd of sampleDonors) {
    const user = await prisma.user.upsert({
      where: { email: sd.email },
      update: { name: sd.name, phone: sd.phone },
      create: {
        email: sd.email,
        name: sd.name,
        phone: sd.phone,
        passwordHash: defaultUserPassword,
        status: UserStatus.ACTIVE,
        emailVerified: new Date(),
      },
    });

    // Create Member Profile
    await prisma.memberProfile.upsert({
      where: { userId: user.id },
      update: { fullName: sd.name, phone: sd.phone },
      create: {
        userId: user.id,
        fullName: sd.name,
        phone: sd.phone,
        gender: "OTHER",
        dateOfBirth: new Date("1995-05-15"),
      },
    });

    const lastDonationDate = sd.lastDonationDaysAgo !== null ? subDays(new Date(), sd.lastDonationDaysAgo) : null;
    const nextEligibleDate = lastDonationDate ? addDays(lastDonationDate, 90) : null;
    const isEligible = !lastDonationDate || (nextEligibleDate && nextEligibleDate <= new Date());

    const distId = districtMap[sd.districtName] || Object.values(districtMap)[0];
    const bgId = bloodGroupMap[sd.bloodGroup] || Object.values(bloodGroupMap)[0];

    await prisma.donorProfile.upsert({
      where: { userId: user.id },
      update: {
        availabilityStatus: sd.availability,
        verificationStatus: VerificationStatus.APPROVED,
        isEligible: Boolean(isEligible),
        lastDonationDate,
        nextEligibleDonationDate: nextEligibleDate,
      },
      create: {
        userId: user.id,
        bloodGroupId: bgId,
        districtId: distId,
        locality: sd.locality,
        availabilityStatus: sd.availability,
        verificationStatus: VerificationStatus.APPROVED,
        publicProfileEnabled: true,
        showPhonePublicly: false, // Privacy default: Contact Donor form
        lastDonationDate,
        nextEligibleDonationDate: nextEligibleDate,
        isEligible: Boolean(isEligible),
        totalDonations: lastDonationDate ? 2 : 0,
        consentGiven: true,
        verifiedAt: new Date(),
        verifiedById: superAdminUser.id,
      },
    });
  }

  // 10. Sample Blood Donation Events / Camps
  console.log("Upserting sample blood donation camps/events...");
  const sampleEvents = [
    {
      title: "Mega Community Blood Donation Camp 2026",
      slug: "mega-community-blood-donation-camp-2026",
      description: "Join hands with local healthcare centers and community volunteers to donate whole blood and save lives. Free health checkup and hemoglobin test included.",
      venue: "Jawaharlal Nehru International Stadium Complex",
      districtName: "Ernakulam",
      address: "Kaloor, Kochi, Kerala 682017",
      startDate: addDays(new Date(), 5),
      endDate: addDays(new Date(), 5),
      targetUnits: 150,
      registeredCount: 38,
      organizerName: "Kerala Youth Volunteer Association & Red Cross",
      organizerPhone: "+91 94471 99881",
      organizerEmail: "camps@bloodlife.org",
      status: EventStatus.UPCOMING,
    },
    {
      title: "University Youth Blood Drive - Trivandrum",
      slug: "university-youth-blood-drive-trivandrum",
      description: "Annual university blood drive for youth donors and first-time donors. Refreshments, certificates, and donor badge provided to all participants.",
      venue: "University College Senate Hall",
      districtName: "Thiruvananthapuram",
      address: "Palayam, Thiruvananthapuram, Kerala 695034",
      startDate: addDays(new Date(), 12),
      endDate: addDays(new Date(), 12),
      targetUnits: 100,
      registeredCount: 45,
      organizerName: "NSS Cell & Government Medical College Blood Bank",
      organizerPhone: "+91 98471 22330",
      organizerEmail: "youth@bloodlife.org",
      status: EventStatus.UPCOMING,
    },
  ];

  for (const ev of sampleEvents) {
    const distId = districtMap[ev.districtName] || Object.values(districtMap)[0];
    await prisma.donationEvent.upsert({
      where: { slug: ev.slug },
      update: { title: ev.title, venue: ev.venue, address: ev.address },
      create: {
        title: ev.title,
        slug: ev.slug,
        description: ev.description,
        venue: ev.venue,
        districtId: distId,
        address: ev.address,
        startDate: ev.startDate,
        endDate: ev.endDate,
        targetUnits: ev.targetUnits,
        registeredCount: ev.registeredCount,
        organizerName: ev.organizerName,
        organizerPhone: ev.organizerPhone,
        organizerEmail: ev.organizerEmail,
        status: ev.status,
      },
    });
  }

  // 11. Sample Blood Requests (Emergency Requirements)
  console.log("Upserting sample blood requests...");
  const sampleRequests = [
    {
      referenceNumber: "REQ-2026-0001",
      patientName: "Siddharth Rajan",
      bloodGroup: "O-",
      unitsRequired: 2,
      urgency: RequestUrgency.CRITICAL,
      requiredDate: addDays(new Date(), 1),
      hospitalName: "Aster Medcity Kochi",
      hospitalAddress: "South Chittoor, Kochi",
      districtName: "Ernakulam",
      contactPerson: "Dr. Anoop Nair",
      contactPhone: "+91 98460 99881",
      notes: "Emergency heart surgery scheduled. Universal O- units urgently requested.",
      status: BloodRequestStatus.ACTIVE,
    },
    {
      referenceNumber: "REQ-2026-0002",
      patientName: "Meenakshi Amma",
      bloodGroup: "B+",
      unitsRequired: 3,
      urgency: RequestUrgency.HIGH,
      requiredDate: addDays(new Date(), 2),
      hospitalName: "Government Medical College Hospital",
      hospitalAddress: "Medical College PO, Kozhikode",
      districtName: "Kozhikode",
      contactPerson: "Kishore Kumar",
      contactPhone: "+91 97451 88772",
      notes: "Platelet transfusion needed for oncology patient.",
      status: BloodRequestStatus.ACTIVE,
    },
  ];

  for (const req of sampleRequests) {
    const distId = districtMap[req.districtName] || Object.values(districtMap)[0];
    const bgId = bloodGroupMap[req.bloodGroup] || Object.values(bloodGroupMap)[0];

    await prisma.bloodRequest.upsert({
      where: { referenceNumber: req.referenceNumber },
      update: { patientName: req.patientName, unitsRequired: req.unitsRequired },
      create: {
        referenceNumber: req.referenceNumber,
        patientName: req.patientName,
        bloodGroupId: bgId,
        districtId: distId,
        unitsRequired: req.unitsRequired,
        urgency: req.urgency,
        requiredDate: req.requiredDate,
        hospitalName: req.hospitalName,
        hospitalAddress: req.hospitalAddress,
        contactPerson: req.contactPerson,
        contactPhone: req.contactPhone,
        notes: req.notes,
        status: req.status,
        publicVisible: true,
        verifiedAt: new Date(),
        verifiedById: superAdminUser.id,
      },
    });
  }

  // 12. Content Pages (About, Terms, Privacy Policy)
  console.log("Upserting CMS content pages...");
  const pages = [
    {
      slug: "about",
      title: "About BloodLife Network",
      content: `### Saving Lives Through Community Blood Donation\n\nBloodLife Network is a mission-driven, privacy-focused healthcare platform committed to connecting voluntary blood donors with patients, hospitals, and emergency medical services.\n\n### Our Mission\nEvery 2 seconds, someone in the country needs blood. Whether for accident emergencies, surgical procedures, cancer therapies, or chronic hematological conditions like Thalassemia, timely access to safe blood saves lives. Our goal is to ensure zero preventable deaths due to blood shortages.\n\n### Privacy & Security First\nUnlike legacy directories that expose donor contact numbers to public spam, our system uses encrypted matching, secure contact requests, and full donor control over public visibility.`,
      metaTitle: "About Us | BloodLife Voluntary Blood Donation Network",
      metaDescription: "Learn about the mission, values, and impact of BloodLife Blood Donation Network.",
    },
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      content: `### Privacy by Design\n\nYour privacy is central to our mission. This policy outlines how your data is handled:\n\n1. **Personal Information:** We collect your name, contact information, blood group, and location strictly for matching and voluntary donation purposes.\n2. **Directory Visibility:** By default, your contact number is not shown publicly. Patients and hospitals reach you via secure in-portal contact requests.\n3. **Medical Data Minimization:** We do NOT store extensive medical records. Only your last recorded donation date is used to calculate estimated eligibility.\n4. **Data Rights:** You may update your availability, withdraw directory listing, or request full account deletion at any time from your member dashboard.`,
      metaTitle: "Privacy Policy | BloodLife Portal",
      metaDescription: "Privacy policy and donor data protection standards at BloodLife.",
    },
    {
      slug: "terms",
      title: "Terms and Conditions",
      content: `### Terms of Service\n\n1. **Voluntary Participation:** Blood donation is strictly voluntary and altruistic. Commercial buying or selling of human blood is illegal and prohibited.\n2. **Eligibility Screening:** Portal calculations of eligibility are estimates. All donors must undergo medical screening at the authorized donation center.\n3. **Accurate Information:** Users agree to provide truthful contact and donation history records.\n4. **Code of Conduct:** Harassment, commercial solicitation, or misuse of donor information will result in immediate permanent account termination.`,
      metaTitle: "Terms and Conditions | BloodLife Portal",
      metaDescription: "Terms and conditions of using the BloodLife platform.",
    },
  ];

  for (const page of pages) {
    await prisma.contentPage.upsert({
      where: { slug: page.slug },
      update: { title: page.title, content: page.content, metaTitle: page.metaTitle, metaDescription: page.metaDescription },
      create: page,
    });
  }

  // 13. FAQs
  console.log("Upserting FAQs...");
  const faqs = [
    { question: "Who can donate blood?", answer: "Generally, any healthy adult between 18 and 65 years of age, weighing at least 45-50 kg, with a hemoglobin level of 12.5 g/dL or higher, can donate blood.", category: "Eligibility", sortOrder: 1 },
    { question: "How often can I donate blood?", answer: "In our platform, the standard interval for whole blood donation is configured at 90 days (approx. 3 months). This gives your body adequate time to replenish iron reserves.", category: "Eligibility", sortOrder: 2 },
    { question: "Does donating blood hurt or cause weakness?", answer: "The donation needle causes only a brief pinch. The body replenishes the donated fluid volume within 24 to 48 hours. Most healthy donors feel completely normal after resting for 15 minutes and having a light refreshment.", category: "Donation Process", sortOrder: 3 },
    { question: "Is my personal phone number displayed publicly?", answer: "No. In BloodLife, your phone number is protected by default. Requesters submit a secure 'Contact Donor' request through the portal, and you receive an alert to review before responding.", category: "Privacy", sortOrder: 4 },
  ];

  for (const f of faqs) {
    const existingFaq = await prisma.faqItem.findFirst({ where: { question: f.question } });
    if (!existingFaq) {
      await prisma.faqItem.create({ data: f });
    }
  }

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
