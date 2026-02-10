import { storage } from "./storage";
import { hashPassword } from "./auth";

export async function seed() {
  const existingUser = await storage.getUserByUsername("him@example.com");
  if (existingUser) return;

  console.log("Seeding database...");

  const himPassword = await hashPassword(process.env.SEED_HIM_PASSWORD || "him123");
  const herPassword = await hashPassword(process.env.SEED_HER_PASSWORD || "her123");

  // Create Users
  const him = await storage.createUser({
    email: "him@example.com",
    name: "Alex",
    password: himPassword,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
  });

  const her = await storage.createUser({
    email: "her@example.com",
    name: "Sam",
    password: herPassword,
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam"
  });

  // Create Couple Workspace
  const inviteCode = "LOVE24";
  const couple = await storage.createCouple(inviteCode);

  // Add Members
  await storage.addCoupleMember(him.id, couple.id, "admin");
  await storage.addCoupleMember(her.id, couple.id, "member");

  // Create Todos
  await storage.createTodo({
    coupleId: couple.id,
    title: "Plan our anniversary dinner",
    description: "Look for romantic Italian restaurants downtown",
    status: "pending",
    priority: "high",
    dueDate: new Date(Date.now() + 86400000 * 7), // 1 week
    assignedTo: "both",
    createdBy: him.id
  });

  await storage.createTodo({
    coupleId: couple.id,
    title: "Buy groceries for the week",
    description: "Milk, eggs, bread, and some snacks",
    status: "pending",
    priority: "medium",
    dueDate: new Date(Date.now() + 86400000 * 2), // 2 days
    assignedTo: "him",
    createdBy: her.id
  });

  const completed = await storage.createTodo({
    coupleId: couple.id,
    title: "Book flight tickets",
    description: "Summer vacation to Bali",
    status: "completed",
    priority: "high",
    assignedTo: "her",
    createdBy: him.id
  });

  // Create Comments
  await storage.createComment({
    todoId: completed.id,
    userId: her.id,
    content: "Done! I got the window seats :)"
  });

  // Log Activity
  await storage.logActivity({
    coupleId: couple.id,
    userId: him.id,
    action: "create_todo",
    details: "Created task: Plan our anniversary dinner"
  });
  
  await storage.logActivity({
    coupleId: couple.id,
    userId: her.id,
    action: "join_couple",
    details: "Joined the workspace"
  });

  console.log("Seeding completed!");
}
