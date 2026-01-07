import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Service } from '../entities/service.entity';
import { Home } from '../entities/home.entity';
import { Task, TaskStatus } from '../entities/task.entity';
import { TaskAssignment } from '../entities/task-assignment.entity';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { InvoiceItem } from '../entities/invoice-item.entity';
import { TaskTimeline } from '../entities/task-timeline.entity';
import { TaskFile } from '../entities/task-file.entity';
import { TaskReport } from '../entities/task-report.entity';

const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'homecare_db',
    entities: [User, Category, Service, Home, Task, TaskAssignment, Invoice, InvoiceItem, TaskTimeline, TaskFile, TaskReport],
    synchronize: true,
});

async function seed() {
    await dataSource.initialize();

    console.log('🌱 Seeding database...');

    const userRepo = dataSource.getRepository(User);
    const categoryRepo = dataSource.getRepository(Category);
    const serviceRepo = dataSource.getRepository(Service);
    const homeRepo = dataSource.getRepository(Home);
    const taskRepo = dataSource.getRepository(Task);
    const assignmentRepo = dataSource.getRepository(TaskAssignment);
    const invoiceRepo = dataSource.getRepository(Invoice);
    const invoiceItemRepo = dataSource.getRepository(InvoiceItem);
    const timelineRepo = dataSource.getRepository(TaskTimeline);

    // Create users
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    const admin = userRepo.create({
        email: 'admin@homecare.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        phone: '555-0100',
    });
    await userRepo.save(admin);

    const client = userRepo.create({
        email: 'client@homecare.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CLIENT,
        phone: '555-0101',
    });
    await userRepo.save(client);

    const contractor = userRepo.create({
        email: 'contractor@homecare.com',
        password: hashedPassword,
        firstName: 'Mike',
        lastName: 'Smith',
        role: UserRole.CONTRACTOR,
        phone: '555-0102',
    });
    await userRepo.save(contractor);

    console.log('✅ Users created');

    // Create categories
    const standardServices = categoryRepo.create({
        name: 'Standard Services',
        description: 'Regular maintenance services',
        icon: 'wrench',
    });
    await categoryRepo.save(standardServices);

    const homeMaintenance = categoryRepo.create({
        name: 'Home Maintenance',
        description: 'General home upkeep and improvements',
        icon: 'home',
    });
    await categoryRepo.save(homeMaintenance);

    console.log('✅ Categories created');

    // Create services
    const services = [
        {
            categoryId: standardServices.id,
            name: 'AC Maintenance',
            description: 'Complete air conditioning system inspection, cleaning, and maintenance',
            estimatedDuration: 120,
            basePrice: 150,
        },
        {
            categoryId: standardServices.id,
            name: 'Water Filter Maintenance',
            description: 'Filter replacement and water quality testing',
            estimatedDuration: 60,
            basePrice: 75,
        },
        {
            categoryId: standardServices.id,
            name: 'Heating System Maintenance',
            description: 'Furnace inspection, cleaning, and efficiency check',
            estimatedDuration: 90,
            basePrice: 120,
        },
        {
            categoryId: standardServices.id,
            name: 'Fire Detector Maintenance',
            description: 'Smoke and carbon monoxide detector testing and battery replacement',
            estimatedDuration: 45,
            basePrice: 50,
        },
        {
            categoryId: standardServices.id,
            name: 'Roof Maintenance',
            description: 'Roof inspection, minor repairs, and gutter cleaning',
            estimatedDuration: 180,
            basePrice: 250,
        },
        {
            categoryId: standardServices.id,
            name: 'Gutter Maintenance',
            description: 'Gutter cleaning and downspout inspection',
            estimatedDuration: 90,
            basePrice: 100,
        },
        {
            categoryId: homeMaintenance.id,
            name: 'Seasonal Checkups',
            description: 'Comprehensive seasonal home inspection and preparation',
            estimatedDuration: 180,
            basePrice: 200,
        },
        {
            categoryId: homeMaintenance.id,
            name: 'General Upkeep',
            description: 'Minor repairs, touch-ups, and general maintenance',
            estimatedDuration: 120,
            basePrice: 100,
        },
        {
            categoryId: homeMaintenance.id,
            name: 'Deep Cleaning & Organization',
            description: 'Thorough cleaning and organization services',
            estimatedDuration: 240,
            basePrice: 180,
        },
        {
            categoryId: homeMaintenance.id,
            name: 'Outdoor & Garden Care',
            description: 'Lawn maintenance, gardening, and outdoor area upkeep',
            estimatedDuration: 150,
            basePrice: 130,
        },
        {
            categoryId: homeMaintenance.id,
            name: 'Safety & Efficiency Upgrades',
            description: 'Home safety improvements and energy efficiency upgrades',
            estimatedDuration: 180,
            basePrice: 220,
        },
    ];

    const savedServices = [];
    for (const serviceData of services) {
        const service = serviceRepo.create(serviceData);
        const saved = await serviceRepo.save(service);
        savedServices.push(saved);
    }

    console.log('✅ Services created');

    // Create homes for client
    const home1 = homeRepo.create({
        userId: client.id,
        address: '123 Main Street',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        isDefault: true,
        notes: 'Primary residence',
    });
    await homeRepo.save(home1);

    const home2 = homeRepo.create({
        userId: client.id,
        address: '456 Oak Avenue',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62702',
        isDefault: false,
        notes: 'Vacation home',
    });
    await homeRepo.save(home2);

    console.log('✅ Homes created');

    // Create sample tasks
    const task1 = taskRepo.create({
        clientId: client.id,
        serviceId: savedServices[0].id, // AC Maintenance
        homeId: home1.id,
        status: TaskStatus.COMPLETED,
        preferredStartDate: new Date('2026-01-01'),
        preferredEndDate: new Date('2026-01-05'),
        proposedDate: new Date('2026-01-03'),
        proposedTime: '10:00',
        approvedDate: new Date('2026-01-02'),
        completedDate: new Date('2026-01-03'),
        clientNotes: 'AC making strange noises',
    });
    await taskRepo.save(task1);

    const assignment1 = assignmentRepo.create({
        taskId: task1.id,
        contractorId: contractor.id,
        assignedBy: admin.id,
    });
    await assignmentRepo.save(assignment1);

    const invoice1 = invoiceRepo.create({
        taskId: task1.id,
        clientId: client.id,
        totalAmount: 175,
        status: InvoiceStatus.PAID,
        paidAt: new Date('2026-01-04'),
    });
    await invoiceRepo.save(invoice1);

    const invoiceItem1 = invoiceItemRepo.create({
        invoiceId: invoice1.id,
        description: 'AC Maintenance Service',
        quantity: 1,
        unitPrice: 150,
        amount: 150,
    });
    await invoiceItemRepo.save(invoiceItem1);

    const invoiceItem2 = invoiceItemRepo.create({
        invoiceId: invoice1.id,
        description: 'Replacement Filter',
        quantity: 1,
        unitPrice: 25,
        amount: 25,
    });
    await invoiceItemRepo.save(invoiceItem2);

    // Task 2 - Awaiting approval
    const task2 = taskRepo.create({
        clientId: client.id,
        serviceId: savedServices[4].id, // Roof Maintenance
        homeId: home1.id,
        status: TaskStatus.PROPOSED,
        preferredStartDate: new Date('2026-01-10'),
        preferredEndDate: new Date('2026-01-15'),
        proposedDate: new Date('2026-01-12'),
        proposedTime: '09:00',
        clientNotes: 'Need roof inspection before winter',
    });
    await taskRepo.save(task2);

    const assignment2 = assignmentRepo.create({
        taskId: task2.id,
        contractorId: contractor.id,
        assignedBy: admin.id,
    });
    await assignmentRepo.save(assignment2);

    // Task 3 - Requested
    const task3 = taskRepo.create({
        clientId: client.id,
        serviceId: savedServices[1].id, // Water Filter
        homeId: home1.id,
        status: TaskStatus.REQUESTED,
        preferredStartDate: new Date('2026-01-20'),
        preferredEndDate: new Date('2026-01-25'),
        clientNotes: 'Regular filter replacement',
    });
    await taskRepo.save(task3);

    console.log('✅ Tasks and invoices created');

    // Create timeline entries
    await timelineRepo.save([
        {
            taskId: task1.id,
            performedBy: client.id,
            action: 'Task created',
            details: 'Client requested service',
        },
        {
            taskId: task1.id,
            performedBy: admin.id,
            action: 'Contractor assigned',
            details: 'Contractor assigned to task',
        },
        {
            taskId: task1.id,
            performedBy: contractor.id,
            action: 'Schedule proposed',
            details: 'Proposed date: 2026-01-03 at 10:00',
        },
        {
            taskId: task1.id,
            performedBy: client.id,
            action: 'Schedule approved',
            details: 'Client approved the proposed schedule',
        },
        {
            taskId: task1.id,
            performedBy: contractor.id,
            action: 'Task completed',
            details: 'Service completed successfully',
        },
    ]);

    console.log('✅ Timeline entries created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📧 Demo accounts:');
    console.log('   Admin:      admin@homecare.com / Password123!');
    console.log('   Client:     client@homecare.com / Password123!');
    console.log('   Contractor: contractor@homecare.com / Password123!');

    await dataSource.destroy();
}

seed().catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
});
