import { PrismaClient } from "@prisma/client";
import { redactText, maskEmail } from "../utils/redaction.js";

type LatestUser = {
  createdAt: Date;
  email: string;
  id: string;
};

type LatestWorkout = {
  createdAt: Date;
  date: Date;
  duration: number;
  id: string;
  userId: string;
};

export async function dbSummary() {
  if (!process.env.DATABASE_URL) {
    return {
      available: false,
      reason: "DATABASE_URL absent de l'environnement MCP.",
    };
  }

  const prisma = new PrismaClient();

  try {
    const [
      usersCount,
      exercisesCount,
      workoutsCount,
      setsCount,
      latestUsers,
      latestWorkouts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.exercise.count(),
      prisma.workout.count(),
      prisma.workoutSet.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: { createdAt: true, email: true, id: true },
        take: 3,
      }),
      prisma.workout.findMany({
        orderBy: { createdAt: "desc" },
        select: { createdAt: true, date: true, duration: true, id: true, userId: true },
        take: 5,
      }),
    ]);

    const redactedUsers = (latestUsers as LatestUser[]).map((user) => ({
      createdAt: user.createdAt.toISOString(),
      email: maskEmail(user.email),
      id: user.id,
    }));

    const redactedWorkouts = (latestWorkouts as LatestWorkout[]).map(
      (workout) => ({
        createdAt: workout.createdAt.toISOString(),
        date: workout.date.toISOString(),
        duration: workout.duration,
        id: workout.id,
        userId: workout.userId,
      }),
    );

    return {
      available: true,
      counts: {
        exercises: exercisesCount,
        sets: setsCount,
        users: usersCount,
        workouts: workoutsCount,
      },
      latestUsers: redactedUsers,
      latestWorkouts: redactedWorkouts,
    };
  } catch (error: unknown) {
    return {
      available: false,
      reason: redactText(error instanceof Error ? error.message : String(error)),
    };
  } finally {
    await prisma.$disconnect();
  }
}
