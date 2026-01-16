import { emitEvent } from "./emitEvent";

export const emitTaskDueDateSet = async ({
  transactionId,
  taskId,
  dueDate,
  actorRole,
  actorId,
}: {
  transactionId: string;
  taskId: string;
  dueDate: string;
  actorRole: string;
  actorId: string;
}) => {
  await emitEvent({
    transactionId,
    type: "task.due_date_set",
    actorRole,
    actorId,
    payload: {
      taskId,
      dueDate,
    },
  });
};
