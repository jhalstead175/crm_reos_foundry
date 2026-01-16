import { emitEvent } from "./emitEvent";

export const emitTaskCompleted = async ({
  transactionId,
  taskId,
  actorRole,
  actorId,
}: {
  transactionId: string;
  taskId: string;
  actorRole: string;
  actorId: string;
}) => {
  await emitEvent({
    transactionId,
    type: "task.completed",
    actorRole,
    actorId,
    payload: {
      taskId,
    },
  });
};
