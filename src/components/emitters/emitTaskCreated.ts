import { emitEvent } from "./emitEvent";

export const emitTaskCreated = async ({
  transactionId,
  taskId,
  title,
  actorRole,
  actorId,
}: {
  transactionId: string;
  taskId: string;
  title: string;
  actorRole: string;
  actorId: string;
}) => {
  await emitEvent({
    transactionId,
    type: "task.created",
    actorRole,
    actorId,
    payload: {
      taskId,
      title,
    },
  });
};
