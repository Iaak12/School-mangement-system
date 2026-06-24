require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Parent = require('../models/Parent');
const Class = require('../models/Class');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const Book = require('../models/Book');
const Notice = require('../models/Notice');
const Settings = require('../models/Settings');
const Transport = require('../models/Transport');
const Vehicle = require('../models/Vehicle');

const connectDB = require('../config/db');

const ACADEMIC_YEAR = '2024-25';

const seed = async () => {
  await connectDB();
  console.log('🌱 Starting seed...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), Student.deleteMany({}), Teacher.deleteMany({}),
    Parent.deleteMany({}), Class.deleteMany({}), Section.deleteMany({}),
    Subject.deleteMany({}), Book.deleteMany({}), Notice.deleteMany({}),
    Settings.deleteMany({}), Transport.deleteMany({}), Vehicle.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // ============ Settings ============
  await Settings.create({
    schoolName: 'Springfield Public School',
    tagline: 'Excellence in Education',
    address: { street: '123 Education Street', city: 'Springfield', state: 'Maharashtra', pincode: '400001' },
    phone: '+91-9999999999',
    email: 'info@springfield.edu',
    website: 'https://www.springfield.edu',
    currentAcademicYear: ACADEMIC_YEAR,
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    principal: { name: 'Dr. Rajesh Kumar', phone: '+91-9988776655', email: 'principal@springfield.edu' },
    feeSettings: { dueDateDay: 10, finePerDay: 5, currency: 'INR' },
    librarySettings: { maxBooksPerStudent: 3, maxIssueDays: 14, finePerDay: 1 },
    gradingSystem: [
      { grade: 'A+', minPercentage: 91, maxPercentage: 100, gradePoint: 10.0, description: 'Outstanding' },
      { grade: 'A',  minPercentage: 81, maxPercentage: 90,  gradePoint: 9.0,  description: 'Excellent' },
      { grade: 'B+', minPercentage: 71, maxPercentage: 80,  gradePoint: 8.0,  description: 'Very Good' },
      { grade: 'B',  minPercentage: 61, maxPercentage: 70,  gradePoint: 7.0,  description: 'Good' },
      { grade: 'C+', minPercentage: 51, maxPercentage: 60,  gradePoint: 6.0,  description: 'Above Average' },
      { grade: 'C',  minPercentage: 41, maxPercentage: 50,  gradePoint: 5.0,  description: 'Average' },
      { grade: 'D',  minPercentage: 35, maxPercentage: 40,  gradePoint: 4.0,  description: 'Pass' },
      { grade: 'F',  minPercentage: 0,  maxPercentage: 34,  gradePoint: 0.0,  description: 'Fail' },
    ],
    isConfigured: true,
  });
  console.log('✅ Settings created');

  // ============ Users (Admin roles) ============
  const adminUser = await User.create({ name: 'Admin User', email: 'admin@springfield.edu', password: 'Admin@1234', role: 'admin', phone: '+91-9000000001' });
  const principalUser = await User.create({ name: 'Dr. Rajesh Kumar', email: 'principal@springfield.edu', password: 'Principal@1234', role: 'principal', phone: '+91-9988776655' });
  const accountantUser = await User.create({ name: 'Meena Sharma', email: 'accountant@springfield.edu', password: 'Account@1234', role: 'accountant', phone: '+91-9000000003' });
  const librarianUser = await User.create({ name: 'Ramesh Gupta', email: 'librarian@springfield.edu', password: 'Library@1234', role: 'librarian', phone: '+91-9000000004' });
  console.log('✅ Admin users created');

  // ============ Classes ============
  const classNames = ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'];
  const classes = await Class.insertMany(
    classNames.map((name, i) => ({ name, numericName: i + 1, academicYear: ACADEMIC_YEAR, isActive: true }))
  );
  console.log('✅ Classes created');

  // ============ Sections (A & B for each class) ============
  const sections = [];
  for (const cls of classes) {
    const secA = await Section.create({ name: 'A', class: cls._id, capacity: 40, academicYear: ACADEMIC_YEAR });
    const secB = await Section.create({ name: 'B', class: cls._id, capacity: 40, academicYear: ACADEMIC_YEAR });
    sections.push(secA, secB);
  }
  console.log('✅ Sections created');

  // ============ Subjects ============
  const subjectData = [
    { name: 'Mathematics', code: 'MATH', type: 'theory', maxMarks: 100 },
    { name: 'English', code: 'ENG', type: 'theory', maxMarks: 100 },
    { name: 'Science', code: 'SCI', type: 'both', maxMarks: 100 },
    { name: 'Social Studies', code: 'SST', type: 'theory', maxMarks: 100 },
    { name: 'Hindi', code: 'HIN', type: 'theory', maxMarks: 100 },
    { name: 'Computer Science', code: 'CS', type: 'both', maxMarks: 100 },
    { name: 'Physical Education', code: 'PE', type: 'practical', maxMarks: 50 },
  ];
  const subjects = await Subject.insertMany(
    subjectData.map((s) => ({ ...s, classes: classes.map((c) => c._id), isActive: true }))
  );
  console.log('✅ Subjects created');

  // ============ Teachers ============
  const teacherData = [
    { firstName: 'Anita', lastName: 'Singh', email: 'anita@springfield.edu', phone: '+91-9111111101', designation: 'Senior Teacher', department: 'Mathematics' },
    { firstName: 'Vikram', lastName: 'Patel', email: 'vikram@springfield.edu', phone: '+91-9111111102', designation: 'Teacher', department: 'English' },
    { firstName: 'Sunita', lastName: 'Reddy', email: 'sunita@springfield.edu', phone: '+91-9111111103', designation: 'Teacher', department: 'Science' },
    { firstName: 'Arjun', lastName: 'Mehta', email: 'arjun@springfield.edu', phone: '+91-9111111104', designation: 'Teacher', department: 'Social Studies' },
    { firstName: 'Priya', lastName: 'Sharma', email: 'priya@springfield.edu', phone: '+91-9111111105', designation: 'Teacher', department: 'Hindi' },
  ];

  const teachers = [];
  for (let i = 0; i < teacherData.length; i++) {
    const t = teacherData[i];
    const user = await User.create({ name: `${t.firstName} ${t.lastName}`, email: t.email, password: 'Teacher@1234', role: 'teacher', phone: t.phone });
    const teacher = await Teacher.create({
      user: user._id,
      employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
      firstName: t.firstName,
      lastName: t.lastName,
      phone: t.phone,
      designation: t.designation,
      department: t.department,
      joiningDate: new Date('2020-06-01'),
      salary: 35000 + i * 5000,
      subjects: [subjects[i]._id],
      classes: classes.slice(0, 6).map((c) => c._id),
      status: 'active',
      academicYear: ACADEMIC_YEAR,
    });
    await User.findByIdAndUpdate(user._id, { profileRef: teacher._id, profileModel: 'Teacher' });
    teachers.push(teacher);
  }
  console.log('✅ Teachers created');

  // ============ Students & Parents ============
  const studentNames = [
    ['Aarav', 'Sharma'], ['Priya', 'Verma'], ['Rohan', 'Kumar'], ['Sneha', 'Patel'],
    ['Arjun', 'Gupta'], ['Kavya', 'Singh'], ['Dhruv', 'Mehta'], ['Ananya', 'Reddy'],
    ['Vivek', 'Joshi'], ['Nisha', 'Iyer'],
  ];

  for (let i = 0; i < studentNames.length; i++) {
    const [firstName, lastName] = studentNames[i];
    const cls = classes[Math.floor(i / 2)];
    const sec = sections.find((s) => s.class.toString() === cls._id.toString() && s.name === 'A');

    // Create parent
    const parentUser = await User.create({
      name: `${firstName}'s Parent`,
      email: `parent${i + 1}@springfield.edu`,
      password: 'Parent@1234',
      role: 'parent',
    });
    const parent = await Parent.create({
      user: parentUser._id,
      firstName: `${firstName}`,
      lastName: `${lastName} Sr.`,
      relation: i % 2 === 0 ? 'father' : 'mother',
      phone: `+91-98765${String(i + 1).padStart(5, '0')}`,
      email: `parent${i + 1}@springfield.edu`,
    });
    await User.findByIdAndUpdate(parentUser._id, { profileRef: parent._id, profileModel: 'Parent' });

    // Create student
    const studentUser = await User.create({
      name: `${firstName} ${lastName}`,
      email: `student${i + 1}@springfield.edu`,
      password: 'Student@1234',
      role: 'student',
    });
    const student = await Student.create({
      user: studentUser._id,
      admissionNumber: `ADM2024${String(i + 1).padStart(4, '0')}`,
      rollNumber: String(i + 1),
      firstName,
      lastName,
      dateOfBirth: new Date(2010 + Math.floor(i / 4), i % 12, 15),
      gender: i % 2 === 0 ? 'male' : 'female',
      class: cls._id,
      section: sec._id,
      academicYear: ACADEMIC_YEAR,
      parents: [parent._id],
      status: 'active',
      address: { street: `${i + 1} Main St`, city: 'Springfield', state: 'Maharashtra', pincode: '400001' },
    });

    parent.students = [student._id];
    await parent.save();
    await User.findByIdAndUpdate(studentUser._id, { profileRef: student._id, profileModel: 'Student' });
  }
  console.log('✅ Students & Parents created');

  // ============ Books ============
  const bookData = [
    { title: 'Mathematics Class 10', author: 'R.D. Sharma', isbn: '978-0001', category: 'Textbook', subject: 'Mathematics', totalCopies: 20, availableCopies: 20 },
    { title: 'English Grammar', author: 'Wren & Martin', isbn: '978-0002', category: 'Reference', subject: 'English', totalCopies: 15, availableCopies: 15 },
    { title: 'Science NCERT Class 9', author: 'NCERT', isbn: '978-0003', category: 'Textbook', subject: 'Science', totalCopies: 25, availableCopies: 25 },
    { title: 'History of India', author: 'Romila Thapar', isbn: '978-0004', category: 'Reference', subject: 'Social Studies', totalCopies: 10, availableCopies: 10 },
    { title: 'Computer Fundamentals', author: 'P.K. Sinha', isbn: '978-0005', category: 'Textbook', subject: 'Computer Science', totalCopies: 12, availableCopies: 12 },
  ];
  await Book.insertMany(bookData);
  console.log('✅ Books created');

  // ============ Notice ============
  const adminUserDoc = await User.findOne({ role: 'admin' });
  await Notice.insertMany([
    { title: 'Welcome to New Academic Year 2024-25', content: 'Dear students and parents, welcome to the new academic year. Classes commence from 1st April 2024.', category: 'general', targetAudience: ['all'], isPublished: true, publishDate: new Date(), priority: 'high', createdBy: adminUserDoc._id },
    { title: 'Annual Sports Day', content: 'Annual Sports Day will be held on 15th December 2024. All students must participate.', category: 'event', targetAudience: ['all'], isPublished: true, publishDate: new Date(), priority: 'medium', createdBy: adminUserDoc._id },
    { title: 'Fee Payment Reminder', content: 'Last date for fee payment is 10th of every month. Late fee will be charged after the due date.', category: 'fee', targetAudience: ['parents', 'students'], isPublished: true, publishDate: new Date(), priority: 'high', createdBy: adminUserDoc._id },
  ]);
  console.log('✅ Notices created');

  // ============ Vehicle & Transport ============
  const vehicle = await Vehicle.create({
    registrationNumber: 'MH01AB1234',
    type: 'bus',
    model: 'Tata Starbus',
    make: 'Tata',
    year: 2022,
    capacity: 40,
    fuelType: 'diesel',
    isActive: true,
  });

  await Transport.create({
    routeName: 'North Zone',
    routeNumber: 'RT001',
    stops: [
      { stopName: 'City Center', pickupTime: '7:00 AM', dropTime: '4:00 PM', fare: 800, order: 1 },
      { stopName: 'Market Road', pickupTime: '7:15 AM', dropTime: '3:45 PM', fare: 700, order: 2 },
      { stopName: 'School Gate', pickupTime: '7:30 AM', dropTime: '3:30 PM', fare: 0, order: 3 },
    ],
    vehicle: vehicle._id,
    isActive: true,
  });
  console.log('✅ Transport created');

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('═'.repeat(60));
  console.log('Default Login Credentials:');
  console.log('─'.repeat(60));
  console.log('Admin       | admin@springfield.edu     | Admin@1234');
  console.log('Principal   | principal@springfield.edu | Principal@1234');
  console.log('Accountant  | accountant@springfield.edu| Account@1234');
  console.log('Librarian   | librarian@springfield.edu | Library@1234');
  console.log('Teacher 1   | anita@springfield.edu     | Teacher@1234');
  console.log('Student 1   | student1@springfield.edu  | Student@1234');
  console.log('Parent 1    | parent1@springfield.edu   | Parent@1234');
  console.log('═'.repeat(60));

  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
