import { emitEvent } from "./emitEvent";

export const emitTaskAssigned = async ({
  transactionId,
  taskId,
  assignee,
  actorRole,
  actorId,
}: {
  transactionId: string;
  taskId: string;
  assignee: string;
  actorRole: string;
  actorId: string;
}) => {
  await emitEvent({
    transactionId,
    type: "task.assigned",
    actorRole,
    actorId,
    payload: {
      taskId,
      assignee,
    },
  });
};
