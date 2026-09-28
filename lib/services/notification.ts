import prisma from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export interface SendNotificationOptions {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  sendEmail?: boolean;
  recipientEmail?: string;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Pluggable Email Provider interface
 */
export interface EmailProvider {
  send(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

/**
 * Console/Dev Email Provider
 */
export class ConsoleEmailProvider implements EmailProvider {
  async send(message: EmailMessage) {
    console.log(`[EMAIL DISPATCH] To: ${message.to} | Subject: ${message.subject}`);
    console.log(`[EMAIL BODY]: ${message.text || message.html}`);
    return { success: true, messageId: `mock-${Date.now()}` };
  }
}

/**
 * Factory for email provider based on environment configuration
 */
export function getEmailProvider(): EmailProvider {
  const providerType = process.env.EMAIL_PROVIDER || "console";
  switch (providerType) {
    case "smtp":
      // In production, an SMTP/SendGrid/SES provider is plugged in here
      return new ConsoleEmailProvider();
    default:
      return new ConsoleEmailProvider();
  }
}

/**
 * Central Notification Service
 */
export class NotificationService {
  private emailProvider: EmailProvider;

  constructor() {
    this.emailProvider = getEmailProvider();
  }

  /**
   * Dispatch an in-app notification and optionally an email
   */
  async notify(options: SendNotificationOptions) {
    const { userId, title, message, type = NotificationType.INFO, link, sendEmail, recipientEmail } = options;

    try {
      // 1. Create In-App Notification
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          link,
        },
      });

      // 2. Dispatch Email if requested
      if (sendEmail && recipientEmail) {
        await this.emailProvider.send({
          to: recipientEmail,
          subject: title,
          html: `<div style="font-family:sans-serif;padding:20px;border-top:4px solid #dc2626;">
                  <h2>${title}</h2>
                  <p>${message}</p>
                  ${link ? `<p><a href="${link}" style="background:#dc2626;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block;">View Details</a></p>` : ""}
                  <p style="color:#64748b;font-size:12px;margin-top:30px;">BloodLife Donation Portal — Every drop counts.</p>
                </div>`,
          text: `${title}\n\n${message}\n\n${link ? `Link: ${link}` : ""}`,
        });
      }

      return notification;
    } catch (error) {
      console.error("Failed to dispatch notification:", error);
      return null;
    }
  }

  /**
   * Notify admins about an event (e.g. pending donor registration, urgent blood request)
   */
  async notifyAdmins(title: string, message: string, link?: string) {
    try {
      const adminUsers = await prisma.user.findMany({
        where: {
          userRoles: {
            some: {
              role: {
                name: { in: ["SUPER_ADMIN", "ADMIN"] },
              },
            },
          },
        },
        select: { id: true, email: true },
      });

      for (const admin of adminUsers) {
        await this.notify({
          userId: admin.id,
          title,
          message,
          type: NotificationType.ALERT,
          link,
          sendEmail: false,
        });
      }
    } catch (error) {
      console.error("Failed to notify admins:", error);
    }
  }
}

export const notificationService = new NotificationService();
