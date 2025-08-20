/**
 * Task MongoDB model
 * Implements the data persistence layer for Task entities
 */
import mongoose, { Schema, Document } from 'mongoose';
import { ITask, TaskStatus, TaskPriority } from '../entities/task.entity';

/**
 * Task document interface
 * Extends both Mongoose Document and Task entity interface
 */
export interface ITaskDocument extends Omit<ITask, 'id'>, Document {
  // This resolves the conflict between ITask.id and Document._id
}

/**
 * Task schema definition
 * Defines the MongoDB schema for tasks
 */
const TaskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    dueDate: {
      type: Date,
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    toJSON: {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      transform: (_doc, ret) => {
        // Create a new object with all properties
        const record: Record<string, unknown> = {};
        
        // Copy all properties except _id and __v
        Object.keys(ret).forEach(key => {
          if (key !== '_id' && key !== '__v') {
            // Use type assertion to avoid index signature error
            record[key] = (ret as Record<string, unknown>)[key];
          }
        });
        
        // Add id property based on _id
        if (ret._id) {
          record.id = ret._id.toString();
        }
        
        return record;
      },
    },
  }
);

/**
 * Index definition for improved query performance
 * Creates indexes on commonly queried fields
 */
TaskSchema.index({ createdBy: 1 }); // Index for tasks by creator
TaskSchema.index({ assigneeId: 1 }); // Index for tasks by assignee
TaskSchema.index({ status: 1 }); // Index for tasks by status
TaskSchema.index({ priority: 1 }); // Index for tasks by priority
TaskSchema.index({ dueDate: 1 }); // Index for tasks by due date

/**
 * Swagger documentation for Task model
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - createdBy
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID of the task
 *         title:
 *           type: string
 *           description: Task title
 *         description:
 *           type: string
 *           description: Detailed task description
 *         status:
 *           type: string
 *           enum: [todo, in-progress, done]
 *           description: Current status of the task
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           description: Priority level of the task
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Due date for the task
 *         assigneeId:
 *           type: string
 *           description: ID of the user assigned to the task
 *         createdBy:
 *           type: string
 *           description: ID of the user who created the task
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the task was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the task was last updated
 */

// Create and export the Task model
export default mongoose.model<ITaskDocument>('Task', TaskSchema);
